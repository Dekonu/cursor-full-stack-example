import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { GitHubSummarizerService } from './github-summarizer.service';
import { GitHubSummarizerDto } from './dto/github-summarizer.dto';

@Controller('github-summarizer')
export class GitHubSummarizerController {
  constructor(private readonly githubSummarizerService: GitHubSummarizerService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async summarize(@Body() dto: GitHubSummarizerDto, @Headers() headers: Record<string, string>) {
    const apiKey =
      headers['x-api-key'] ||
      headers['authorization']?.replace('Bearer ', '') ||
      headers['authorization']?.replace('ApiKey ', '');

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new HttpException(
        {
          error:
            'API key is required. Please provide it in the X-API-Key header or Authorization header.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      return await this.githubSummarizerService.processRequest(apiKey.trim(), dto.gitHubUrl);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { error: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

