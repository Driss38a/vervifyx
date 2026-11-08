import { AuthUser } from '../auth/decorators/current-user.decorator';
import { AssignDto, CarrierStatusDto, RegisterCarrierDto, SetZonesDto, ShipmentEventDto } from './shipping.dto';
import { SettlementsService } from './settlements.service';
import { ShippingService } from './shipping.service';
export declare class ShippingController {
    private shipping;
    private settlements;
    constructor(shipping: ShippingService, settlements: SettlementsService);
    list(country?: string): any;
    policy(): {
        weights: {
            readonly price: 0.35;
            readonly speed: 0.25;
            readonly rating: 0.25;
            readonly reliability: 0.15;
        };
        rules: string[];
    };
    track(code: string): Promise<any>;
    register(user: AuthUser, dto: RegisterCarrierDto): Promise<any>;
    me(user: AuthUser): Promise<any>;
    zones(user: AuthUser, dto: SetZonesDto): Promise<any>;
    myShipments(user: AuthUser): Promise<any>;
    event(user: AuthUser, id: string, dto: ShipmentEventDto): Promise<any>;
    rates(user: AuthUser, orderId: string): Promise<any[]>;
    assign(user: AuthUser, orderId: string, dto: AssignDto): Promise<any>;
    mySettlements(user: AuthUser): Promise<any>;
    pending(): any;
    remit(id: string): any;
    status(id: string, dto: CarrierStatusDto): any;
}
