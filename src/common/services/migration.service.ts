import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Migration } from '../interfaces/migrations.interface';

import { LoggingService } from './logging.service';

@Injectable()
export class MigrationService {
  private migrationsPath: string;

  constructor(
    private dataSource: DataSource,
    private loggingService: LoggingService,
  ) {
    this.migrationsPath = path.join(process.cwd(), 'src', 'migrations');
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    this.loggingService.logMessage(
      'Checking for pending migrations...',
      'MIGRATION',
    );

    try {
      // Ensure migrations table exists
      await this.ensureMigrationsTable();

      // Get all migration files
      const migrationFiles = this.getMigrationFiles();

      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations();

      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        (migration) => !executedMigrations.includes(migration.name),
      );

      if (pendingMigrations.length === 0) {
        this.loggingService.logMessage(
          'No pending migrations found',
          'MIGRATION',
        );
        return;
      }

      this.loggingService.logMessage(
        `Found ${pendingMigrations.length} pending migrations: ${pendingMigrations.map((m) => m.name).join(', ')}`,
        'MIGRATION',
      );

      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      this.loggingService.logMessage(
        'All migrations completed successfully',
        'MIGRATION',
      );
    } catch (error) {
      this.loggingService.logMessage(
        `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
        'MIGRATION',
        'error',
      );
      throw error;
    }
  }

  /**
   * Ensure the migrations table exists
   */
  private async ensureMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(255)
      );
    `;

    await this.dataSource.query(createTableSQL);
  }

  /**
   * Get all migration files from the migrations directory
   */
  private getMigrationFiles(): Migration[] {
    if (!fs.existsSync(this.migrationsPath)) {
      return [];
    }

    const files = fs
      .readdirSync(this.migrationsPath)
      .filter((file) => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct execution order

    return files.map((file) => {
      const filePath = path.join(this.migrationsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const checksum = crypto.createHash('md5').update(content).digest('hex');

      return {
        name: file,
        path: filePath,
        checksum,
      };
    });
  }

  /**
   * Get list of executed migrations
   */
  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const result: Array<{ name: string }> = await this.dataSource.query(
        'SELECT name FROM migrations ORDER BY executed_at',
      );
      return result.map((row) => row.name);
    } catch {
      // If migrations table doesn't exist yet, return empty array
      return [];
    }
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(migration: Migration): Promise<void> {
    this.loggingService.logMessage(
      `Executing migration: ${migration.name}`,
      'MIGRATION',
    );

    try {
      // Read migration file
      const sql = fs.readFileSync(migration.path, 'utf8');

      // Execute the migration
      await this.dataSource.query(sql);

      // Record the migration as executed
      await this.dataSource.query(
        'INSERT INTO migrations (name, checksum) VALUES ($1, $2)',
        [migration.name, migration.checksum],
      );

      this.loggingService.logMessage(
        `Migration ${migration.name} completed successfully`,
        'MIGRATION',
      );
    } catch (error) {
      this.loggingService.logMessage(
        `Migration ${migration.name} failed: ${error instanceof Error ? error.message : String(error)}`,
        'MIGRATION',
        'error',
      );
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    total: number;
    executed: number;
    pending: number;
    migrations: Array<{
      name: string;
      executed: boolean;
      executedAt?: string;
    }>;
  }> {
    const migrationFiles = this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();

    const migrations = migrationFiles.map((file) => {
      const executed = executedMigrations.includes(file.name);
      return {
        name: file.name,
        executed,
        executedAt: executed
          ? executedMigrations.find((name) => name === file.name)
          : undefined,
      };
    });

    return {
      total: migrationFiles.length,
      executed: executedMigrations.length,
      pending: migrationFiles.length - executedMigrations.length,
      migrations,
    };
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations(): Promise<Migration[]> {
    try {
      await this.ensureMigrationsTable();
      const migrationFiles = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      return migrationFiles.filter(
        (migration) => !executedMigrations.includes(migration.name),
      );
    } catch (error) {
      this.loggingService.logMessage(
        `Error getting pending migrations: ${error instanceof Error ? error.message : error}`,
        'MIGRATION',
        'error',
      );
      throw error;
    }
  }
}
