#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MigrationService } from '../common/services/migration.service';

async function showMigrationStatus() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    const status = await migrationService.getMigrationStatus();

    console.log('\n📊 Migration Status');
    console.log('==================');
    console.log(`Total migrations: ${status.total}`);
    console.log(`Executed: ${status.executed}`);
    console.log(`Pending: ${status.pending}`);
    console.log('\n📋 Migration Details:');

    status.migrations.forEach((migration) => {
      const statusIcon = migration.executed ? '✅' : '⏳';
      const date = migration.executedAt ? ` (${migration.executedAt})` : '';
      console.log(`  ${statusIcon} ${migration.name}${date}`);
    });

    if (status.pending > 0) {
      console.log(
        '\n⚠️  You have pending migrations. Run the app to execute them.',
      );
    } else {
      console.log('\n✅ All migrations are up to date!');
    }
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
  } finally {
    await app.close();
  }
}

showMigrationStatus();
