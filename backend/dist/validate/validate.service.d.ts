import { ApiKeysService } from '../api-keys/api-keys.service';
export declare class ValidateService {
    private readonly apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    validateApiKey(apiKey: string): Promise<{
        valid: boolean;
        error?: undefined;
    } | {
        error: string;
        valid: boolean;
    }>;
}
