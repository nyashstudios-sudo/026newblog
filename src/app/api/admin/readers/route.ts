import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireRole(['admin'], async () => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });
  const sb = ctx.supabaseAdmin as any;

  const { data: users } = await sb
    .from('users')
    .select('id, email, first_name, last_name, username, role, is_active, created_at')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = users || [];
  const readers = rows.map((u: any) => ({
    id: u.id,
    firstName: u.first_name || '',
    lastName: u.last_name || '',
    username: u.username || '',
    email: u.email || '',
    isActive: u.is_active ?? true,
    createdAt: u.created_at,
  }));

  return NextResponse.json({ readers });
});
