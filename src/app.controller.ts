import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { AppLogger } from './logger/app-logger.service';
import { ApiUseTags, ApiResponse } from '@nestjs/swagger';

@ApiUseTags('BCVS')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('logger') private readonly logger: AppLogger /*, @InjectQueue('store') private readonly queue: Queue*/,
  ) {}

  @ApiResponse({ status: 200, description: 'Test message', type: 'string'})
  @Get()
  root(): string {
    this.logger.warn('Root');
    return this.appService.root();
  }
}
