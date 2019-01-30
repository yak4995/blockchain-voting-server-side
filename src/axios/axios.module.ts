import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/app-logger.module';
import { AxiosController } from './axios.controller';
import { AxiosService } from './axios.service';

@Module({
  imports: [
    LoggerModule.forRoot('axios.txt'),
    ConfigModule,
    HttpModule
  ],
  controllers: [AxiosController],
  providers: [AxiosService]
})
export class AxiosModule {}