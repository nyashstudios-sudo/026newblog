import { NextResponse } from 'next/server';
import { requireAuth, setPin } from '@/lib/auth';

export const POST = requireAuth(async (req, user) => {
  const { pin } = await req.json();

  if (!pin || !/^\d{4,6}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
  }

  await setPin(user.id, pin);
  return NextResponse.json({ success: true });
});
