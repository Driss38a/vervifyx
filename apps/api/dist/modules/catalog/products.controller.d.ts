import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateProductDto, ProductQueryDto, ReviewProductDto, UpdateProductDto } from './products.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private products;
    constructor(products: ProductsService);
    list(q: ProductQueryDto): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    mine(user: AuthUser, storeId?: string): any;
    pending(page?: string): any;
    review(id: string, dto: ReviewProductDto): Promise<any>;
    get(id: string): Promise<any>;
    create(user: AuthUser, storeId: string, dto: CreateProductDto): Promise<any>;
    update(user: AuthUser, id: string, dto: UpdateProductDto): Promise<any>;
    archive(user: AuthUser, id: string): Promise<any>;
}
