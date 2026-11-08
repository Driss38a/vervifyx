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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const social_dto_1 = require("./social.dto");
const social_service_1 = require("./social.service");
let SocialController = class SocialController {
    constructor(social) {
        this.social = social;
    }
    profile(username) { return this.social.profile(username); }
    userPosts(username, q) { return this.social.userPosts(username, q); }
    feed(user, q) { return this.social.feed(user.id, q); }
    create(user, dto) { return this.social.createPost(user.id, dto); }
    remove(user, id) { return this.social.deletePost(user.id, id); }
    comments(id, q) { return this.social.comments(id, q); }
    comment(user, id, dto) {
        return this.social.addComment(user.id, id, dto);
    }
    like(user, id) { return this.social.toggleLike(user.id, id); }
    follow(user, username) { return this.social.follow(user.id, username); }
    unfollow(user, username) { return this.social.unfollow(user.id, username); }
    moderate(id, dto) { return this.social.moderatePost(id, dto.action); }
};
exports.SocialController = SocialController;
__decorate([
    (0, common_1.Get)('users/:username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "profile", null);
__decorate([
    (0, common_1.Get)('users/:username/posts'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, social_dto_1.CursorQueryDto]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "userPosts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('feed'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _a : Object, social_dto_1.FeedQueryDto]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "feed", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('posts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _b : Object, social_dto_1.CreatePostDto]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('posts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _c : Object, String]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('posts/:id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, social_dto_1.CursorQueryDto]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "comments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('posts/:id/comments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _d : Object, String, social_dto_1.CommentDto]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "comment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('posts/:id/like'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _e : Object, String]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "like", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('users/:username/follow'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _f : Object, String]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "follow", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('users/:username/follow'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof current_user_decorator_1.AuthUser !== "undefined" && current_user_decorator_1.AuthUser) === "function" ? _g : Object, String]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "unfollow", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MODERATOR, client_1.Role.ADMIN),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('posts/admin/:id/moderate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, social_dto_1.ModeratePostDto]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "moderate", null);
exports.SocialController = SocialController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [social_service_1.SocialService])
], SocialController);
//# sourceMappingURL=social.controller.js.map