import { SupabaseService } from '../supabase/supabase.service';
import { ApiKey } from './interfaces/api-key.interface';
export declare class ApiKeysService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    private generateSecureApiKey;
    private maskApiKey;
    private dbRowToApiKey;
    private getActualUsageCount;
    getAllApiKeys(): Promise<ApiKey[]>;
    getApiKeyById(id: string): Promise<ApiKey | undefined>;
    getApiKeyByKey(keyString: string): Promise<ApiKey | undefined>;
    createApiKey(name: string): Promise<ApiKey>;
    updateApiKey(id: string, name: string): Promise<ApiKey | null>;
    deleteApiKey(id: string): Promise<boolean>;
    checkAndConsumeUsage(keyId: string): Promise<boolean>;
    recordApiUsage(keyId: string, responseTime?: number, success?: boolean): Promise<void>;
}
