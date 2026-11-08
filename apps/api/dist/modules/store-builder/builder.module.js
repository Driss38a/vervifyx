"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreBuilderModule = void 0;
const common_1 = require("@nestjs/common");
const builder_controller_1 = require("./builder.controller");
const builder_service_1 = require("./builder.service");
let StoreBuilderModule = class StoreBuilderModule {
};
exports.StoreBuilderModule = StoreBuilderModule;
exports.StoreBuilderModule = StoreBuilderModule = __decorate([
    (0, common_1.Module)({ controllers: [builder_controller_1.BuilderController], providers: [builder_service_1.BuilderService], exports: [builder_service_1.BuilderService] })
], StoreBuilderModule);
//# sourceMappingURL=builder.module.js.map