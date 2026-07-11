import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

type RouteContext = { params: Promise<{ username: string }> };

export async function PUT(req: Request, context: RouteContext) {
  const { username } = await context.params;
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (currentUser.username !== username && currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { error: signInError } = await (ctx.supabase as any).auth.signInWithPassword({
    email: currentUser.email,
    password: currentPassword,
  });
  if (signInError) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const { error: updateError } = await (ctx.supabaseAdmin as any).auth.admin.updateUserById(
    currentUser.id,
    { password: newPassword },
  );
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
