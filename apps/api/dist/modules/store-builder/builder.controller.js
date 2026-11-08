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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const builder_dto_1 = require("./builder.dto");
const builder_service_1 = require("./builder.service");
let BuilderController = class BuilderController {
    constructor(builder) {
        this.builder = builder;
    }
    templates() { return this.builder.listTemplates(); }
    publicLanding(slug) { return this.builder.getPublicLanding(slug); }
    publicPage(storeSlug, slug) {
        return this.builder.getPublicPage(storeSlug, slug);
    }
    apply(user, storeId, dto) {
        return this.builder.applyTemplate(user.id, storeId, dto.templateKey);
    }
    upsertPage(user, storeId, slug, dto) { return this.builder.upsertPage(user.id, storeId, slug, dto); }
    upsertLanding(user, productId, dto) {
        return this.builder.upsertLanding(user.id, productId, dto);
    }
};
exports.BuilderController = BuilderController;
__decorate([
    (0, common_1.Get)('templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BuilderController.prototype, "templates", null);
__decorate([
    (0, common_1.Get)('public/landing/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BuilderController.prototype, "publicLanding", null);
__decorate([
    (0, common_1.Get)('public/:storeSlug/pages/:slug'),
    __param(0, (0, common_1.Param)('storeSlug')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BuilderController.prototype, "publicPage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SELLER, client_1.Role.CREATOR),
    (0, common_1.Post)('stores/:storeId/apply-template'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _a : Object, String, builder_dto_1.ApplyTemplateDto]),
    __metadata("design:returntype", void 0)
], BuilderController.prototype, "apply", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SELLER, client_1.Role.CREATOR),
    (0, common_1.Put)('stores/:storeId/pages/:slug'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, common_1.Param)('slug')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _b : Object, String, String, builder_dto_1.UpsertPageDto]),
    __metadata("design:returntype", void 0)
], BuilderController.prototype, "upsertPage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SELLER, client_1.Role.CREATOR),
    (0, common_1.Put)('products/:productId/landing'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _c : Object, String, builder_dto_1.UpsertLandingDto]),
    __metadata("design:returntype", void 0)
], BuilderController.prototype, "upsertLanding", null);
exports.BuilderController = BuilderController = __decorate([
    (0, common_1.Controller)('builder'),
    __metadata("design:paramtypes", [builder_service_1.BuilderService])
], BuilderController);
//# sourceMappingURL=builder.controller.js.map