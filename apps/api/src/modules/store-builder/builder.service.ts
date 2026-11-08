import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus, StoreStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { UpsertLandingDto, UpsertPageDto } from './builder.dto';
import { validateSections } from './sections.validator';
import { Section, TEMPLATES } from './templates';

const PAGE_SLUG = /^[a-z0-9-]{1,40}$/;
const json = (v: unknown) => v as Prisma.InputJsonValue;

@Injectable()
export class BuilderService {
  constructor(private prisma: PrismaService, private moderation: ModerationService) {}

  listTemplates() { return Object.values(TEMPLATES); }

  async applyTemplate(userId: string, storeId: string, templateKey: string) {
    const template = TEMPLATES[templateKey];
    if (!template) throw new BadRequestException('Unknown template');
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

  async upsertPage(userId: string, storeId: string, slug: string, dto: UpsertPageDto) {
    if (!PAGE_SLUG.test(slug)) throw new BadRequestException('Invalid page address');
    await this.ownedStore(userId, storeId);
    const sections = validateSections(dto.sections, this.moderation);
    this.assertTitle(dto.title);

    return this.prisma.storePage.upsert({
      where: { storeId_slug: { storeId, slug } },
      create: { storeId, slug, title: dto.title, sections: json(sections), published: dto.published ?? true },
      update: { title: dto.title, sections: json(sections), published: dto.published },
    });
  }

  async getPublicPage(storeSlug: string, slug: string) {
    const store = await this.prisma.store.findFirst({
      where: { slug: storeSlug, status: StoreStatus.ACTIVE },
      select: { id: true, slug: true, name: true, templateKey: true, currency: true },
    });
    if (!store) throw new NotFoundException('Store not found');
    const page = await this.prisma.storePage.findUnique({ where: { storeId_slug: { storeId: store.id, slug } } });
    if (!page || !page.published) throw new NotFoundException('Page not found');
    const theme = (TEMPLATES[store.templateKey] ?? TEMPLATES.default).theme;
    return { store, theme, page: { slug: page.slug, title: page.title, sections: page.sections } };
  }

  async upsertLanding(userId: string, productId: string, dto: UpsertLandingDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, store: { ownerId: userId } },
      include: { store: { select: { slug: true, templateKey: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.status === ProductStatus.ARCHIVED) throw new BadRequestException('Product is archived');

    const existing = await this.prisma.landingPage.findUnique({ where: { productId } });
    const sections = dto.sections
      ? validateSections(dto.sections, this.moderation)
      : (existing ? undefined : this.defaultLandingSections(product.title));
    const theme = dto.theme ?? (existing ? undefined : (TEMPLATES[product.store.templateKey] ?? TEMPLATES.default).theme);
    if (dto.theme) validateSections([{ type: 'rich-text', props: dto.theme }], this.moderation);

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

  async getPublicLanding(slug: string) {
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
    if (!landing || !landing.published || landing.product.status !== ProductStatus.ACTIVE
        || landing.product.store.status !== StoreStatus.ACTIVE) {
      throw new NotFoundException('Page not found');
    }
    const { product, ...page } = landing;
    return { page: { slug: page.slug, theme: page.theme, sections: page.sections }, product };
  }

  private defaultLandingSections(title: string): Section[] {
    return [
      { type: 'hero', props: { title, subtitle: '', ctaLabel: 'Order now' } },
      { type: 'features', props: { items: [] } },
      { type: 'order-form', props: { fields: ['fullName', 'phone', 'country', 'city', 'address'], paymentMethods: ['COD'] } },
      { type: 'faq', props: { items: [] } },
    ];
  }

  private assertTitle(title: string) {
    const screen = this.moderation.screenText(title);
    if (screen.decision === 'REJECT') throw new BadRequestException({ message: 'Title violates the marketplace policy', reasons: screen.reasons });
  }

  private async ownedStore(userId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId: userId, status: StoreStatus.ACTIVE }, select: { id: true } });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }
}