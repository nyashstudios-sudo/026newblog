import { NextResponse } from 'next/server';
import { requireRole, verifyPin, AuthError } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { initiateB2CPayment } from '@/lib/mpesa';

export const POST = requireRole(['author', 'admin'], async (req, user) => {
  try {
    const { amount, pin, phone } = await req.json();

    if (!amount || !pin || !phone) {
      return NextResponse.json({ error: 'Amount, PIN, and phone required' }, { status: 400 });
    }

    await verifyPin(user.id, pin);

    const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
    if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const sb = ctx.supabaseAdmin as any;

    const { data: settings } = await sb.from('platform_settings')
      .select('value').eq('key', 'withdrawal_threshold_usd').maybeSingle();
    const threshold = Number((settings?.value as { amount?: number })?.amount ?? 50);

    if (amount < threshold) {
      return NextResponse.json({ error: `Minimum withdrawal is $${threshold}` }, { status: 400 });
    }

    const [{ data: earnings }, { data: payouts }] = await Promise.all([
      sb.from('earnings').select('amount_usd').eq('author_id', user.id),
      sb.from('payouts').select('amount_usd').eq('author_id', user.id).in('status', ['completed', 'processing', 'pending']),
    ]);

    const totalEarned = (earnings || []).reduce((sum: number, e: any) => sum + Number(e.amount_usd || 0), 0);
    const totalWithdrawn = (payouts || []).reduce((sum: number, p: any) => sum + Number(p.amount_usd || 0), 0);
    const balance = totalEarned - totalWithdrawn;

    if (amount > balance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const exchangeRate = 129.3;
    const amountKes = amount * exchangeRate;

    const { data: payout } = await sb.from('payouts').insert({
      author_id: user.id,
      amount_usd: amount,
      amount_kes: amountKes,
      exchange_rate: exchangeRate,
      mpesa_phone: phone,
      status: 'processing',
    }).select().single();

    try {
      const mpesaResult = await initiateB2CPayment({
        phone,
        amount: Math.round(amountKes),
        remarks: '026Newsblog Author Payout',
      });

      await sb.from('payouts').update({
        mpesa_transaction_id: mpesaResult.conversationId,
      }).eq('id', payout.id);

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
      await sb.from('payouts').update({
        status: 'failed',
        failed_reason: 'M-Pesa request failed',
      }).eq('id', payout.id);
      return NextResponse.json({ error: 'Payment failed. Please try again.' }, { status: 500 });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
});
