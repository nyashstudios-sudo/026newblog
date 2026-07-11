import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireRole(['author', 'admin'], async (_req, user) => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const [{ data: earnings }, { data: payouts }, { data: recentEarnings }, { data: recentPayouts }, { data: profile }] = await Promise.all([
    sb.from('earnings').select('amount_usd').eq('author_id', user.id),
    sb.from('payouts').select('amount_usd').eq('author_id', user.id).in('status', ['completed', 'processing', 'pending']),
    sb.from('earnings').select('*, article:articles(id, title, slug)').eq('author_id', user.id).order('created_at', { ascending: false }).limit(10),
    sb.from('payouts').select('*').eq('author_id', user.id).order('created_at', { ascending: false }).limit(10),
    sb.from('author_profiles').select('*').eq('user_id', user.id).maybeSingle(),
  ]);

  const totalEarned = (earnings || []).reduce((sum: number, e: any) => sum + Number(e.amount_usd || 0), 0);
  const totalWithdrawn = (payouts || []).reduce((sum: number, p: any) => sum + Number(p.amount_usd || 0), 0);
  const balance = totalEarned - totalWithdrawn;

  const { data: settings } = await sb.from('platform_settings')
    .select('value').eq('key', 'withdrawal_threshold_usd').maybeSingle();
  const threshold = Number((settings?.value as { amount?: number })?.amount ?? 50);

  return NextResponse.json({
    balance,
    totalEarned,
    totalWithdrawn,
    threshold,
    revenueSharePct: profile?.revenue_share_pct ?? 70,
    recentEarnings: recentEarnings || [],
    recentPayouts: recentPayouts || [],
  });
});
