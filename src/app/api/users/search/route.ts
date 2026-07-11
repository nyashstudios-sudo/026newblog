import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;
  const tsquery = q.split(/\s+/).map((w: string) => w + ':*').join(' & ');

  const { data: users } = await sb.from('users')
    .select('id, first_name, last_name, username, avatar_url')
    .neq('id', user.id)
    .textSearch('username', tsquery, { config: 'english' })
    .limit(20);

  return NextResponse.json({ users: users || [] });
});
