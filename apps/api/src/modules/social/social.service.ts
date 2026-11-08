import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ModerationStatus, Prisma, ProductStatus, StoreStatus, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CommentDto, CreatePostDto, CursorQueryDto, FeedQueryDto } from './social.dto';

const AUTHOR = { id: true, profile: { select: { username: true, displayName: true, avatarUrl: true } } } satisfies Prisma.UserSelect;

const postSelect = (me: string) => ({
  id: true, body: true, mediaUrls: true, createdAt: true,
  author: { select: AUTHOR },
  product: { select: { id: true, title: true, slug: true, priceMinor: true, currency: true, store: { select: { slug: true } } } },
  _count: { select: { comments: true, reactions: true } },
  reactions: { where: { userId: me }, select: { userId: true }, take: 1 },
}) satisfies Prisma.PostSelect;

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService, private moderation: ModerationService) {}

  async createPost(userId: string, dto: CreatePostDto) {
    if (!dto.body && !dto.mediaUrls?.length) throw new BadRequestException('A post needs text or media');
    if (dto.productId) {
      const product = await this.prisma.product.findFirst({
        where: { id: dto.productId, status: ProductStatus.ACTIVE, store: { ownerId: userId } }, select: { id: true },
      });
      if (!product) throw new BadRequestException('You can only tag your own active products');
    }
    const screen = this.moderation.screenText(dto.body);
    if (screen.decision === 'REJECT') throw new BadRequestException({ message: 'Post violates the community policy', reasons: screen.reasons });

    const post = await this.prisma.post.create({
      data: {
        authorId: userId, body: dto.body, mediaUrls: dto.mediaUrls ?? [], productId: dto.productId,
        moderation: screen.decision === 'REVIEW' ? ModerationStatus.PENDING : ModerationStatus.APPROVED,
      },
      select: { id: true, moderation: true },
    });
    return post;
  }

  async deletePost(userId: string, id: string) {
    const res = await this.prisma.post.deleteMany({ where: { id, authorId: userId } });
    if (res.count === 0) throw new NotFoundException('Post not found');
    return { success: true };
  }

  async moderatePost(id: string, action: 'APPROVE' | 'REMOVE') {
    const res = await this.prisma.post.updateMany({
      where: { id }, data: { moderation: action === 'APPROVE' ? ModerationStatus.APPROVED : ModerationStatus.REMOVED },
    });
    if (res.count === 0) throw new NotFoundException('Post not found');
    return { success: true };
  }

  async feed(userId: string, q: FeedQueryDto) {
    const limit = q.limit ?? 20;
    const following = await this.prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
    const mode = q.mode ?? (following.length ? 'following' : 'discover');
    const authorFilter = mode === 'following' ? { authorId: { in: [userId, ...following.map((f) => f.followingId)] } } : {};

    const rows = await this.prisma.post.findMany({
      where: { moderation: ModerationStatus.APPROVED, author: { status: UserStatus.ACTIVE }, ...authorFilter },
      select: postSelect(userId),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
    });
    return this.page(rows, limit, mode);
  }

  async userPosts(username: string, q: CursorQueryDto) {
    const limit = q.limit ?? 20;
    const rows = await this.prisma.post.findMany({
      where: { moderation: ModerationStatus.APPROVED, author: { status: UserStatus.ACTIVE, profile: { username: username.toLowerCase() } } },
      select: postSelect(''),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
    });
    return this.page(rows, limit);
  }

  private page<T extends { id: string; reactions: unknown[] }>(rows: T[], limit: number, mode?: string) {
    const items = rows.slice(0, limit).map(({ reactions, ...post }) => ({ ...post, likedByMe: reactions.length > 0 }));
    return { items, nextCursor: rows.length > limit ? items[items.length - 1].id : null, ...(mode ? { mode } : {}) };
  }

  async addComment(userId: string, postId: string, dto: CommentDto) {
    await this.visiblePost(postId);
    const screen = this.moderation.screenText(dto.body);
    if (screen.decision === 'REJECT') throw new BadRequestException({ message: 'Comment violates the community policy', reasons: screen.reasons });
    return this.prisma.comment.create({
      data: { postId, authorId: userId, body: dto.body },
      select: { id: true, body: true, createdAt: true, author: { select: AUTHOR } },
    });
  }

  async comments(postId: string, q: CursorQueryDto) {
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

  async toggleLike(userId: string, postId: string) {
    await this.visiblePost(postId);
    const key = { userId_postId: { userId, postId } };
    const existing = await this.prisma.reaction.findUnique({ where: key });
    if (existing) await this.prisma.reaction.delete({ where: key });
    else await this.prisma.reaction.create({ data: { userId, postId } });
    return { liked: !existing, count: await this.prisma.reaction.count({ where: { postId } }) };
  }

  async follow(userId: string, username: string) {
    const target = await this.userByUsername(username);
    if (target.id === userId) throw new BadRequestException('You cannot follow yourself');
    const key = { followerId_followingId: { followerId: userId, followingId: target.id } };
    await this.prisma.follow.upsert({ where: key, create: { followerId: userId, followingId: target.id }, update: {} });
    return { following: true };
  }

  async unfollow(userId: string, username: string) {
    const target = await this.userByUsername(username);
    await this.prisma.follow.deleteMany({ where: { followerId: userId, followingId: target.id } });
    return { following: false };
  }

  async profile(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { status: UserStatus.ACTIVE, profile: { username: username.toLowerCase() } },
      select: {
        id: true, role: true, createdAt: true,
        profile: { select: { username: true, displayName: true, avatarUrl: true, bio: true } },
        stores: { where: { status: StoreStatus.ACTIVE }, select: { slug: true, name: true, logoUrl: true } },
        _count: { select: { followers: true, following: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const posts = await this.prisma.post.count({ where: { authorId: user.id, moderation: ModerationStatus.APPROVED } });
    return { ...user, postCount: posts };
  }

  private async visiblePost(id: string) {
    const post = await this.prisma.post.findFirst({ where: { id, moderation: ModerationStatus.APPROVED }, select: { id: true } });
    if (!post) throw new NotFoundException('Post not found');
  }

  private async userByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { status: UserStatus.ACTIVE, profile: { username: username.toLowerCase() } }, select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}