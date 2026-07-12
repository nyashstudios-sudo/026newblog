import { NextResponse } from 'next/server';
import { registerSchema, registerUser, AuthError } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
    if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });
    const sb = ctx.supabaseAdmin as any;
    const { data: regSetting } = await sb.from('platform_settings').select('value').eq('key', 'enable_registration').maybeSingle();
    if (regSetting?.value === false) {
      return NextResponse.json({ error: 'Registration is currently disabled' }, { status: 403 });
    }

    const body = await req.json();
    const data = registerSchema.parse(body);
    const user = await registerUser(data);

    await sb.from('security_events').insert({
        event_type: 'user_registered',
        metadata: { name: `${data.firstName} ${data.lastName}`, severity: 'info' },
        user_id: user.id,
      }).maybeSingle();

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role,
          emailConfirmed: user.emailConfirmed,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
