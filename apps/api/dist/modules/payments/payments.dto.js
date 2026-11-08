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
exports.PayoutRejectDto = exports.PayoutPaidDto = exports.PayoutRequestDto = exports.TopUpDto = void 0;
const class_validator_1 = require("class-validator");
class TopUpDto {
}
exports.TopUpDto = TopUpDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(5_000_000),
    __metadata("design:type", Number)
], TopUpDto.prototype, "amountMinor", void 0);
class PayoutRequestDto {
}
exports.PayoutRequestDto = PayoutRequestDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100_000_000),
    __metadata("design:type", Number)
], PayoutRequestDto.prototype, "amountMinor", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['BANK_TRANSFER', 'PAYPAL', 'MOBILE_MONEY', 'OTHER']),
    __metadata("design:type", String)
], PayoutRequestDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(5, 200),
    __metadata("design:type", String)
], PayoutRequestDto.prototype, "destination", void 0);
class PayoutPaidDto {
}
exports.PayoutPaidDto = PayoutPaidDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 120),
    __metadata("design:type", String)
], PayoutPaidDto.prototype, "reference", void 0);
class PayoutRejectDto {
}
exports.PayoutRejectDto = PayoutRejectDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 300),
    __metadata("design:type", String)
], PayoutRejectDto.prototype, "note", void 0);
//# sourceMappingURL=payments.dto.js.map