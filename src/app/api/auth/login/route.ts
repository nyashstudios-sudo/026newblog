import { NextResponse } from 'next/server';
import { loginSchema, loginUser, AuthError } from '@/lib/auth';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);
    const user = await loginUser(data);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const status = error.code === 'EMAIL_NOT_CONFIRMED' ? 403 : 401;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
