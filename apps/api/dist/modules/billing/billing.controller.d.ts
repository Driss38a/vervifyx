import { AuthUser } from '../auth/decorators/current-user.decorator';
import { FxRateDto, SubscribeDto } from './billing.dto';
import { BillingService } from './billing.service';
import { FxService } from './fx.service';
export declare class BillingController {
    private billing;
    private fx;
    constructor(billing: BillingService, fx: FxService);
    plans(audience?: string): any;
    me(user: AuthUser): Promise<any>;
    subscribe(user: AuthUser, dto: SubscribeDto): Promise<any>;
    setRate(dto: FxRateDto): any;
}
