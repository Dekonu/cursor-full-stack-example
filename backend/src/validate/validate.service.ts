import { Injectable } from '@nestjs/common';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class ValidateService {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async validateApiKey(apiKey: string) {
    try {
      const key = await this.apiKeysService.getApiKeyByKey(apiKey);

      if (!key) {
        return { valid: false };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating API key:', error);
      return { error: 'Failed to validate API key', valid: false };
    }
  }
}

