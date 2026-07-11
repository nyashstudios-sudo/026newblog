import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireRole('admin', async () => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: items } = await (ctx.supabaseAdmin as any)
    .from('moderation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ items: items || [] });
});

export const PATCH = requireRole('admin', async (req, admin) => {
  const { id, action } = await req.json();

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: item } = await sb.from('moderation_queue').select('*').eq('id', id).single();
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await sb.from('moderation_queue').update({
    status: action === 'approve' ? 'approved' : 'rejected',
    moderated_by: admin.id,
    moderated_at: new Date().toISOString(),
    action_taken: action,
  }).eq('id', id);

  if (item.type === 'comment') {
    await sb.from('comments').update({
      moderation_status: action === 'approve' ? 'approved' : 'rejected',
    }).eq('id', item.content_id);
  }

  return NextResponse.json({ success: true });
});
