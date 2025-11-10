import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ApiMetrics {
  totalRequests: number;
  requestsToday: number;
  avgResponseTime: number;
  successRate: number;
  usageData: Array<{ date: string; count: number }>;
}

@Injectable()
export class MetricsService {
  constructor(private supabaseService: SupabaseService) {}

  async getApiMetrics(): Promise<ApiMetrics> {
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

      const todayUsage = allUsage.filter(
        (usage) => new Date(usage.timestamp) >= todayStart,
      );
      const last7DaysUsage = allUsage.filter(
        (usage) => new Date(usage.timestamp) >= sevenDaysAgo,
      );

      const totalRequests = allUsage.length;
      const requestsToday = todayUsage.length;

      const successfulRequests = allUsage.filter((usage) => usage.success).length;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

      const responseTimes = allUsage
        .filter((usage) => usage.responseTime !== undefined)
        .map((usage) => usage.responseTime!);
      const avgResponseTime =
        responseTimes.length > 0
          ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
          : 0;

      const usageData: Array<{ date: string; count: number }> = [];
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
    } catch (error) {
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
}

