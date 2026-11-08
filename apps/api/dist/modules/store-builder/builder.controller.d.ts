import { AuthUser } from '../auth/decorators/current-user.decorator';
import { ApplyTemplateDto, UpsertLandingDto, UpsertPageDto } from './builder.dto';
import { BuilderService } from './builder.service';
export declare class BuilderController {
    private builder;
    constructor(builder: BuilderService);
    templates(): import("./templates").TemplateDef[];
    publicLanding(slug: string): Promise<{
        page: {
            slug: any;
            theme: any;
            sections: any;
        };
        product: any;
    }>;
    publicPage(storeSlug: string, slug: string): Promise<{
        store: any;
        theme: import("./templates").Theme;
        page: {
            slug: any;
            title: any;
            sections: any;
        };
    }>;
    apply(user: AuthUser, storeId: string, dto: ApplyTemplateDto): Promise<any>;
    upsertPage(user: AuthUser, storeId: string, slug: string, dto: UpsertPageDto): Promise<any>;
    upsertLanding(user: AuthUser, productId: string, dto: UpsertLandingDto): Promise<any>;
}
