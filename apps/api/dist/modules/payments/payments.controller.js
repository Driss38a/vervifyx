"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const payments_dto_1 = require("./payments.dto");
const payouts_service_1 = require("./payouts.service");
const stripe_service_1 = require("./stripe.service");
const topups_service_1 = require("./topups.service");
let PaymentsController = class PaymentsController {
    constructor(topups, payouts, stripe) {
        this.topups = topups;
        this.payouts = payouts;
        this.stripe = stripe;
    }
    topUp(user, dto) { return this.topups.start(user.id, dto.amountMinor); }
    topUpStatus(user, id) { return this.topups.status(user.id, id); }
    async stripeWebhook(req, signature) {
        const event = this.stripe.verifyWebhook(req.rawBody, signature);
        await this.topups.handleStripeEvent(event);
        return { received: true };
    }
    requestPayout(user, dto) { return this.payouts.request(user.id, dto); }
    myPayouts(user) { return this.payouts.mine(user.id); }
    pendingPayouts() { return this.payouts.pending(); }
    paid(id, dto) { return this.payouts.markPaid(id, dto.reference); }
    reject(id, dto) { return this.payouts.reject(id, dto.note); }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('payments/topups'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _a : Object, payments_dto_1.TopUpDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "topUp", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('payments/topups/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _b : Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "topUpStatus", null);
__decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('payments/webhooks/stripe'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "stripeWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('payouts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _c : Object, payments_dto_1.PayoutRequestDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "requestPayout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('payouts/mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "myPayouts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)('payouts/admin/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "pendingPayouts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('payouts/admin/:id/paid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payments_dto_1.PayoutPaidDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "paid", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('payouts/admin/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payments_dto_1.PayoutRejectDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "reject", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [topups_service_1.TopUpsService, payouts_service_1.PayoutsService, stripe_service_1.StripeService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map