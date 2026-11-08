"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const moderation_module_1 = require("./modules/moderation/moderation.module");
const stores_module_1 = require("./modules/stores/stores.module");
const catalog_module_1 = require("./modules/catalog/catalog.module");
const builder_module_1 = require("./modules/store-builder/builder.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const orders_module_1 = require("./modules/orders/orders.module");
const shipping_module_1 = require("./modules/shipping/shipping.module");
const billing_module_1 = require("./modules/billing/billing.module");
const payments_module_1 = require("./modules/payments/payments.module");
const social_module_1 = require("./modules/social/social.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            moderation_module_1.ModerationModule,
            stores_module_1.StoresModule,
            catalog_module_1.CatalogModule,
            builder_module_1.StoreBuilderModule,
            wallet_module_1.WalletModule,
            orders_module_1.OrdersModule,
            shipping_module_1.ShippingModule,
            billing_module_1.BillingModule,
            payments_module_1.PaymentsModule,
            social_module_1.SocialModule,
            messaging_module_1.MessagingModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map