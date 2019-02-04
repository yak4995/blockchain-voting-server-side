import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';
import { AppLogger } from '../logger/app-logger.service';
import { ConfigModule } from '../config/config.module';
import { AxiosController } from './axios.controller';
import { AxiosService } from './axios.service';
import { AxiosAuthDTO } from './dto/axios-auth.dto';

describe('AxiosController tests', () => {

  let axiosController: AxiosController;

  const credentials: AxiosAuthDTO = {
    username: "berejant@ukr.net",
    password: "yuro1995"
  };

  beforeAll(async () => {

    const mockAppLoggerProvider = {
      provide: 'logger',
      useFactory: async () => { return new AppLogger('logs', 'axios-test.txt') }
    };
    
    const module = await Test.createTestingModule({
        imports: [
          ConfigModule,
          HttpModule
        ],
        controllers: [AxiosController],
        providers: [mockAppLoggerProvider, AxiosService]
    }).compile();

    axiosController = module.get<AxiosController>(AxiosController);
  });

  describe('oauthGetTokenTest', () => {

    it('should return an access token', async () => {
      
      expect(await axiosController.oAuthGetToken(credentials))
        .toEqual(expect.stringMatching(/[A-Za-z0-9\-\._~\+\/]+=*/));
    });
  });

  describe('getUserIdTest', () => {

    it('should return a user id from client by its access token', async () => {

      const accessToken = await axiosController.oAuthGetToken(credentials);
      expect(await axiosController.getUserIdFromClient(accessToken)).toHaveProperty('id', 2);
    });
  });
});