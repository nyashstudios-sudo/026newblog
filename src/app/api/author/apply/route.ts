import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const POST = requireAuth(async (req, user) => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: existing } = await sb.from('author_applications')
    .select('status').eq('user_id', user.id).maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Application already submitted', status: existing.status }, { status: 409 });
  }

  const body = await req.json();

  const { data: application } = await sb.from('author_applications').insert({
    user_id: user.id,
    professional_title: body.professionalTitle,
    writing_niche: body.writingNiche,
    years_experience: body.yearsExperience,
    portfolio_url: body.portfolioUrl,
    linkedin_url: body.linkedinUrl,
    motivation: body.motivation,
  }).select().single();

  return NextResponse.json({ application }, { status: 201 });
});
