import { DynamicModule, Module } from '@nestjs/common';
import { AppLogger } from './app-logger.service';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

export class LoggerModule {
  static forRoot(logFileName: string): DynamicModule {
    //динамический провайдер по ключу logger
    const AppLoggerProvider = {
      imports: [ConfigModule],
      provide: 'logger',
      useFactory: async (configService: ConfigService) => { return new AppLogger(configService.get('LOGS_PATH'), logFileName) },
      inject: [ConfigService]
    };
    return {
      module: LoggerModule,
      providers: [AppLoggerProvider],
      exports: [AppLoggerProvider]
    };
  }
}