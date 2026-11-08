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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const wallet_service_1 = require("./wallet.service");
class AdminCreditDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdminCreditDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100_000_000),
    __metadata("design:type", Number)
], AdminCreditDto.prototype, "amountMinor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 100),
    __metadata("design:type", String)
], AdminCreditDto.prototype, "reference", void 0);
let WalletController = class WalletController {
    constructor(wallet) {
        this.wallet = wallet;
    }
    me(user) { return this.wallet.get(user.id); }
    tx(user, page) {
        return this.wallet.transactions(user.id, page ? Math.max(1, Number(page) || 1) : 1);
    }
    async adminCredit(admin, dto) {
        await this.wallet.adminCredit(admin.id, dto.userId, dto.amountMinor, dto.reference);
        return { success: true };
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _a : Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _b : Object, String]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "tx", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('admin/credit'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _c : Object, AdminCreditDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "adminCredit", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map