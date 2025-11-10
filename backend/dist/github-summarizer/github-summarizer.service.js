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
exports.GitHubSummarizerService = void 0;
const common_1 = require("@nestjs/common");
const api_keys_service_1 = require("../api-keys/api-keys.service");
let GitHubSummarizerService = class GitHubSummarizerService {
    constructor(apiKeysService) {
        this.apiKeysService = apiKeysService;
    }
    async processRequest(apiKey, gitHubUrl) {
        const key = await this.apiKeysService.getApiKeyByKey(apiKey);
        if (!key) {
            throw new common_1.HttpException({ error: 'Invalid API key' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        const hasRemainingUses = await this.apiKeysService.checkAndConsumeUsage(key.id);
        if (!hasRemainingUses) {
            throw new common_1.HttpException({
                error: 'API key usage limit exceeded',
                remainingUses: key.remainingUses || 0,
                usageCount: key.usageCount,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        if (!gitHubUrl || typeof gitHubUrl !== 'string' || gitHubUrl.trim().length === 0) {
            throw new common_1.HttpException({ error: 'gitHubUrl is required in the request body' }, common_1.HttpStatus.BAD_REQUEST);
        }
        await this.apiKeysService.recordApiUsage(key.id, undefined, true);
        return {
            message: 'Request received successfully',
            gitHubUrl: gitHubUrl.trim(),
            status: 'pending',
        };
    }
};
exports.GitHubSummarizerService = GitHubSummarizerService;
exports.GitHubSummarizerService = GitHubSummarizerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_keys_service_1.ApiKeysService])
], GitHubSummarizerService);
//# sourceMappingURL=github-summarizer.service.js.map