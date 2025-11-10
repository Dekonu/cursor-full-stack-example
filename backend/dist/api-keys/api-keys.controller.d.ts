import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
export declare class ApiKeysController {
    private readonly apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    getAllApiKeys(): Promise<import("./interfaces/api-key.interface").ApiKey[]>;
    getApiKeyById(id: string): Promise<{
        key: string;
        id: string;
        name: string;
        createdAt: string;
        lastUsed?: string;
        usageCount: number;
        remainingUses: number;
        actualUsage?: number;
    }>;
    revealApiKey(id: string): Promise<{
        id: string;
        key: string;
    }>;
    createApiKey(createApiKeyDto: CreateApiKeyDto): Promise<import("./interfaces/api-key.interface").ApiKey>;
    updateApiKey(id: string, updateApiKeyDto: UpdateApiKeyDto): Promise<{
        key: string;
        id: string;
        name: string;
        createdAt: string;
        lastUsed?: string;
        usageCount: number;
        remainingUses: number;
        actualUsage?: number;
    }>;
    deleteApiKey(id: string): Promise<{
        message: string;
    }>;
}
