import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { AppLogger } from './logger/app-logger.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('logger') private readonly logger: AppLogger) {}

  @Get()
  root(): string {
    this.logger.warn('Root');
    return this.appService.root();
  }
}
