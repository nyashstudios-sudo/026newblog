import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { moderateContent } from '@/lib/moderation';
import { emitComment } from '@/lib/socket';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id: articleId } = await context.params;
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;

  const { data: comments } = await sb
    .from('comments')
    .select('*, user:users(id, first_name, last_name, username, avatar_url), replies:comments!parent_id(id, content, created_at, user:users(id, first_name, last_name, username, avatar_url))')
    .is('parent_id', null)
    .eq('article_id', articleId)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false });

  return NextResponse.json({ comments: comments || [] });
}

export async function POST(req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: articleId } = await context.params;
  const body = await req.json();

  const modResult = await moderateContent(body.content);
  const needsReview = modResult.flagged;

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: comment } = await sb.from('comments').insert({
    article_id: articleId,
    user_id: user.id,
    parent_id: body.parentId || null,
    content: body.content,
    moderation_status: needsReview ? 'pending' : 'approved',
  }).select('*, user:users(id, first_name, last_name, username, avatar_url)').single();

  if (!needsReview && comment) {
    await sb.rpc('increment_comment_count', { article_id: articleId });
    emitComment(articleId, comment);
  } else if (needsReview && comment) {
    await sb.from('moderation_queue').insert({
      type: 'comment',
      content_id: comment.id,
      reason: 'AI auto-flagged',
      ai_confidence: modResult.confidence,
      ai_category: modResult.category,
    });
  }

  return NextResponse.json({ comment, needsReview }, { status: 201 });
}
