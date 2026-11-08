import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { UpsertLandingDto, UpsertPageDto } from './builder.dto';
export declare class BuilderService {
    private prisma;
    private moderation;
    constructor(prisma: PrismaService, moderation: ModerationService);
    listTemplates(): import("./templates").TemplateDef[];
    applyTemplate(userId: string, storeId: string, templateKey: string): Promise<any>;
    upsertPage(userId: string, storeId: string, slug: string, dto: UpsertPageDto): Promise<any>;
    getPublicPage(storeSlug: string, slug: string): Promise<{
        store: any;
        theme: import("./templates").Theme;
        page: {
            slug: any;
            title: any;
            sections: any;
        };
    }>;
    upsertLanding(userId: string, productId: string, dto: UpsertLandingDto): Promise<any>;
    getPublicLanding(slug: string): Promise<{
        page: {
            slug: any;
            theme: any;
            sections: any;
        };
        product: any;
    }>;
    private defaultLandingSections;
    private assertTitle;
    private ownedStore;
}
