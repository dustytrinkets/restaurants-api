#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MigrationService } from '../common/services/migration.service';
import { LoggingService } from '../common/services/logging.service';

async function runMigrations() {
  console.log('🚀 Starting migration execution...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const migrationService = app.get(MigrationService);
    const loggingService = app.get(LoggingService);

    // Check current status
    loggingService.logMessage(
      'Checking migration status before execution',
      'MIGRATION',
      'log',
    );
    const status = await migrationService.getMigrationStatus();

    console.log(
      `📊 Migration Status: ${status.executed}/${status.total} executed`,
    );

    if (status.pending === 0) {
      console.log('✅ No pending migrations to execute');
      await app.close();
      process.exit(0);
    }

    // Run migrations
    loggingService.logMessage(
      'Executing pending migrations',
      'MIGRATION',
      'log',
    );
    await migrationService.runMigrations();

    // Verify execution
    const finalStatus = await migrationService.getMigrationStatus();
    loggingService.logMessage(
      `Migration execution completed: ${finalStatus.executed}/${finalStatus.total} executed`,
      'MIGRATION',
      'log',
    );

    console.log('✅ All migrations executed successfully');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error(
      '❌ Migration execution failed:',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Run migrations
runMigrations();
