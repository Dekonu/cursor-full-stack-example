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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let MetricsService = class MetricsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getApiMetrics() {
        try {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { data: allUsageData, error: allUsageError } = await this.supabaseService
                .getClient()
                .from('api_usage')
                .select('*');
            if (allUsageError) {
                console.error('Error fetching usage data:', allUsageError);
                throw allUsageError;
            }
            const allUsage = (allUsageData || []).map((row) => ({
                keyId: row.key_id,
                timestamp: new Date(row.timestamp).toISOString(),
                responseTime: row.response_time,
                success: row.success,
            }));
            const todayUsage = allUsage.filter((usage) => new Date(usage.timestamp) >= todayStart);
            const last7DaysUsage = allUsage.filter((usage) => new Date(usage.timestamp) >= sevenDaysAgo);
            const totalRequests = allUsage.length;
            const requestsToday = todayUsage.length;
            const successfulRequests = allUsage.filter((usage) => usage.success).length;
            const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
            const responseTimes = allUsage
                .filter((usage) => usage.responseTime !== undefined)
                .map((usage) => usage.responseTime);
            const avgResponseTime = responseTimes.length > 0
                ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
                : 0;
            const usageData = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const dayEnd = new Date(dayStart);
                dayEnd.setDate(dayEnd.getDate() + 1);
                const count = last7DaysUsage.filter((usage) => {
                    const usageDate = new Date(usage.timestamp);
                    return usageDate >= dayStart && usageDate < dayEnd;
                }).length;
                usageData.push({ date: dateStr, count });
            }
            return {
                totalRequests,
                requestsToday,
                avgResponseTime,
                successRate: Math.round(successRate * 10) / 10,
                usageData,
            };
        }
        catch (error) {
            console.error('Failed to get API metrics:', error);
            return {
                totalRequests: 0,
                requestsToday: 0,
                avgResponseTime: 0,
                successRate: 0,
                usageData: [],
            };
        }
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map