import { OrderStatus } from '@prisma/client';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private orders;
    constructor(orders: OrdersService);
    create(user: AuthUser, dto: CreateOrderDto): Promise<any>;
    mine(user: AuthUser, page?: string): any;
    forStore(user: AuthUser, storeId: string, status?: OrderStatus): Promise<any>;
    get(user: AuthUser, id: string): Promise<any>;
    confirm(user: AuthUser, id: string): Promise<any>;
    cancel(user: AuthUser, id: string): Promise<any>;
    complete(user: AuthUser, id: string): Promise<{
        currency: string;
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        storeId: string;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        buyerId: string;
        totalMinor: number;
        subtotalMinor: number;
        shippingFeeMinor: number;
        platformFeeMinor: number;
        buyerNote: string | null;
    }>;
}
