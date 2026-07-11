import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export async function GET() {
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;

  const [categoriesRes, authorsRes] = await Promise.all([
    sb.from('categories')
      .select('id, name, slug, description, icon, article_count')
      .order('article_count', { ascending: false }),
    sb.from('users')
      .select('id, first_name, last_name, username, avatar_url, bio, author_profiles(display_name, topics)')
      .eq('role', 'author')
      .limit(10),
  ]);

  const categories = (categoriesRes.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon || '📄',
    description: c.description,
    article_count: c.article_count,
  }));

  const popularAuthors = (authorsRes.data || []).map((u: any) => {
    const fp = (u.first_name?.[0] || '').toUpperCase();
    const lp = (u.last_name?.[0] || '').toUpperCase();
    const profile = Array.isArray(u.author_profiles) ? u.author_profiles[0] : u.author_profiles;
    let topicText = '';
    if (profile?.topics) {
      try {
        const parsed = JSON.parse(profile.topics);
        topicText = (Array.isArray(parsed) ? parsed : [profile.topics]).join(' · ');
      } catch {
        topicText = profile.topics;
      }
    }
    return {
      id: u.id,
      name: profile?.display_name || `${u.first_name} ${u.last_name}`,
      initials: fp + lp,
      topic: topicText,
      avatar_url: u.avatar_url,
    };
  });

  return NextResponse.json({ categories, popularAuthors });
}

export const POST = requireAuth(async (req, user) => {
  const body = await req.json();
  const { interests, followIds, notificationPrefs } = body;

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;
  const errors: string[] = [];

  if (interests && Array.isArray(interests)) {
    const { data: cats } = await sb.from('categories').select('id, name');
    const catMap = new Map((cats || []).map((c: any) => [c.name, c.id]));
    const ids = interests.map((n: string) => catMap.get(n)).filter((v): v is string => !!v);

    const { error: delErr } = await sb.from('user_interests').delete().eq('user_id', user.id);
    if (delErr) errors.push(`delete interests: ${delErr.message}`);

    if (ids.length > 0) {
      const rows = ids.map((id: string) => ({ user_id: user.id, category_id: id }));
      const { error: insErr } = await sb.from('user_interests').insert(rows);
      if (insErr) errors.push(`insert interests: ${insErr.message}`);
    }
  }

  if (followIds && Array.isArray(followIds)) {
    const rows = followIds.map((id: string) => ({ follower_id: user.id, following_id: id }));
    if (rows.length > 0) {
      const { error: flwErr } = await sb.from('follows').upsert(rows, { onConflict: 'follower_id,following_id' });
      if (flwErr) errors.push(`follow authors: ${flwErr.message}`);
    }
  }

  if (notificationPrefs) {
    const prefs = {
      user_id: user.id,
      daily_digest: notificationPrefs.dailyDigest ?? true,
      push_notifications: notificationPrefs.pushNotifications ?? true,
      comment_replies: notificationPrefs.commentReplies ?? true,
      weekly_recap: notificationPrefs.weeklyRecap ?? false,
    };
    const { error: prefErr } = await sb.from('notification_preferences').upsert(prefs, { onConflict: 'user_id' });
    if (prefErr) errors.push(`notification prefs: ${prefErr.message}`);
  }

  const { data: existingGoal } = await sb.from('reading_goals').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!existingGoal) {
    const { error: goalErr } = await sb.from('reading_goals').insert({ user_id: user.id }).maybeSingle();
    if (goalErr) errors.push(`reading goals: ${goalErr.message}`);
  }

  const { error: updateErr } = await sb.from('users').update({ updated_at: new Date().toISOString() }).eq('id', user.id);
  if (updateErr) errors.push(`update user: ${updateErr.message}`);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
