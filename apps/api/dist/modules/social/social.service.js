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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const moderation_service_1 = require("../moderation/moderation.service");
const AUTHOR = { id: true, profile: { select: { username: true, displayName: true, avatarUrl: true } } };
const postSelect = (me) => ({
    id: true, body: true, mediaUrls: true, createdAt: true,
    author: { select: AUTHOR },
    product: { select: { id: true, title: true, slug: true, priceMinor: true, currency: true, store: { select: { slug: true } } } },
    _count: { select: { comments: true, reactions: true } },
    reactions: { where: { userId: me }, select: { userId: true }, take: 1 },
});
let SocialService = class SocialService {
    constructor(prisma, moderation) {
        this.prisma = prisma;
        this.moderation = moderation;
    }
    async createPost(userId, dto) {
        if (!dto.body && !dto.mediaUrls?.length)
            throw new common_1.BadRequestException('A post needs text or media');
        if (dto.productId) {
            const product = await this.prisma.product.findFirst({
                where: { id: dto.productId, status: client_1.ProductStatus.ACTIVE, store: { ownerId: userId } }, select: { id: true },
            });
            if (!product)
                throw new common_1.BadRequestException('You can only tag your own active products');
        }
        const screen = this.moderation.screenText(dto.body);
        if (screen.decision === 'REJECT')
            throw new common_1.BadRequestException({ message: 'Post violates the community policy', reasons: screen.reasons });
        const post = await this.prisma.post.create({
            data: {
                authorId: userId, body: dto.body, mediaUrls: dto.mediaUrls ?? [], productId: dto.productId,
                moderation: screen.decision === 'REVIEW' ? client_1.ModerationStatus.PENDING : client_1.ModerationStatus.APPROVED,
            },
            select: { id: true, moderation: true },
        });
        return post;
    }
    async deletePost(userId, id) {
        const res = await this.prisma.post.deleteMany({ where: { id, authorId: userId } });
        if (res.count === 0)
            throw new common_1.NotFoundException('Post not found');
        return { success: true };
    }
    async moderatePost(id, action) {
        const res = await this.prisma.post.updateMany({
            where: { id }, data: { moderation: action === 'APPROVE' ? client_1.ModerationStatus.APPROVED : client_1.ModerationStatus.REMOVED },
        });
        if (res.count === 0)
            throw new common_1.NotFoundException('Post not found');
        return { success: true };
    }
    async feed(userId, q) {
        const limit = q.limit ?? 20;
        const following = await this.prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
        const mode = q.mode ?? (following.length ? 'following' : 'discover');
        const authorFilter = mode === 'following' ? { authorId: { in: [userId, ...following.map((f) => f.followingId)] } } : {};
        const rows = await this.prisma.post.findMany({
            where: { moderation: client_1.ModerationStatus.APPROVED, author: { status: client_1.UserStatus.ACTIVE }, ...authorFilter },
            select: postSelect(userId),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit + 1,
            ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
        });
        return this.page(rows, limit, mode);
    }
    async userPosts(username, q) {
        const limit = q.limit ?? 20;
        const rows = await this.prisma.post.findMany({
            where: { moderation: client_1.ModerationStatus.APPROVED, author: { status: client_1.UserStatus.ACTIVE, profile: { username: username.toLowerCase() } } },
            select: postSelect(''),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit + 1,
            ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
        });
        return this.page(rows, limit);
    }
    page(rows, limit, mode) {
        const items = rows.slice(0, limit).map(({ reactions, ...post }) => ({ ...post, likedByMe: reactions.length > 0 }));
        return { items, nextCursor: rows.length > limit ? items[items.length - 1].id : null, ...(mode ? { mode } : {}) };
    }
    async addComment(userId, postId, dto) {
        await this.visiblePost(postId);
        const screen = this.moderation.screenText(dto.body);
        if (screen.decision === 'REJECT')
            throw new common_1.BadRequestException({ message: 'Comment violates the community policy', reasons: screen.reasons });
        return this.prisma.comment.create({
            data: { postId, authorId: userId, body: dto.body },
            select: { id: true, body: true, createdAt: true, author: { select: AUTHOR } },
        });
    }
    async comments(postId, q) {
        await this.visiblePost(postId);
        const limit = q.limit ?? 30;
        const rows = await this.prisma.comment.findMany({
            where: { postId },
            select: { id: true, body: true, createdAt: true, author: { select: AUTHOR } },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            take: limit + 1,
            ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
        });
        const items = rows.slice(0, limit);
        return { items, nextCursor: rows.length > limit ? items[items.length - 1].id : null };
    }
    async toggleLike(userId, postId) {
        await this.visiblePost(postId);
        const key = { userId_postId: { userId, postId } };
        const existing = await this.prisma.reaction.findUnique({ where: key });
        if (existing)
            await this.prisma.reaction.delete({ where: key });
        else
            await this.prisma.reaction.create({ data: { userId, postId } });
        return { liked: !existing, count: await this.prisma.reaction.count({ where: { postId } }) };
    }
    async follow(userId, username) {
        const target = await this.userByUsername(username);
        if (target.id === userId)
            throw new common_1.BadRequestException('You cannot follow yourself');
        const key = { followerId_followingId: { followerId: userId, followingId: target.id } };
        await this.prisma.follow.upsert({ where: key, create: { followerId: userId, followingId: target.id }, update: {} });
        return { following: true };
    }
    async unfollow(userId, username) {
        const target = await this.userByUsername(username);
        await this.prisma.follow.deleteMany({ where: { followerId: userId, followingId: target.id } });
        return { following: false };
    }
    async profile(username) {
        const user = await this.prisma.user.findFirst({
            where: { status: client_1.UserStatus.ACTIVE, profile: { username: username.toLowerCase() } },
            select: {
                id: true, role: true, createdAt: true,
                profile: { select: { username: true, displayName: true, avatarUrl: true, bio: true } },
                stores: { where: { status: client_1.StoreStatus.ACTIVE }, select: { slug: true, name: true, logoUrl: true } },
                _count: { select: { followers: true, following: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const posts = await this.prisma.post.count({ where: { authorId: user.id, moderation: client_1.ModerationStatus.APPROVED } });
        return { ...user, postCount: posts };
    }
    async visiblePost(id) {
        const post = await this.prisma.post.findFirst({ where: { id, moderation: client_1.ModerationStatus.APPROVED }, select: { id: true } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
    }
    async userByUsername(username) {
        const user = await this.prisma.user.findFirst({
            where: { status: client_1.UserStatus.ACTIVE, profile: { username: username.toLowerCase() } }, select: { id: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
};
exports.SocialService = SocialService;
exports.SocialService = SocialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof moderation_service_1.ModerationService !== "undefined" && moderation_service_1.ModerationService) === "function" ? _b : Object])
], SocialService);
//# sourceMappingURL=social.service.js.map