import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const POST = requireAuth(async (req, user) => {
  const existing = await db.authorApplication.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({ error: 'Application already submitted', status: existing.status }, { status: 409 });
  }

  const body = await req.json();

  const application = await db.authorApplication.create({
    data: {
      userId: user.id,
      professionalTitle: body.professionalTitle,
      writingNiche: body.writingNiche,
      yearsExperience: body.yearsExperience,
      portfolioUrl: body.portfolioUrl,
      linkedinUrl: body.linkedinUrl,
      motivation: body.motivation,
    },
  });

  return NextResponse.json({ application }, { status: 201 });
});
