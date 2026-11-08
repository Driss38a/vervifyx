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
exports.ShipmentEventDto = exports.AssignDto = exports.CarrierStatusDto = exports.SetZonesDto = exports.ZoneDto = exports.RegisterCarrierDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class RegisterCarrierDto {
}
exports.RegisterCarrierDto = RegisterCarrierDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 120),
    __metadata("design:type", String)
], RegisterCarrierDto.prototype, "companyName", void 0);
class ZoneDto {
}
exports.ZoneDto = ZoneDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], ZoneDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 80),
    __metadata("design:type", String)
], ZoneDto.prototype, "region", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100_000_000),
    __metadata("design:type", Number)
], ZoneDto.prototype, "priceMinor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], ZoneDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], ZoneDto.prototype, "etaDays", void 0);
class SetZonesDto {
}
exports.SetZonesDto = SetZonesDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(500),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ZoneDto),
    __metadata("design:type", Array)
], SetZonesDto.prototype, "zones", void 0);
class CarrierStatusDto {
}
exports.CarrierStatusDto = CarrierStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(['ACTIVE', 'SUSPENDED']),
    __metadata("design:type", String)
], CarrierStatusDto.prototype, "status", void 0);
class AssignDto {
}
exports.AssignDto = AssignDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['AUTO', 'MANUAL']),
    __metadata("design:type", String)
], AssignDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignDto.prototype, "carrierId", void 0);
class ShipmentEventDto {
}
exports.ShipmentEventDto = ShipmentEventDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ShipmentStatus),
    __metadata("design:type", String)
], ShipmentEventDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 300),
    __metadata("design:type", String)
], ShipmentEventDto.prototype, "note", void 0);
//# sourceMappingURL=shipping.dto.js.map