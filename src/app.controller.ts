import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { AppLogger } from './logger/app-logger.service';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('logger') private readonly logger: AppLogger /*, @InjectQueue('store') private readonly queue: Queue*/,
  ) {}

  @ApiOperation({
    title: 'Тест доступности приложения',
  })
  @ApiResponse({
    status: 200,
    description: 'Hello World',
    type: 'string',
  })
  @Get()
  root(): string {
    this.logger.warn('Root');
    return this.appService.root();
  }
}
