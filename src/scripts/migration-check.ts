#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MigrationService } from '../common/services/migration.service';

async function checkMigrations() {
  console.log('🔍 Checking migration status...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const migrationService = app.get(MigrationService);

    // Get migration status
    const status = await migrationService.getMigrationStatus();

    console.log(
      `📊 Migration Status: ${status.executed}/${status.total} executed`,
    );

    if (status.pending > 0) {
      console.log(`⚠️  ${status.pending} pending migrations found`);

      // Get pending migrations
      const pendingMigrations = await migrationService.getPendingMigrations();
      if (pendingMigrations && pendingMigrations.length > 0) {
        console.log('📋 Pending migrations:');
        pendingMigrations.forEach((migration) => {
          console.log(`  - ${migration.name}`);
        });
      }

      await app.close();
      process.exit(1); // Exit with error if pending migrations
    }

    console.log('✅ No pending migrations');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error(
      '❌ Migration check failed:',
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

// Check migrations
checkMigrations();
