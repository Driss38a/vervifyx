import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './products.dto';
export declare class ProductsService {
    private prisma;
    private moderation;
    private config;
    constructor(prisma: PrismaService, moderation: ModerationService, config: ConfigService);
    create(userId: string, storeId: string, dto: CreateProductDto): Promise<any>;
    update(userId: string, id: string, dto: UpdateProductDto): Promise<any>;
    archive(userId: string, id: string): Promise<any>;
    listPublic(q: ProductQueryDto): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    getPublic(id: string): Promise<any>;
    mine(userId: string, storeId?: string): any;
    pending(page?: number): any;
    review(id: string, action: 'APPROVE' | 'REJECT', note?: string): Promise<any>;
    private assertNotRejected;
    private decideStatus;
    private resolveCategory;
}
