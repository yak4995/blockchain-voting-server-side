import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { ConfigModule } from '../config/config.module';

// модуль для возврата подключения к базе по ключу DbConnectionToken
@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders],
  exports: [
    ...databaseProviders,
    ConfigModule,
  ],
})
export class DatabaseModule {}
