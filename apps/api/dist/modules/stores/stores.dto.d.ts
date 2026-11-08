import { PaginationDto } from '../../common/pagination.dto';
export declare class CreateStoreDto {
    name: string;
    slug?: string;
    description?: string;
    templateKey?: string;
    currency?: string;
    country?: string;
}
export declare class UpdateStoreDto {
    name?: string;
    description?: string;
    logoUrl?: string;
    shippingFlatMinor?: number;
    freeShippingOverMinor?: number;
}
export declare class StoreQueryDto extends PaginationDto {
    q?: string;
}
