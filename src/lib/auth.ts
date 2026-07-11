import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars'
);
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const COOKIE_NAME = '026nb_session';
const REFRESH_COOKIE = '026nb_refresh';

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

export async function createAccessToken(userId: string, role: string) {
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function createRefreshToken(userId: string) {
  return new SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub: string; role?: string; type?: string };
  } catch {
    return null;
  }
}

export async function setAuthCookies(userId: string, role: string) {
  const accessToken = await createAccessToken(userId, role);
  const refreshToken = await createRefreshToken(userId);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  await db.session.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  return db.user.findUnique({
    where: { id: payload.sub, isActive: true },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      avatarUrl: true,
      role: true,
      bio: true,
    },
  });
}

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const { email, password, firstName, lastName } = data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new AuthError('Email already registered', 'EMAIL_EXISTS');

  const passwordHash = await bcrypt.hash(password, 12);
  const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');
  let username = baseUsername;
  let counter = 0;
  while (await db.user.findUnique({ where: { username } })) {
    counter++;
    username = `${baseUsername}${counter}`;
  }

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      username,
      role: 'reader',
      notificationPreferences: { create: {} },
      readingGoals: { create: {} },
      readingStreak: { create: { currentStreak: 0, longestStreak: 0 } },
    },
  });

  return user;
}

export async function loginUser(data: z.infer<typeof loginSchema>) {
  const { email, password } = data;
  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw new AuthError('Account deactivated', 'ACCOUNT_DEACTIVATED');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await db.securityEvent.create({
      data: { userId: user.id, eventType: 'login_failed', metadata: { email } },
    });
    throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return user;
}

export async function verifyPin(userId: string, pin: string) {
  const userPin = await db.userPin.findUnique({ where: { userId } });
  if (!userPin) throw new AuthError('PIN not set', 'PIN_NOT_SET');
  const valid = await bcrypt.compare(pin, userPin.pinHash);
  if (!valid) throw new AuthError('Invalid PIN', 'INVALID_PIN');
  return true;
}

export async function setPin(userId: string, pin: string) {
  const pinHash = await bcrypt.hash(pin, 10);
  await db.userPin.upsert({
    where: { userId },
    update: { pinHash },
    create: { userId, pinHash },
  });
}

type AuthHandler = (req: Request, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<Response>;

export function requireAuth(handler: AuthHandler) {
  return async (req: Request) => {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return handler(req, user);
  };
}

export function requireRole(roles: string | string[], handler: AuthHandler) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return async (req: Request) => {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    return handler(req, user);
  };
}

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
