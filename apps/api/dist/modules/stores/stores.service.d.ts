import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreateStoreDto, StoreQueryDto, UpdateStoreDto } from './stores.dto';
export declare class StoresService {
    private prisma;
    private moderation;
    constructor(prisma: PrismaService, moderation: ModerationService);
    create(ownerId: string, dto: CreateStoreDto): Promise<any>;
    listPublic(q: StoreQueryDto): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    getBySlug(slug: string): Promise<any>;
    mine(ownerId: string): any;
    update(ownerId: string, id: string, dto: UpdateStoreDto): Promise<any>;
    private assertAllowed;
}
