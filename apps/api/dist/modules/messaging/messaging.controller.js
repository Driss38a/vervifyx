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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const messaging_dto_1 = require("./messaging.dto");
const messaging_service_1 = require("./messaging.service");
let MessagingController = class MessagingController {
    constructor(messaging) {
        this.messaging = messaging;
    }
    open(user, dto) { return this.messaging.open(user.id, dto.userId); }
    openStore(user, slug) { return this.messaging.openWithStore(user.id, slug); }
    list(user) { return this.messaging.list(user.id); }
    messages(user, id, q) {
        return this.messaging.messages(user.id, id, q);
    }
    send(user, id, dto) {
        return this.messaging.send(user.id, id, dto.body);
    }
    read(user, id) { return this.messaging.markRead(user.id, id); }
};
exports.MessagingController = MessagingController;
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _a : Object, messaging_dto_1.OpenConversationDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "open", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('conversations/store/:slug'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _b : Object, String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "openStore", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _d : Object, String, messaging_dto_1.MessagesQueryDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "messages", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { ttl: 60_000, limit: 40 } }),
    (0, common_1.Post)('conversations/:id/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _e : Object, String, messaging_dto_1.SendMessageDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "send", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('conversations/:id/read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _f : Object, String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "read", null);
exports.MessagingController = MessagingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('messages'),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService])
], MessagingController);
//# sourceMappingURL=messaging.controller.js.map