import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
};
