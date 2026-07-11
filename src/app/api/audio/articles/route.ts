import { NextResponse } from 'next/server';
import { createSupabaseContext } from '@/lib/supabase/context';

export async function GET() {
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;

  const { data: audioArticles } = await sb
    .from('article_audio')
    .select('id, article_id, audio_url, duration_seconds, generated_at, article:articles(id, title, slug, cover_image_url, category:categories(name), author:users(first_name, last_name))')
    .order('generated_at', { ascending: false })
    .limit(20);

  const articles = (audioArticles || [])
    .filter((aa: any) => aa.article)
    .map((aa: any) => {
      const article = aa.article;
      const author = article?.author;
      const category = article?.category;
      return {
        id: aa.article_id,
        title: article?.title,
        slug: article?.slug,
        authorName: author ? `${author.first_name} ${author.last_name}` : 'Unknown',
        categoryName: category?.name || 'General',
        durationSeconds: aa.duration_seconds,
        audioUrl: aa.audio_url,
        coverImageUrl: article?.cover_image_url,
      };
    });

  return NextResponse.json({ articles });
}
