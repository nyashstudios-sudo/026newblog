import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createSupabaseContext } from './supabase/context';
import { createAdminClient } from '@supabase/server/core';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export type CurrentUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string | null;
  role: string;
  bio: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data: ctx, error } = await createSupabaseContext({ auth: 'user' });
  if (error || !ctx || !ctx.userClaims) return null;
  const { data: user } = await (ctx.supabase as any)
    .from('users')
    .select('id, email, first_name, last_name, username, avatar_url, role, bio')
    .eq('id', ctx.userClaims.id)
    .single();
  if (!user) return null;
  return user as CurrentUser;
}

function getEnv() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const secret = process.env.SUPABASE_SECRET_KEY!;
  return { url, publishableKeys: { default: key }, secretKeys: { default: secret } };
}

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const { email, password, firstName, lastName } = data;
  const cookieStore = await cookies();
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');
  let username = baseUsername;
  let counter = 0;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { firstName, lastName, username },
      emailRedirectTo: `${siteUrl}/api/auth/callback`,
    },
  });

  if (error) throw new AuthError(error.message, error.status?.toString() || 'AUTH_ERROR');
  if (!authData.user) throw new AuthError('Registration failed', 'REGISTRATION_FAILED');

  // Create default preferences via admin client
  const env = getEnv();
  const admin = createAdminClient({ auth: { keyName: 'default' }, env }) as any;
  await admin.from('notification_preferences').insert({ user_id: authData.user.id }).maybeSingle();
  await admin.from('reading_goals').insert({ user_id: authData.user.id }).maybeSingle();
  await admin.from('reading_streaks').insert({ user_id: authData.user.id, current_streak: 0, longest_streak: 0 }).maybeSingle();

  const emailConfirmed = !!authData.user.email_confirmed_at;

  return {
    id: authData.user.id,
    email: authData.user.email!,
    firstName,
    lastName,
    username,
    role: 'reader' as const,
    emailConfirmed,
  };
}

export async function checkEmailVerification(userId: string): Promise<boolean> {
  const env = getEnv();
  const admin = createAdminClient({ auth: { keyName: 'default' }, env }) as any;
  const { data: user } = await admin.auth.admin.getUserById(userId);
  return !!user?.user?.email_confirmed_at;
}

export async function loginUser(data: z.infer<typeof loginSchema>) {
  const { email, password } = data;
  const cookieStore = await cookies();
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      throw new AuthError('Please verify your email before logging in', 'EMAIL_NOT_CONFIRMED');
    }
    throw new AuthError(error.message, error.status?.toString() || 'INVALID_CREDENTIALS');
  }
  if (!authData.user) throw new AuthError('Login failed', 'LOGIN_FAILED');

  const user = await getCurrentUser();
  return user ?? { id: authData.user.id, email: authData.user.email!, first_name: '', last_name: '', username: '', role: 'reader' as const };
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const cookieStore = await cookies();
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw new AuthError(error.message, error.status?.toString() || 'RESEND_ERROR');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.signOut();
}

export async function verifyPin(userId: string, pin: string): Promise<boolean> {
  const env = getEnv();
  const admin = createAdminClient({ auth: { keyName: 'default' }, env }) as any;
  const { data: userPin } = await admin.from('user_pins').select('pin_hash').eq('user_id', userId).single();
  if (!userPin) throw new AuthError('PIN not set', 'PIN_NOT_SET');
  const valid = await bcrypt.compare(pin, userPin.pin_hash);
  if (!valid) throw new AuthError('Invalid PIN', 'INVALID_PIN');
  return true;
}

export async function setPin(userId: string, pin: string): Promise<void> {
  const pinHash = await bcrypt.hash(pin, 10);
  const env = getEnv();
  const admin = createAdminClient({ auth: { keyName: 'default' }, env }) as any;
  await admin.from('user_pins').upsert({ user_id: userId, pin_hash: pinHash }, { onConflict: 'user_id' });
}

type AuthHandler = (req: Request, user: CurrentUser) => Promise<Response>;

export function requireAuth(handler: AuthHandler) {
  return async (req: Request) => {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return handler(req, user);
  };
}

export function requireRole(roles: string | string[], handler: AuthHandler) {
  return async (req: Request) => {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    return handler(req, user);
  };
}

// Temporary select object for article card queries — will be migrated to Supabase queries
export const articleCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImageUrl: true,
  readingTimeMinutes: true,
  viewCount: true,
  likeCount: true,
  commentCount: true,
  shareCount: true,
  publishedAt: true,
  tags: true,
  category: { select: { name: true, slug: true } },
  author: {
    select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true },
  },
} as const;
