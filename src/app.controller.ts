import { Controller, Get, Inject /*, Post, Body*/ } from '@nestjs/common';
import { AppService } from './app.service';
import { AppLogger } from './logger/app-logger.service';
import { ApiUseTags, ApiResponse } from '@nestjs/swagger';

/*import { InjectQueue } from 'nest-bull';
import { Queue, Job, JobId } from 'bull';*/

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

  /*@Post()
  async pushData(@Body() job: any): Promise<JobId> {
    const check: Job = await this.queue.add(job, {
      removeOnComplete: true,
      removeOnFail: true,
    });
    return check.id;
  }*/
}
