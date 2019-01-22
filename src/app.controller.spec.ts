import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppLogger } from './logger/app-logger.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    const mockAppLoggerProvider = {
      provide: 'logger',
      useFactory: async () => { return new AppLogger('logs', 'root.txt') }
    };
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, mockAppLoggerProvider]
    }).compile();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.root()).toBe('Hello World!');
    });
  });
});
