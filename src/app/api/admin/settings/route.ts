import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

const DEFAULT_SETTINGS = {
  revenue_share_pct: { author: 70, platform: 30 },
  withdrawal_threshold_usd: { amount: 50 },
  site_appearance: { theme: 'default', logoUrl: null },
  moderation: { autoFlag: true, requireReview: false },
};

export const GET = requireRole('admin', async () => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: settings } = await (ctx.supabaseAdmin as any)
    .from('platform_settings')
    .select('*');

  const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };

  (settings || []).forEach((s: any) => {
    result[s.key] = s.value;
  });

  return NextResponse.json({ settings: result });
});

export const PATCH = requireRole('admin', async (req, admin) => {
  const body = await req.json();

  const updates = Object.entries(body).filter(([key]) =>
    ['revenue_share_pct', 'withdrawal_threshold_usd', 'site_appearance', 'moderation'].includes(key)
  );

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  await Promise.all(
    updates.map(([key, value]) =>
      sb.from('platform_settings').upsert(
        { key, value: value as object, updated_by: admin.id },
        { onConflict: 'key' },
      )
    )
  );

  return NextResponse.json({ success: true });
});
