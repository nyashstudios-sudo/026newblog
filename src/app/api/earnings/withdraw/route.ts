import { NextResponse } from 'next/server';
import { requireRole, verifyPin, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { initiateB2CPayment } from '@/lib/mpesa';

export const POST = requireRole(['author', 'admin'], async (req, user) => {
  try {
    const { amount, pin, phone } = await req.json();

    if (!amount || !pin || !phone) {
      return NextResponse.json({ error: 'Amount, PIN, and phone required' }, { status: 400 });
    }

    await verifyPin(user.id, pin);

    const settings = await db.platformSetting.findUnique({ where: { key: 'withdrawal_threshold_usd' } });
    const threshold = Number((settings?.value as { amount?: number })?.amount ?? 50);

    if (amount < threshold) {
      return NextResponse.json({ error: `Minimum withdrawal is $${threshold}` }, { status: 400 });
    }

    const [earningsAgg, payoutsAgg] = await Promise.all([
      db.earning.aggregate({ where: { authorId: user.id }, _sum: { amountUsd: true } }),
      db.payout.aggregate({
        where: { authorId: user.id, status: { in: ['completed', 'processing', 'pending'] } },
        _sum: { amountUsd: true },
      }),
    ]);

    const balance = Number(earningsAgg._sum.amountUsd || 0) - Number(payoutsAgg._sum.amountUsd || 0);
    if (amount > balance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const exchangeRate = 129.3;
    const amountKes = amount * exchangeRate;

    const payout = await db.payout.create({
      data: {
        authorId: user.id,
        amountUsd: amount,
        amountKes,
        exchangeRate,
        mpesaPhone: phone,
        status: 'processing',
      },
    });

    try {
      const mpesaResult = await initiateB2CPayment({
        phone,
        amount: Math.round(amountKes),
        remarks: '026Newsblog Author Payout',
      });

      await db.payout.update({
        where: { id: payout.id },
        data: { mpesaTransactionId: mpesaResult.conversationId },
      });

      return NextResponse.json({
        payout: {
          id: payout.id,
          amountUsd: amount,
          amountKes,
          phone,
          status: 'processing',
          transactionId: `TXN-${payout.id.slice(0, 12).toUpperCase()}`,
        },
      });
    } catch {
      await db.payout.update({
        where: { id: payout.id },
        data: { status: 'failed', failedReason: 'M-Pesa request failed' },
      });
      return NextResponse.json({ error: 'Payment failed. Please try again.' }, { status: 500 });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
});
