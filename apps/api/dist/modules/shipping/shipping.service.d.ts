import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { OrdersService } from '../orders/orders.service';
import { AssignDto, RegisterCarrierDto, SetZonesDto, ShipmentEventDto } from './shipping.dto';
export declare class ShippingService {
    private prisma;
    private moderation;
    private orders;
    constructor(prisma: PrismaService, moderation: ModerationService, orders: OrdersService);
    register(userId: string, dto: RegisterCarrierDto): Promise<any>;
    myCarrier(userId: string): Promise<any>;
    setZones(userId: string, dto: SetZonesDto): Promise<any>;
    setStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): any;
    listPublic(country?: string): any;
    rankingPolicy(): {
        weights: {
            readonly price: 0.35;
            readonly speed: 0.25;
            readonly rating: 0.25;
            readonly reliability: 0.15;
        };
        rules: string[];
    };
    ratesForOrder(ownerId: string, orderId: string): Promise<any[]>;
    assign(ownerId: string, orderId: string, dto: AssignDto): Promise<any>;
    carrierShipments(userId: string): Promise<any>;
    addEvent(userId: string, shipmentId: string, dto: ShipmentEventDto): Promise<any>;
    track(code: string): Promise<any>;
    private sellerOrder;
    private computeRates;
}
