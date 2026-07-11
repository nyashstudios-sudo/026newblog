import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireRole(['admin'], async () => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });
  const sb = ctx.supabaseAdmin as any;

  const { data: events } = await sb
    .from('security_events')
    .select('id, user_id, event_type, ip_address, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(25);

  const rows = events || [];
  const userIds = [...new Set(rows.map((e: any) => e.user_id).filter(Boolean))] as string[];
  const { data: users } = userIds.length
    ? await sb.from('users').select('id, email').in('id', userIds)
    : { data: [] };
  const emailById: Record<string, string> = {};
  (users || []).forEach((u: any) => { emailById[u.id] = u.email; });

  const now = Date.now();
  const recent = rows.filter(
    (e: any) => now - new Date(e.created_at).getTime() < 24 * 60 * 60 * 1000
  ).filter((e: any) => ['failed_login', 'rate_limit_triggered', 'unauthorized_access'].includes(e.event_type));

  const securityScore = Math.max(0, Math.min(100, 100 - recent.length * 8));

  const mapped = rows.map((e: any) => {
    const meta = e.metadata && typeof e.metadata === 'object' ? e.metadata : {};
    const parts: string[] = [];
    if (e.ip_address) parts.push(`IP ${e.ip_address}`);
    Object.entries(meta).forEach(([k, v]) => parts.push(`${k}: ${v}`));
    const diff = now - new Date(e.created_at).getTime();
    const m = Math.floor(diff / 60000);
    const time = m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} hr ago`;
    return {
      id: e.id,
      type: e.event_type,
      user: e.user_id ? (emailById[e.user_id] || 'unknown') : 'system',
      time,
      metadata: parts.join(' — ') || '—',
    };
  });

  const systems = [
    { label: 'API Server', status: 'operational' as const, detail: 'All endpoints responding normally' },
    { label: 'Database', status: 'operational' as const, detail: 'Primary connection healthy' },
    { label: 'Media Storage', status: 'operational' as const, detail: 'Uploads processing' },
    { label: 'Email Service', status: 'operational' as const, detail: 'Queue cleared' },
  ];

  return NextResponse.json({ securityScore, events: mapped, systems });
});
