#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MigrationService } from '../common/services/migration.service';
import { LoggingService } from '../common/services/logging.service';

async function checkMigrations() {
  // eslint-disable-next-line no-console
  console.log('🔍 Checking migration status...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const migrationService = app.get(MigrationService);
    const loggingService = app.get(LoggingService);

    // Get migration status
    const status = await migrationService.getMigrationStatus();

    // eslint-disable-next-line no-console
    console.log(
      `📊 Migration Status: ${status.executed}/${status.total} executed`,
    );

    if (status.pending > 0) {
      // eslint-disable-next-line no-console
      console.log(`⚠️  ${status.pending} pending migrations found`);

      // Get pending migrations
      const pendingMigrations = await migrationService.getPendingMigrations();
      if (pendingMigrations && pendingMigrations.length > 0) {
        // eslint-disable-next-line no-console
        console.log('📋 Pending migrations:');
        pendingMigrations.forEach((migration) => {
          // eslint-disable-next-line no-console
          console.log(`  - ${migration.name}`);
        });
      }

      await app.close();
      process.exit(1); // Exit with error if pending migrations
    }

    // eslint-disable-next-line no-console
    console.log('✅ No pending migrations');

    await app.close();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '❌ Migration check failed:',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  // eslint-disable-next-line no-console
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Check migrations
checkMigrations();
