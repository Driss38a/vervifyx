"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const wallet_module_1 = require("../wallet/wallet.module");
const payments_controller_1 = require("./payments.controller");
const payouts_service_1 = require("./payouts.service");
const stripe_service_1 = require("./stripe.service");
const topups_service_1 = require("./topups.service");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [wallet_module_1.WalletModule],
        controllers: [payments_controller_1.PaymentsController],
        providers: [stripe_service_1.StripeService, topups_service_1.TopUpsService, payouts_service_1.PayoutsService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map