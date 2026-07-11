import { NextResponse } from 'next/server';
import { createSupabaseContext } from '@/lib/supabase/context';

type RouteContext = { params: Promise<{ username: string }> };

const articleSelect = 'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, like_count, comment_count, share_count, published_at, tags, category:categories!category_id(name, slug), author:users!author_id(id, first_name, last_name, username, avatar_url)';

type RawArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  reading_time_minutes?: number | null;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  published_at?: string | null;
  tags?: string | string[];
  category?: { name: string; slug: string } | null;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    avatar_url?: string | null;
  } | null;
};

function normalizeArticle(a: RawArticle | null) {
  if (!a) return null;
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? null,
    coverImageUrl: a.cover_image_url ?? null,
    readingTimeMinutes: a.reading_time_minutes ?? null,
    viewCount: a.view_count ?? 0,
    likeCount: a.like_count ?? 0,
    commentCount: a.comment_count ?? 0,
    shareCount: a.share_count ?? 0,
    publishedAt: a.published_at ?? null,
    tags: a.tags ?? [],
    category: a.category ? { name: a.category.name, slug: a.category.slug } : null,
    author: a.author
      ? {
          id: a.author.id,
          firstName: a.author.first_name,
          lastName: a.author.last_name,
          username: a.author.username,
          avatarUrl: a.author.avatar_url ?? null,
        }
      : null,
  };
}

async function fetchArticlesByType(sb: any, type: string, userId: string) {
  let rows: { article?: RawArticle | RawArticle[] | null }[] = [];

  if (type === 'saved') {
    const { data } = await sb
      .from('article_saves')
      .select(`created_at, article:articles!article_id(${articleSelect})`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(12);
    rows = data || [];
  } else if (type === 'liked') {
    const { data } = await sb
      .from('article_likes')
      .select(`created_at, article:articles!article_id(${articleSelect})`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(12);
    rows = data || [];
  } else if (type === 'comments' || type === 'history') {
    const table = type === 'comments' ? 'comments' : 'reading_sessions';
    const { data } = await sb
      .from(table)
      .select(`created_at, article:articles!article_id(${articleSelect})`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    const seen = new Set<string>();
    const deduped: { article?: RawArticle | null }[] = [];
    (data || []).forEach((r: { article?: RawArticle | null }) => {
      const art = Array.isArray(r.article) ? r.article[0] : r.article;
      if (art && !seen.has(art.id)) {
        seen.add(art.id);
        deduped.push({ article: art });
      }
    });
    rows = deduped.slice(0, 12) as { article?: RawArticle | null }[];
  }

  return rows
    .map((r) => {
      const art = Array.isArray(r.article) ? r.article[0] : r.article;
      return normalizeArticle(art as RawArticle | null);
    })
    .filter(Boolean);
}

async function fetchInterests(sb: any, userId: string) {
  const { data } = await sb
    .from('user_interests')
    .select('category:categories!category_id(name, slug, icon)')
    .eq('user_id', userId);
  return (data || [])
    .map((r: { category?: { name: string; slug: string; icon?: string | null } | null }) =>
      r.category ? { name: r.category.name, slug: r.category.slug, icon: r.category.icon ?? null } : null,
    )
    .filter(Boolean);
}

async function fetchFollowing(sb: any, userId: string) {
  const { data } = await sb
    .from('follows')
    .select('user:users!following_id(id, first_name, last_name, username, avatar_url)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data || [])
    .map((r: { user?: { id: string; first_name: string; last_name: string; username: string; avatar_url?: string | null } | null }) => {
      const u = r.user;
      return u
        ? { id: u.id, firstName: u.first_name, lastName: u.last_name, username: u.username, avatarUrl: u.avatar_url ?? null }
        : null;
    })
    .filter(Boolean);
}

async function fetchReadingWeek(sb: any, userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);
  const { data } = await sb
    .from('reading_sessions')
    .select('created_at, duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString());
  const days = Array.from({ length: 7 }, () => ({ totalSeconds: 0, count: 0 }));
  (data || []).forEach((r: { created_at: string; duration_seconds: number }) => {
    const d = new Date(r.created_at);
    const idx = (d.getDay() + 6) % 7;
    days[idx].totalSeconds += r.duration_seconds || 0;
    days[idx].count += 1;
  });
  return days.map((d) => ({ minutes: Math.round(d.totalSeconds / 60), count: d.count }));
}

export async function GET(req: Request, context: RouteContext) {
  const { username } = await context.params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  const validTypes = ['saved', 'liked', 'comments', 'history', 'interests', 'following', 'reading-week'];
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;

  const { data: user } = await sb
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!type) {
    const [saved, liked, comments, history, interests, following, readingWeek] = await Promise.all([
      fetchArticlesByType(sb, 'saved', user.id),
      fetchArticlesByType(sb, 'liked', user.id),
      fetchArticlesByType(sb, 'comments', user.id),
      fetchArticlesByType(sb, 'history', user.id),
      fetchInterests(sb, user.id),
      fetchFollowing(sb, user.id),
      fetchReadingWeek(sb, user.id),
    ]);
    return NextResponse.json({
      saved: { articles: saved },
      liked: { articles: liked },
      comments: { articles: comments },
      history: { articles: history },
      interests,
      following,
      readingWeek,
    });
  }

  if (type === 'interests') {
    return NextResponse.json({ type, interests: await fetchInterests(sb, user.id) });
  }
  if (type === 'following') {
    return NextResponse.json({ type, users: await fetchFollowing(sb, user.id) });
  }
  if (type === 'reading-week') {
    return NextResponse.json({ type, readingWeek: await fetchReadingWeek(sb, user.id) });
  }

  const articles = await fetchArticlesByType(sb, type, user.id);
  return NextResponse.json({ type, articles });
}
