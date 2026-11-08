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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const slug_util_1 = require("../../common/slug.util");
const prisma_service_1 = require("../../prisma/prisma.service");
const moderation_service_1 = require("../moderation/moderation.service");
const MAX_STORES_PER_OWNER = 5;
const RESERVED_SLUGS = new Set(['admin', 'api', 'app', 'login', 'register', 'static', 'support', 'vervifyx', 'mine', 'www']);
const PUBLIC_SELECT = {
    id: true, slug: true, name: true, description: true, logoUrl: true,
    templateKey: true, currency: true, country: true, createdAt: true,
    owner: { select: { profile: { select: { username: true, displayName: true, avatarUrl: true } } } },
};
let StoresService = class StoresService {
    constructor(prisma, moderation) {
        this.prisma = prisma;
        this.moderation = moderation;
    }
    async create(ownerId, dto) {
        const count = await this.prisma.store.count({ where: { ownerId } });
        if (count >= MAX_STORES_PER_OWNER)
            throw new common_1.BadRequestException(`Maximum ${MAX_STORES_PER_OWNER} stores per account`);
        this.assertAllowed(dto.name, dto.description);
        const slug = dto.slug ?? (0, slug_util_1.slugify)(dto.name);
        if (RESERVED_SLUGS.has(slug))
            throw new common_1.ConflictException('This store address is reserved');
        if (await this.prisma.store.findUnique({ where: { slug }, select: { id: true } })) {
            throw new common_1.ConflictException('This store address is already taken');
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
    async listPublic(q) {
        const page = q.page ?? 1;
        const limit = q.limit ?? 20;
        const where = {
            status: client_1.StoreStatus.ACTIVE,
            ...(q.q ? { name: { contains: q.q, mode: 'insensitive' } } : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.store.findMany({ where, select: PUBLIC_SELECT, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
            this.prisma.store.count({ where }),
        ]);
        return { items, total, page, limit };
    }
    async getBySlug(slug) {
        const store = await this.prisma.store.findFirst({ where: { slug, status: client_1.StoreStatus.ACTIVE }, select: PUBLIC_SELECT });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return store;
    }
    mine(ownerId) {
        return this.prisma.store.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
    }
    async update(ownerId, id, dto) {
        const store = await this.prisma.store.findFirst({ where: { id, ownerId } });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        if (dto.name !== undefined || dto.description !== undefined) {
            this.assertAllowed(dto.name ?? store.name, dto.description ?? store.description);
        }
        return this.prisma.store.update({ where: { id }, data: dto });
    }
    assertAllowed(...texts) {
        const screen = this.moderation.screenText(...texts);
        if (screen.decision === 'REJECT') {
            throw new common_1.BadRequestException({ message: 'Content violates the marketplace policy', reasons: screen.reasons });
        }
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof moderation_service_1.ModerationService !== "undefined" && moderation_service_1.ModerationService) === "function" ? _b : Object])
], StoresService);
//# sourceMappingURL=stores.service.js.map