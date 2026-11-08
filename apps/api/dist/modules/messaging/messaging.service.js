"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const chat_gateway_1 = require("./chat.gateway");
const PERSON = { id: true, profile: { select: { username: true, displayName: true, avatarUrl: true } } };
let MessagingService = class MessagingService {
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async open(userId, otherId) {
        if (userId === otherId)
            throw new common_1.BadRequestException('You cannot message yourself');
        const other = await this.prisma.user.findFirst({ where: { id: otherId, status: client_1.UserStatus.ACTIVE }, select: { id: true } });
        if (!other)
            throw new common_1.NotFoundException('User not found');
        const key = [userId, otherId].sort().join(':');
        const existing = await this.prisma.conversation.findUnique({ where: { key }, select: { id: true } });
        if (existing)
            return existing;
        try {
            return await this.prisma.conversation.create({
                data: { key, members: { create: [{ userId }, { userId: otherId }] } }, select: { id: true },
            });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                return this.prisma.conversation.findUniqueOrThrow({ where: { key }, select: { id: true } });
            }
            throw e;
        }
    }
    async openWithStore(userId, storeSlug) {
        const store = await this.prisma.store.findFirst({ where: { slug: storeSlug, status: client_1.StoreStatus.ACTIVE }, select: { ownerId: true } });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return this.open(userId, store.ownerId);
    }
    async list(userId) {
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
    async messages(userId, conversationId, q) {
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
    async send(userId, conversationId, body) {
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
        for (const o of others)
            this.gateway.emitToUser(o.userId, 'message', { conversationId, message });
        return message;
    }
    async markRead(userId, conversationId) {
        await this.assertMember(userId, conversationId);
        await this.prisma.conversationMember.update({
            where: { conversationId_userId: { conversationId, userId } }, data: { lastReadAt: new Date() },
        });
        return { success: true };
    }
    async assertMember(userId, conversationId) {
        const m = await this.prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId } }, select: { userId: true },
        });
        if (!m)
            throw new common_1.ForbiddenException('Not part of this conversation');
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, chat_gateway_1.ChatGateway])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map