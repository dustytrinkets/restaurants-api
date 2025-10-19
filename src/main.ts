import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MigrationService } from './common/services/migration.service';

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Restaurants API')
    .setDescription('The restaurants API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('restaurants', 'Restaurant management endpoints')
    .addTag('users', 'User management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: add step to run migrations on CI on production
  // if (process.env.NODE_ENV !== 'production') {
  const migrationService = app.get(MigrationService);
  await migrationService.runMigrations();
  // }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
