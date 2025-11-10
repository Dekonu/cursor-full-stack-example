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
exports.GitHubSummarizerController = void 0;
const common_1 = require("@nestjs/common");
const github_summarizer_service_1 = require("./github-summarizer.service");
const github_summarizer_dto_1 = require("./dto/github-summarizer.dto");
let GitHubSummarizerController = class GitHubSummarizerController {
    constructor(githubSummarizerService) {
        this.githubSummarizerService = githubSummarizerService;
    }
    async summarize(dto, headers) {
        const apiKey = headers['x-api-key'] ||
            headers['authorization']?.replace('Bearer ', '') ||
            headers['authorization']?.replace('ApiKey ', '');
        if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
            throw new common_1.HttpException({
                error: 'API key is required. Please provide it in the X-API-Key header or Authorization header.',
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            return await this.githubSummarizerService.processRequest(apiKey.trim(), dto.gitHubUrl);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({ error: 'Internal server error' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.GitHubSummarizerController = GitHubSummarizerController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [github_summarizer_dto_1.GitHubSummarizerDto, Object]),
    __metadata("design:returntype", Promise)
], GitHubSummarizerController.prototype, "summarize", null);
exports.GitHubSummarizerController = GitHubSummarizerController = __decorate([
    (0, common_1.Controller)('github-summarizer'),
    __metadata("design:paramtypes", [github_summarizer_service_1.GitHubSummarizerService])
], GitHubSummarizerController);
//# sourceMappingURL=github-summarizer.controller.js.map