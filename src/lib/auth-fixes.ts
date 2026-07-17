/**
 * AUTH SECURITY FIXES
 * Implements comprehensive authentication improvements and security patches
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { redis } from './redis';

// ============================================
// 1. EMAIL VERIFICATION ENFORCEMENT
// ============================================

export async function enforceEmailVerification(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );

  const { data: user } = await supabase.auth.admin.getUserById(userId);
  
  if (!user?.email_confirmed_at) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  return true;
}

export async function verifyEmailBeforeLogin(email: string): Promise<boolean> {
  if (!redis) return true; // Skip if Redis unavailable

  const key = `email_verify_required:${email}`;
  const isRequired = await redis.get(key);

  if (isRequired === '1') {
    return false; // Email verification required
  }

  return true;
}

// ============================================
// 2. RATE LIMITING FOR PIN & AUTH
// ============================================

export async function checkAuthRateLimit(
  identifier: string,
  type: 'login' | 'register' | 'pin' | 'email_resend',
  maxAttempts = 5,
  windowSeconds = 900
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  if (!redis) return { allowed: true, remaining: maxAttempts, resetAt: 0 };

  const key = `ratelimit:${type}:${identifier}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  const remaining = Math.max(0, maxAttempts - current);
  const ttl = await redis.ttl(key);
  const resetAt = ttl > 0 ? Date.now() + ttl * 1000 : 0;

  return {
    allowed: current <= maxAttempts,
    remaining,
    resetAt,
  };
}

export async function resetRateLimit(identifier: string, type: string): Promise<void> {
  if (!redis) return;
  await redis.del(`ratelimit:${type}:${identifier}`);
}

// ============================================
// 3. CSRF PROTECTION
// ============================================

export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400, // 24 hours
  });

  return token;
}

export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const stored = cookieStore.get('csrf-token')?.value;

  if (!stored || !token) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(stored));
  } catch {
    return false;
  }
}

export function csrfMiddleware(req: Request) {
  const method = req.method.toUpperCase();
  
  // Only validate state-changing requests
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null;
  }

  const csrfToken = req.headers.get('x-csrf-token');
  
  if (!csrfToken) {
    return new Response(JSON.stringify({ error: 'CSRF token missing' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null; // Token will be validated by validateCsrfToken()
}

// ============================================
// 4. SESSION SECURITY
// ============================================

export async function invalidateAllSessions(userId: string): Promise<void> {
  if (!redis) return;

  const key = `sessions:${userId}`;
  await redis.del(key);
}

export async function trackSession(userId: string, sessionId: string, ipAddress: string): Promise<void> {
  if (!redis) return;

  const key = `sessions:${userId}`;
  await redis.sadd(key, `${sessionId}:${ipAddress}`);
  await redis.expire(key, 604800); // 7 days
}

export async function validateSession(userId: string, sessionId: string): Promise<boolean> {
  if (!redis) return true;

  const key = `sessions:${userId}`;
  const sessions = await redis.smembers(key);

  return sessions.some(s => s.startsWith(sessionId));
}

// ============================================
// 5. PASSWORD SECURITY
// ============================================

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

export async function hashPassword(password: string, rounds = 12): Promise<string> {
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

// ============================================
// 6. SECURITY EVENT LOGGING
// ============================================

export async function logSecurityEvent(
  userId: string,
  eventType: string,
  metadata: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );

  await supabase
    .from('security_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      ip_address: ipAddress,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: globalThis.navigator?.userAgent || 'unknown',
        ...metadata,
      },
    })
    .catch(err => console.error('Failed to log security event:', err));
}

// ============================================
// 7. ACCOUNT LOCKOUT MECHANISM
// ============================================

export async function isAccountLocked(userId: string): Promise<boolean> {
  if (!redis) return false;

  const key = `account_locked:${userId}`;
  const locked = await redis.get(key);

  return locked === '1';
}

export async function lockAccount(userId: string, durationMinutes = 30): Promise<void> {
  if (!redis) return;

  const key = `account_locked:${userId}`;
  await redis.setex(key, durationMinutes * 60, '1');
}

export async function unlockAccount(userId: string): Promise<void> {
  if (!redis) return;

  const key = `account_locked:${userId}`;
  await redis.del(key);
}

// ============================================
// 8. SUSPICIOUS ACTIVITY DETECTION
// ============================================

export async function detectSuspiciousLogin(
  userId: string,
  newIpAddress: string
): Promise<boolean> {
  if (!redis) return false;

  const key = `user_ips:${userId}`;
  const knownIps = await redis.smembers(key);

  if (knownIps.length === 0) {
    // First login, store IP
    await redis.sadd(key, newIpAddress);
    await redis.expire(key, 2592000); // 30 days
    return false;
  }

  // Check if IP is new
  const isNewIp = !knownIps.includes(newIpAddress);

  if (isNewIp) {
    // Log suspicious activity
    await logSecurityEvent(userId, 'suspicious_login_new_ip', {
      newIp: newIpAddress,
      knownIps: knownIps.length,
    }, newIpAddress);

    // Store new IP
    await redis.sadd(key, newIpAddress);
    return true;
  }

  return false;
}

// ============================================
// 9. TWO-FACTOR AUTHENTICATION
// ============================================

export async function generateOTP(userId: string, expirySeconds = 300): Promise<string> {
  if (!redis) {
    throw new Error('Redis required for OTP generation');
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const hash = crypto.createHash('sha256').update(otp).digest('hex');

  const key = `otp:${userId}`;
  await redis.setex(key, expirySeconds, hash);

  return otp;
}

export async function verifyOTP(userId: string, otp: string): Promise<boolean> {
  if (!redis) return false;

  const key = `otp:${userId}`;
  const stored = await redis.getdel(key);

  if (!stored) return false;

  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(stored));
}

export default {
  enforceEmailVerification,
  checkAuthRateLimit,
  generateCsrfToken,
  validateCsrfToken,
  trackSession,
  hashPassword,
  verifyPassword,
  logSecurityEvent,
  detectSuspiciousLogin,
  generateOTP,
  verifyOTP,
};
