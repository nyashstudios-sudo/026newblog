import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireRole('admin', async (req, admin) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const query = (ctx.supabaseAdmin as any)
    .from('author_applications')
    .select(`
      *,
      user:users(id, email, first_name, last_name, username, avatar_url, role)
    `)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query.eq('status', status);
  }

  const { data: applications } = await query;

  return NextResponse.json({ applications });
});

export const PATCH = requireRole('admin', async (req, admin) => {
  const { applicationId, action, rejectionReason } = await req.json();

  if (!applicationId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: appData } = await (ctx.supabaseAdmin as any)
    .from('author_applications')
    .select('*')
    .eq('id', applicationId)
    .single();
  const application: any = appData;

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const sb = ctx.supabaseAdmin as any;

  if (action === 'approve') {
    await sb.from('author_applications').update({
      status: 'approved',
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', applicationId);

    await sb.from('users').update({ role: 'author' }).eq('id', application.user_id);

    await sb.from('author_profiles').upsert(
      { user_id: application.user_id },
      { onConflict: 'user_id', ignoreDuplicates: true },
    );

    await sb.from('notifications').insert({
      user_id: application.user_id,
      type: 'system',
      title: 'Author application approved',
      content: 'Congratulations! You can now publish articles on 026Newsblog.',
    });
  } else {
    await sb.from('author_applications').update({
      status: 'rejected',
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason || 'Application did not meet requirements',
    }).eq('id', applicationId);

    await sb.from('notifications').insert({
      user_id: application.user_id,
      type: 'system',
      title: 'Author application update',
      content: rejectionReason || 'Your author application was not approved at this time.',
    });
  }

  return NextResponse.json({ success: true });
});
