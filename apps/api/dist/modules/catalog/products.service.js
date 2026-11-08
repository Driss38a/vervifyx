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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const slug_util_1 = require("../../common/slug.util");
const prisma_service_1 = require("../../prisma/prisma.service");
const moderation_service_1 = require("../moderation/moderation.service");
const PUBLIC_SELECT = {
    id: true, type: true, title: true, slug: true, description: true, priceMinor: true,
    currency: true, stock: true, createdAt: true,
    store: { select: { slug: true, name: true, logoUrl: true } },
    category: { select: { slug: true, name: true } },
    variants: { select: { id: true, name: true, priceMinor: true, stock: true } },
};
let ProductsService = class ProductsService {
    constructor(prisma, moderation, config) {
        this.prisma = prisma;
        this.moderation = moderation;
        this.config = config;
    }
    async create(userId, storeId, dto) {
        const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId: userId, status: client_1.StoreStatus.ACTIVE } });
        if (!store)
            throw new common_1.ForbiddenException('Store not found or not yours');
        if (dto.type === client_1.ProductType.PHYSICAL && dto.stock === undefined) {
            throw new common_1.BadRequestException('Physical products require a stock quantity');
        }
        const screen = this.moderation.screenText(dto.title, dto.description, ...(dto.variants ?? []).map((v) => v.name));
        this.assertNotRejected(screen);
        const categoryId = await this.resolveCategory(dto.categorySlug);
        const { status, moderationNote } = this.decideStatus(screen);
        return this.prisma.product.create({
            data: {
                storeId, categoryId, type: dto.type, title: dto.title, slug: (0, slug_util_1.uniqueSlug)(dto.title),
                description: dto.description, priceMinor: dto.priceMinor,
                currency: dto.currency?.toUpperCase() ?? store.currency,
                stock: dto.stock, status, moderationNote,
                variants: dto.variants?.length ? { create: dto.variants } : undefined,
            },
            include: { variants: true },
        });
    }
    async update(userId, id, dto) {
        const product = await this.prisma.product.findFirst({
            where: { id, store: { ownerId: userId } },
            include: { variants: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.status === client_1.ProductStatus.ARCHIVED)
            throw new common_1.BadRequestException('Archived products cannot be edited');
        let status = product.status;
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
            if (dto.variants)
                await tx.productVariant.deleteMany({ where: { productId: id } });
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
    async archive(userId, id) {
        const product = await this.prisma.product.findFirst({ where: { id, store: { ownerId: userId } }, select: { id: true } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.prisma.product.update({ where: { id }, data: { status: client_1.ProductStatus.ARCHIVED }, select: { id: true, status: true } });
    }
    async listPublic(q) {
        const page = q.page ?? 1;
        const limit = q.limit ?? 20;
        const where = {
            status: client_1.ProductStatus.ACTIVE,
            store: { status: client_1.StoreStatus.ACTIVE, ...(q.store ? { slug: q.store } : {}) },
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
    async getPublic(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, status: client_1.ProductStatus.ACTIVE, store: { status: client_1.StoreStatus.ACTIVE } },
            select: PUBLIC_SELECT,
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    mine(userId, storeId) {
        return this.prisma.product.findMany({
            where: { store: { ownerId: userId, ...(storeId ? { id: storeId } : {}) } },
            include: { variants: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    pending(page = 1) {
        return this.prisma.product.findMany({
            where: { status: client_1.ProductStatus.PENDING_REVIEW },
            include: { store: { select: { slug: true, name: true } }, variants: true },
            orderBy: { createdAt: 'asc' },
            skip: (page - 1) * 50,
            take: 50,
        });
    }
    async review(id, action, note) {
        const product = await this.prisma.product.findUnique({ where: { id }, select: { id: true, status: true } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.status === client_1.ProductStatus.ARCHIVED)
            throw new common_1.BadRequestException('Product is archived');
        return this.prisma.product.update({
            where: { id },
            data: {
                status: action === 'APPROVE' ? client_1.ProductStatus.ACTIVE : client_1.ProductStatus.REJECTED,
                moderationNote: note ?? null,
            },
            select: { id: true, status: true, moderationNote: true },
        });
    }
    assertNotRejected(screen) {
        if (screen.decision === 'REJECT') {
            throw new common_1.BadRequestException({ message: 'Listing violates the marketplace policy', reasons: screen.reasons });
        }
    }
    decideStatus(screen) {
        const autoPublish = this.config.get('AUTO_PUBLISH_CLEAN_PRODUCTS') === 'true';
        if (screen.decision === 'APPROVE' && autoPublish)
            return { status: client_1.ProductStatus.ACTIVE, moderationNote: null };
        const note = screen.decision === 'REVIEW' ? `Flagged: ${screen.reasons.map((r) => r.code).join(', ')}` : null;
        return { status: client_1.ProductStatus.PENDING_REVIEW, moderationNote: note };
    }
    async resolveCategory(slug) {
        if (!slug)
            return undefined;
        const category = await this.prisma.category.findUnique({ where: { slug }, select: { id: true } });
        if (!category)
            throw new common_1.BadRequestException(`Unknown category: ${slug}`);
        return category.id;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof moderation_service_1.ModerationService !== "undefined" && moderation_service_1.ModerationService) === "function" ? _b : Object, config_1.ConfigService])
], ProductsService);
//# sourceMappingURL=products.service.js.map