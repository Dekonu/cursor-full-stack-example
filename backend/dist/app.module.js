"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const api_keys_module_1 = require("./api-keys/api-keys.module");
const metrics_module_1 = require("./metrics/metrics.module");
const github_summarizer_module_1 = require("./github-summarizer/github-summarizer.module");
const validate_module_1 = require("./validate/validate.module");
const supabase_module_1 = require("./supabase/supabase.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            supabase_module_1.SupabaseModule,
            api_keys_module_1.ApiKeysModule,
            metrics_module_1.MetricsModule,
            github_summarizer_module_1.GitHubSummarizerModule,
            validate_module_1.ValidateModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map