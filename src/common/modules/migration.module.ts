import { Module } from '@nestjs/common';

import { LoggingService } from '../services/logging.service';
import { MigrationService } from '../services/migration.service';

@Module({
  providers: [MigrationService, LoggingService],
  exports: [MigrationService],
})
export class MigrationModule {}
