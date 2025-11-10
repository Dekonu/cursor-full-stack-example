import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class GitHubSummarizerService {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async processRequest(apiKey: string, gitHubUrl: string) {
    // Validate API key against database
    const key = await this.apiKeysService.getApiKeyByKey(apiKey);

    if (!key) {
      throw new HttpException({ error: 'Invalid API key' }, HttpStatus.UNAUTHORIZED);
    }

    // Check if API key has remaining uses
    const hasRemainingUses = await this.apiKeysService.checkAndConsumeUsage(key.id);

    if (!hasRemainingUses) {
      throw new HttpException(
        {
          error: 'API key usage limit exceeded',
          remainingUses: key.remainingUses || 0,
          usageCount: key.usageCount,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!gitHubUrl || typeof gitHubUrl !== 'string' || gitHubUrl.trim().length === 0) {
      throw new HttpException(
        { error: 'gitHubUrl is required in the request body' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Record API usage for analytics (usage already consumed by checkAndConsumeUsage)
    await this.apiKeysService.recordApiUsage(key.id, undefined, true);

    // Placeholder response - doesn't do anything with the URL yet
    return {
      message: 'Request received successfully',
      gitHubUrl: gitHubUrl.trim(),
      status: 'pending',
    };
  }
}

