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
exports.BuilderService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const moderation_service_1 = require("../moderation/moderation.service");
const sections_validator_1 = require("./sections.validator");
const templates_1 = require("./templates");
const PAGE_SLUG = /^[a-z0-9-]{1,40}$/;
const json = (v) => v;
let BuilderService = class BuilderService {
    constructor(prisma, moderation) {
        this.prisma = prisma;
        this.moderation = moderation;
    }
    listTemplates() { return Object.values(templates_1.TEMPLATES); }
    async applyTemplate(userId, storeId, templateKey) {
        const template = templates_1.TEMPLATES[templateKey];
        if (!template)
            throw new common_1.BadRequestException('Unknown template');
        await this.ownedStore(userId, storeId);
        return this.prisma.$transaction(async (tx) => {
            await tx.store.update({ where: { id: storeId }, data: { templateKey } });
            return tx.storePage.upsert({
                where: { storeId_slug: { storeId, slug: 'home' } },
                create: { storeId, slug: 'home', title: 'Home', sections: json(template.homeSections) },
                update: { sections: json(template.homeSections) },
            });
        });
    }
    async upsertPage(userId, storeId, slug, dto) {
        if (!PAGE_SLUG.test(slug))
            throw new common_1.BadRequestException('Invalid page address');
        await this.ownedStore(userId, storeId);
        const sections = (0, sections_validator_1.validateSections)(dto.sections, this.moderation);
        this.assertTitle(dto.title);
        return this.prisma.storePage.upsert({
            where: { storeId_slug: { storeId, slug } },
            create: { storeId, slug, title: dto.title, sections: json(sections), published: dto.published ?? true },
            update: { title: dto.title, sections: json(sections), published: dto.published },
        });
    }
    async getPublicPage(storeSlug, slug) {
        const store = await this.prisma.store.findFirst({
            where: { slug: storeSlug, status: client_1.StoreStatus.ACTIVE },
            select: { id: true, slug: true, name: true, templateKey: true, currency: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        const page = await this.prisma.storePage.findUnique({ where: { storeId_slug: { storeId: store.id, slug } } });
        if (!page || !page.published)
            throw new common_1.NotFoundException('Page not found');
        const theme = (templates_1.TEMPLATES[store.templateKey] ?? templates_1.TEMPLATES.default).theme;
        return { store, theme, page: { slug: page.slug, title: page.title, sections: page.sections } };
    }
    async upsertLanding(userId, productId, dto) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, store: { ownerId: userId } },
            include: { store: { select: { slug: true, templateKey: true } } },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.status === client_1.ProductStatus.ARCHIVED)
            throw new common_1.BadRequestException('Product is archived');
        const existing = await this.prisma.landingPage.findUnique({ where: { productId } });
        const sections = dto.sections
            ? (0, sections_validator_1.validateSections)(dto.sections, this.moderation)
            : (existing ? undefined : this.defaultLandingSections(product.title));
        const theme = dto.theme ?? (existing ? undefined : (templates_1.TEMPLATES[product.store.templateKey] ?? templates_1.TEMPLATES.default).theme);
        if (dto.theme)
            (0, sections_validator_1.validateSections)([{ type: 'rich-text', props: dto.theme }], this.moderation);
        return this.prisma.landingPage.upsert({
            where: { productId },
            create: {
                productId, slug: `${product.store.slug}-${product.slug}`.slice(0, 120),
                theme: json(theme), sections: json(sections), published: dto.published ?? false,
            },
            update: {
                ...(sections ? { sections: json(sections) } : {}),
                ...(theme ? { theme: json(theme) } : {}),
                ...(dto.published !== undefined ? { published: dto.published } : {}),
            },
        });
    }
    async getPublicLanding(slug) {
        const landing = await this.prisma.landingPage.findUnique({
            where: { slug },
            include: {
                product: {
                    select: {
                        id: true, type: true, title: true, description: true, priceMinor: true, currency: true,
                        stock: true, status: true,
                        variants: { select: { id: true, name: true, priceMinor: true, stock: true } },
                        store: { select: { slug: true, name: true, currency: true, status: true } },
                    },
                },
            },
        });
        if (!landing || !landing.published || landing.product.status !== client_1.ProductStatus.ACTIVE
            || landing.product.store.status !== client_1.StoreStatus.ACTIVE) {
            throw new common_1.NotFoundException('Page not found');
        }
        const { product, ...page } = landing;
        return { page: { slug: page.slug, theme: page.theme, sections: page.sections }, product };
    }
    defaultLandingSections(title) {
        return [
            { type: 'hero', props: { title, subtitle: '', ctaLabel: 'Order now' } },
            { type: 'features', props: { items: [] } },
            { type: 'order-form', props: { fields: ['fullName', 'phone', 'country', 'city', 'address'], paymentMethods: ['COD'] } },
            { type: 'faq', props: { items: [] } },
        ];
    }
    assertTitle(title) {
        const screen = this.moderation.screenText(title);
        if (screen.decision === 'REJECT')
            throw new common_1.BadRequestException({ message: 'Title violates the marketplace policy', reasons: screen.reasons });
    }
    async ownedStore(userId, storeId) {
        const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId: userId, status: client_1.StoreStatus.ACTIVE }, select: { id: true } });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return store;
    }
};
exports.BuilderService = BuilderService;
exports.BuilderService = BuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof moderation_service_1.ModerationService !== "undefined" && moderation_service_1.ModerationService) === "function" ? _b : Object])
], BuilderService);
//# sourceMappingURL=builder.service.js.map