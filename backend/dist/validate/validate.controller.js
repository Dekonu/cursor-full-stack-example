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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateController = void 0;
const common_1 = require("@nestjs/common");
const validate_service_1 = require("./validate.service");
const validate_dto_1 = require("./dto/validate.dto");
let ValidateController = class ValidateController {
    constructor(validateService) {
        this.validateService = validateService;
    }
    async validate(dto) {
        if (!dto.apiKey || typeof dto.apiKey !== 'string' || dto.apiKey.trim().length === 0) {
            throw new common_1.HttpException({ error: 'API key is required', valid: false }, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.validateService.validateApiKey(dto.apiKey.trim());
    }
};
exports.ValidateController = ValidateController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_dto_1.ValidateDto]),
    __metadata("design:returntype", Promise)
], ValidateController.prototype, "validate", null);
exports.ValidateController = ValidateController = __decorate([
    (0, common_1.Controller)('validate'),
    __metadata("design:paramtypes", [validate_service_1.ValidateService])
], ValidateController);
//# sourceMappingURL=validate.controller.js.map