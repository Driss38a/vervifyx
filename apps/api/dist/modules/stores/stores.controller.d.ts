import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateStoreDto, StoreQueryDto, UpdateStoreDto } from './stores.dto';
import { StoresService } from './stores.service';
export declare class StoresController {
    private stores;
    constructor(stores: StoresService);
    list(q: StoreQueryDto): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    mine(user: AuthUser): any;
    get(slug: string): Promise<any>;
    create(user: AuthUser, dto: CreateStoreDto): Promise<any>;
    update(user: AuthUser, id: string, dto: UpdateStoreDto): Promise<any>;
}
