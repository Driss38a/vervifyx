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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeratePostDto = exports.FeedQueryDto = exports.CursorQueryDto = exports.CommentDto = exports.CreatePostDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreatePostDto {
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 5000),
    __metadata("design:type", String)
], CreatePostDto.prototype, "body", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(10),
    (0, class_validator_1.IsUrl)({ protocols: ['https'], require_protocol: true }, { each: true }),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "mediaUrls", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "productId", void 0);
class CommentDto {
}
exports.CommentDto = CommentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 2000),
    __metadata("design:type", String)
], CommentDto.prototype, "body", void 0);
class CursorQueryDto {
}
exports.CursorQueryDto = CursorQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CursorQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CursorQueryDto.prototype, "limit", void 0);
class FeedQueryDto extends CursorQueryDto {
}
exports.FeedQueryDto = FeedQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['following', 'discover']),
    __metadata("design:type", String)
], FeedQueryDto.prototype, "mode", void 0);
class ModeratePostDto {
}
exports.ModeratePostDto = ModeratePostDto;
__decorate([
    (0, class_validator_1.IsIn)(['APPROVE', 'REMOVE']),
    __metadata("design:type", String)
], ModeratePostDto.prototype, "action", void 0);
//# sourceMappingURL=social.dto.js.map