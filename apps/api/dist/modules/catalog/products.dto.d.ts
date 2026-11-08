import { ProductType } from '@prisma/client';
import { PaginationDto } from '../../common/pagination.dto';
export declare class VariantDto {
    name: string;
    priceMinor?: number;
    stock?: number;
}
export declare class CreateProductDto {
    type: ProductType;
    title: string;
    description: string;
    priceMinor: number;
    currency?: string;
    stock?: number;
    categorySlug?: string;
    variants?: VariantDto[];
}
export declare class UpdateProductDto {
    title?: string;
    description?: string;
    priceMinor?: number;
    stock?: number;
    categorySlug?: string;
    variants?: VariantDto[];
}
export declare class ProductQueryDto extends PaginationDto {
    q?: string;
    type?: ProductType;
    category?: string;
    store?: string;
}
export declare class ReviewProductDto {
    action: 'APPROVE' | 'REJECT';
    note?: string;
}
