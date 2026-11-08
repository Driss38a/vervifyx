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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const shipping_dto_1 = require("./shipping.dto");
const settlements_service_1 = require("./settlements.service");
const shipping_service_1 = require("./shipping.service");
let ShippingController = class ShippingController {
    constructor(shipping, settlements) {
        this.shipping = shipping;
        this.settlements = settlements;
    }
    list(country) { return this.shipping.listPublic(country); }
    policy() { return this.shipping.rankingPolicy(); }
    track(code) { return this.shipping.track(code); }
    register(user, dto) { return this.shipping.register(user.id, dto); }
    me(user) { return this.shipping.myCarrier(user.id); }
    zones(user, dto) { return this.shipping.setZones(user.id, dto); }
    myShipments(user) { return this.shipping.carrierShipments(user.id); }
    event(user, id, dto) {
        return this.shipping.addEvent(user.id, id, dto);
    }
    rates(user, orderId) { return this.shipping.ratesForOrder(user.id, orderId); }
    assign(user, orderId, dto) {
        return this.shipping.assign(user.id, orderId, dto);
    }
    mySettlements(user) { return this.settlements.mine(user.id, user.role); }
    pending() { return this.settlements.pending(); }
    remit(id) { return this.settlements.remit(id); }
    status(id, dto) { return this.shipping.setStatus(id, dto.status); }
};
exports.ShippingController = ShippingController;
__decorate([
    (0, common_1.Get)('carriers'),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('shipping/ranking-policy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "policy", null);
__decorate([
    (0, common_1.Get)('tracking/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "track", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CARRIER),
    (0, common_1.Post)('carriers'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _a : Object, shipping_dto_1.RegisterCarrierDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CARRIER),
    (0, common_1.Get)('carriers/me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "me", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CARRIER),
    (0, common_1.Put)('carriers/me/zones'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _c : Object, shipping_dto_1.SetZonesDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "zones", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CARRIER),
    (0, common_1.Get)('shipping/carrier/shipments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "myShipments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CARRIER),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('shipping/shipments/:id/events'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _e : Object, String, shipping_dto_1.ShipmentEventDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "event", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SELLER, client_1.Role.CREATOR),
    (0, common_1.Get)('shipping/orders/:orderId/rates'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _f : Object, String]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "rates", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SELLER, client_1.Role.CREATOR),
    (0, common_1.Post)('shipping/orders/:orderId/assign'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _g : Object, String, shipping_dto_1.AssignDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "assign", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('settlements/mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "mySettlements", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)('settlements/admin/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "pending", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('settlements/admin/:id/remit'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "remit", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Patch)('carriers/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shipping_dto_1.CarrierStatusDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "status", null);
exports.ShippingController = ShippingController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [shipping_service_1.ShippingService, settlements_service_1.SettlementsService])
], ShippingController);
//# sourceMappingURL=shipping.controller.js.map