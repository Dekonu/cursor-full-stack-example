import { Module } from '@nestjs/common';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { MetricsModule } from './metrics/metrics.module';
import { GitHubSummarizerModule } from './github-summarizer/github-summarizer.module';
import { ValidateModule } from './validate/validate.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    SupabaseModule,
    ApiKeysModule,
    MetricsModule,
    GitHubSummarizerModule,
    ValidateModule,
  ],
})
export class AppModule {}

