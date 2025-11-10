import { ApiKeysService } from '../api-keys/api-keys.service';
export declare class GitHubSummarizerService {
    private readonly apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    processRequest(apiKey: string, gitHubUrl: string): Promise<{
        message: string;
        gitHubUrl: string;
        status: string;
    }>;
}
