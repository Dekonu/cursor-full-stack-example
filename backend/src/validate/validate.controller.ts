import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ValidateService } from './validate.service';
import { ValidateDto } from './dto/validate.dto';

@Controller('validate')
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async validate(@Body() dto: ValidateDto) {
    if (!dto.apiKey || typeof dto.apiKey !== 'string' || dto.apiKey.trim().length === 0) {
      throw new HttpException(
        { error: 'API key is required', valid: false },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.validateService.validateApiKey(dto.apiKey.trim());
  }
}

