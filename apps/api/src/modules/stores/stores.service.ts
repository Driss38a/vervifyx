import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StoreStatus } from '@prisma/client';
import { slugify } from '../../common/slug.util';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreateStoreDto, StoreQueryDto, UpdateStoreDto } from './stores.dto';

const MAX_STORES_PER_OWNER = 5;
const RESERVED_SLUGS = new Set(['admin', 'api', 'app', 'login', 'register', 'static', 'support', 'vervifyx', 'mine', 'www']);

const PUBLIC_SELECT = {
  id: true, slug: true, name: true, description: true, logoUrl: true,
  templateKey: true, currency: true, country: true, createdAt: true,
  owner: { select: { profile: { select: { username: true, displayName: true, avatarUrl: true } } } },
} satisfies Prisma.StoreSelect;

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService, private moderation: ModerationService) {}

  async create(ownerId: string, dto: CreateStoreDto) {
    const count = await this.prisma.store.count({ where: { ownerId } });
    if (count >= MAX_STORES_PER_OWNER) throw new BadRequestException(`Maximum ${MAX_STORES_PER_OWNER} stores per account`);

    this.assertAllowed(dto.name, dto.description);

    const slug = dto.slug ?? slugify(dto.name);
    if (RESERVED_SLUGS.has(slug)) throw new ConflictException('This store address is reserved');
    if (await this.prisma.store.findUnique({ where: { slug }, select: { id: true } })) {
      throw new ConflictException('This store address is already taken');
    }

    return this.prisma.store.create({
      data: {
        ownerId, slug, name: dto.name, description: dto.description,
        templateKey: dto.templateKey ?? 'default',
        currency: dto.currency?.toUpperCase() ?? 'USD',
        country: dto.country?.toUpperCase(),
      },
    });
  }

  async listPublic(q: StoreQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where = {
      status: StoreStatus.ACTIVE,
      ...(q.q ? { name: { contains: q.q, mode: 'insensitive' as const } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.store.findMany({ where, select: PUBLIC_SELECT, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.store.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async getBySlug(slug: string) {
    const store = await this.prisma.store.findFirst({ where: { slug, status: StoreStatus.ACTIVE }, select: PUBLIC_SELECT });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  mine(ownerId: string) {
    return this.prisma.store.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
  }

  async update(ownerId: string, id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findFirst({ where: { id, ownerId } });
    if (!store) throw new NotFoundException('Store not found');
    if (dto.name !== undefined || dto.description !== undefined) {
      this.assertAllowed(dto.name ?? store.name, dto.description ?? store.description);
    }
    return this.prisma.store.update({ where: { id }, data: dto });
  }

  private assertAllowed(...texts: (string | null | undefined)[]) {
    const screen = this.moderation.screenText(...texts);
    if (screen.decision === 'REJECT') {
      throw new BadRequestException({ message: 'Content violates the marketplace policy', reasons: screen.reasons });
    }
  }
}