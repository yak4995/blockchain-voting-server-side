import { Module, HttpModule } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../logger/app-logger.module';
import { AxiosController } from './axios.controller';
import { AxiosService } from './axios.service';
import { bullProviders } from './bull.providers';

@Module({
  imports: [
    LoggerModule.forRoot('axios.txt'),
    DatabaseModule,
    HttpModule,
  ],
  controllers: [AxiosController],
  providers: [AxiosService, ...bullProviders],
  exports: [AxiosService],
})
export class AxiosModule {}
