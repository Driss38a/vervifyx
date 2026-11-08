import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, ProductStatus, ProductType, StoreStatus } from '@prisma/client';
import { uniqueSlug } from '../../common/slug.util';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService, ScreenResult } from '../moderation/moderation.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './products.dto';

const PUBLIC_SELECT = {
  id: true, type: true, title: true, slug: true, description: true, priceMinor: true,
  currency: true, stock: true, createdAt: true,
  store: { select: { slug: true, name: true, logoUrl: true } },
  category: { select: { slug: true, name: true } },
  variants: { select: { id: true, name: true, priceMinor: true, stock: true } },
} satisfies Prisma.ProductSelect;

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private moderation: ModerationService,
    private config: ConfigService,
  ) {}

  async create(userId: string, storeId: string, dto: CreateProductDto) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId: userId, status: StoreStatus.ACTIVE } });
    if (!store) throw new ForbiddenException('Store not found or not yours');
    if (dto.type === ProductType.PHYSICAL && dto.stock === undefined) {
      throw new BadRequestException('Physical products require a stock quantity');
    }

    const screen = this.moderation.screenText(dto.title, dto.description, ...(dto.variants ?? []).map((v) => v.name));
    this.assertNotRejected(screen);
    const categoryId = await this.resolveCategory(dto.categorySlug);
    const { status, moderationNote } = this.decideStatus(screen);

    return this.prisma.product.create({
      data: {
        storeId, categoryId, type: dto.type, title: dto.title, slug: uniqueSlug(dto.title),
        description: dto.description, priceMinor: dto.priceMinor,
        currency: dto.currency?.toUpperCase() ?? store.currency,
        stock: dto.stock, status, moderationNote,
        variants: dto.variants?.length ? { create: dto.variants } : undefined,
      },
      include: { variants: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id, store: { ownerId: userId } },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.status === ProductStatus.ARCHIVED) throw new BadRequestException('Archived products cannot be edited');

    let status: ProductStatus = product.status;
    let moderationNote = product.moderationNote;
    const textChanged = dto.title !== undefined || dto.description !== undefined || dto.variants !== undefined;
    if (textChanged) {
      const names = (dto.variants ?? product.variants).map((v) => v.name);
      const screen = this.moderation.screenText(dto.title ?? product.title, dto.description ?? product.description, ...names);
      this.assertNotRejected(screen);
      ({ status, moderationNote } = this.decideStatus(screen));
    }
    const categoryId = dto.categorySlug ? await this.resolveCategory(dto.categorySlug) : undefined;

    return this.prisma.$transaction(async (tx) => {
      if (dto.variants) await tx.productVariant.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          title: dto.title, description: dto.description, priceMinor: dto.priceMinor, stock: dto.stock,
          categoryId, status, moderationNote,
          ...(dto.variants ? { variants: { create: dto.variants } } : {}),
        },
        include: { variants: true },
      });
    });
  }

  async archive(userId: string, id: string) {
    const product = await this.prisma.product.findFirst({ where: { id, store: { ownerId: userId } }, select: { id: true } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.update({ where: { id }, data: { status: ProductStatus.ARCHIVED }, select: { id: true, status: true } });
  }

  async listPublic(q: ProductQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      store: { status: StoreStatus.ACTIVE, ...(q.store ? { slug: q.store } : {}) },
      ...(q.type ? { type: q.type } : {}),
      ...(q.category ? { category: { slug: q.category } } : {}),
      ...(q.q ? { OR: [
        { title: { contains: q.q, mode: 'insensitive' } },
        { description: { contains: q.q, mode: 'insensitive' } },
      ] } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, select: PUBLIC_SELECT, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async getPublic(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, status: ProductStatus.ACTIVE, store: { status: StoreStatus.ACTIVE } },
      select: PUBLIC_SELECT,
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  mine(userId: string, storeId?: string) {
    return this.prisma.product.findMany({
      where: { store: { ownerId: userId, ...(storeId ? { id: storeId } : {}) } },
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  pending(page = 1) {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.PENDING_REVIEW },
      include: { store: { select: { slug: true, name: true } }, variants: true },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * 50,
      take: 50,
    });
  }

  async review(id: string, action: 'APPROVE' | 'REJECT', note?: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.status === ProductStatus.ARCHIVED) throw new BadRequestException('Product is archived');
    return this.prisma.product.update({
      where: { id },
      data: {
        status: action === 'APPROVE' ? ProductStatus.ACTIVE : ProductStatus.REJECTED,
        moderationNote: note ?? null,
      },
      select: { id: true, status: true, moderationNote: true },
    });
  }

  private assertNotRejected(screen: ScreenResult) {
    if (screen.decision === 'REJECT') {
      throw new BadRequestException({ message: 'Listing violates the marketplace policy', reasons: screen.reasons });
    }
  }

  private decideStatus(screen: ScreenResult): { status: ProductStatus; moderationNote: string | null } {
    const autoPublish = this.config.get<string>('AUTO_PUBLISH_CLEAN_PRODUCTS') === 'true';
    if (screen.decision === 'APPROVE' && autoPublish) return { status: ProductStatus.ACTIVE, moderationNote: null };
    const note = screen.decision === 'REVIEW' ? `Flagged: ${screen.reasons.map((r) => r.code).join(', ')}` : null;
    return { status: ProductStatus.PENDING_REVIEW, moderationNote: note };
  }

  private async resolveCategory(slug?: string): Promise<string | undefined> {
    if (!slug) return undefined;
    const category = await this.prisma.category.findUnique({ where: { slug }, select: { id: true } });
    if (!category) throw new BadRequestException(`Unknown category: ${slug}`);
    return category.id;
  }
}