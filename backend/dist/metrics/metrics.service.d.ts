import { SupabaseService } from '../supabase/supabase.service';
export interface ApiMetrics {
    totalRequests: number;
    requestsToday: number;
    avgResponseTime: number;
    successRate: number;
    usageData: Array<{
        date: string;
        count: number;
    }>;
}
export declare class MetricsService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    getApiMetrics(): Promise<ApiMetrics>;
}
