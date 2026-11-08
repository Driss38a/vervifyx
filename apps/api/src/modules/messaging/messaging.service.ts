import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StoreStatus, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { MessagesQueryDto } from './messaging.dto';

const PERSON = { id: true, profile: { select: { username: true, displayName: true, avatarUrl: true } } } satisfies Prisma.UserSelect;

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService, private gateway: ChatGateway) {}

  async open(userId: string, otherId: string) {
    if (userId === otherId) throw new BadRequestException('You cannot message yourself');
    const other = await this.prisma.user.findFirst({ where: { id: otherId, status: UserStatus.ACTIVE }, select: { id: true } });
    if (!other) throw new NotFoundException('User not found');

    const key = [userId, otherId].sort().join(':');
    const existing = await this.prisma.conversation.findUnique({ where: { key }, select: { id: true } });
    if (existing) return existing;
    try {
      return await this.prisma.conversation.create({
        data: { key, members: { create: [{ userId }, { userId: otherId }] } }, select: { id: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return this.prisma.conversation.findUniqueOrThrow({ where: { key }, select: { id: true } });
      }
      throw e;
    }
  }

  async openWithStore(userId: string, storeSlug: string) {
    const store = await this.prisma.store.findFirst({ where: { slug: storeSlug, status: StoreStatus.ACTIVE }, select: { ownerId: true } });
    if (!store) throw new NotFoundException('Store not found');
    return this.open(userId, store.ownerId);
  }

  async list(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      orderBy: { conversation: { lastMessageAt: 'desc' } },
      take: 50,
      include: {
        conversation: {
          include: {
            members: { where: { userId: { not: userId } }, include: { user: { select: PERSON } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true, body: true, senderId: true, createdAt: true } },
          },
        },
      },
    });
    return Promise.all(memberships.map(async (m) => ({
      id: m.conversationId,
      with: m.conversation.members[0]?.user ?? null,
      lastMessage: m.conversation.messages[0] ?? null,
      unread: await this.prisma.message.count({
        where: { conversationId: m.conversationId, senderId: { not: userId }, ...(m.lastReadAt ? { createdAt: { gt: m.lastReadAt } } : {}) },
      }),
    })));
  }

  async messages(userId: string, conversationId: string, q: MessagesQueryDto) {
    await this.assertMember(userId, conversationId);
    const limit = q.limit ?? 30;
    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      select: { id: true, body: true, senderId: true, createdAt: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(q.before ? { cursor: { id: q.before }, skip: 1 } : {}),
    });
    const items = rows.slice(0, limit);
    return { items, nextBefore: rows.length > limit ? items[items.length - 1].id : null };
  }

  async send(userId: string, conversationId: string, body: string) {
    await this.assertMember(userId, conversationId);
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: { conversationId, senderId: userId, body }, select: { id: true, body: true, senderId: true, createdAt: true },
      }),
      this.prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
      this.prisma.conversationMember.update({
        where: { conversationId_userId: { conversationId, userId } }, data: { lastReadAt: new Date() },
      }),
    ]);
    const others = await this.prisma.conversationMember.findMany({ where: { conversationId, userId: { not: userId } }, select: { userId: true } });
    for (const o of others) this.gateway.emitToUser(o.userId, 'message', { conversationId, message });
    return message;
  }

  async markRead(userId: string, conversationId: string) {
    await this.assertMember(userId, conversationId);
    await this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } }, data: { lastReadAt: new Date() },
    });
    return { success: true };
  }

  private async assertMember(userId: string, conversationId: string) {
    const m = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } }, select: { userId: true },
    });
    if (!m) throw new ForbiddenException('Not part of this conversation');
  }
}