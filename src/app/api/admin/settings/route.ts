import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

const DEFAULT_SETTINGS = {
  revenue_share_pct: { author: 70, platform: 30 },
  withdrawal_threshold_usd: { amount: 50 },
  site_appearance: { theme: 'default', logoUrl: null },
  moderation: { autoFlag: true, requireReview: false },
};

export const GET = requireRole('admin', async () => {
  const settings = await db.platformSetting.findMany();
  const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };

  settings.forEach((s) => {
    result[s.key] = s.value;
  });

  return NextResponse.json({ settings: result });
});

export const PATCH = requireRole('admin', async (req, admin) => {
  const body = await req.json();

  const updates = Object.entries(body).filter(([key]) =>
    ['revenue_share_pct', 'withdrawal_threshold_usd', 'site_appearance', 'moderation'].includes(key)
  );

  await Promise.all(
    updates.map(([key, value]) =>
      db.platformSetting.upsert({
        where: { key },
        update: { value: value as object, updatedBy: admin.id },
        create: { key, value: value as object, updatedBy: admin.id },
      })
    )
  );

  return NextResponse.json({ success: true });
});
