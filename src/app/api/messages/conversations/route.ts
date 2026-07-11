import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';

  const where: Record<string, unknown> = { userId: user.id };

  const participations = await db.conversationParticipant.findMany({
    where,
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: 'desc' } },
  });

  let conversations = participations.map((p) => {
    const other = p.conversation.participants.find((part) => part.userId !== user.id);
    const lastMessage = p.conversation.messages[0] || null;
    return {
      id: p.conversation.id,
      updatedAt: p.conversation.updatedAt,
      otherUser: other?.user || null,
      lastMessage,
      unread: lastMessage ? !lastMessage.isRead && lastMessage.senderId !== user.id : false,
    };
  });

  if (search) {
    const q = search.toLowerCase();
    conversations = conversations.filter((c) => {
      if (!c.otherUser) return false;
      const name = `${c.otherUser.firstName} ${c.otherUser.lastName}`.toLowerCase();
      const username = c.otherUser.username.toLowerCase();
      return name.includes(q) || username.includes(q);
    });
  }

  return NextResponse.json({ conversations });
});

export const POST = requireAuth(async (req, user) => {
  const { userId: otherUserId } = await req.json();

  if (!otherUserId || otherUserId === user.id) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
  }

  const otherUser = await db.user.findUnique({ where: { id: otherUserId, isActive: true } });
  if (!otherUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const existing = await db.conversation.findFirst({
    where: {
      participants: {
        every: { userId: { in: [user.id, otherUserId] } },
      },
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (existing) {
    const other = existing.participants.find((p) => p.userId !== user.id);
    return NextResponse.json({ conversation: { id: existing.id, otherUser: other?.user } });
  }

  const conversation = await db.conversation.create({
    data: {
      participants: {
        create: [{ userId: user.id }, { userId: otherUserId }],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true },
          },
        },
      },
    },
  });

  const other = conversation.participants.find((p) => p.userId !== user.id);
  return NextResponse.json({ conversation: { id: conversation.id, otherUser: other?.user } }, { status: 201 });
});
