import { Module } from '@nestjs/common';
import { MigrationService } from '../services/migration.service';
import { LoggingService } from '../services/logging.service';

@Module({
  providers: [MigrationService, LoggingService],
  exports: [MigrationService],
})
export class MigrationModule {}
