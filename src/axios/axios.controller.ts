import { Controller, Post, Body, UsePipes, Inject, Get, Param } from '@nestjs/common';
import { AppLogger } from '../logger/app-logger.service';
import { ValidatorPipe } from '../common/validator.pipe';
import { AxiosService } from './axios.service';
import { AxiosAuthDTO } from './dto/axios-auth.dto';
import { ApiUseTags, ApiResponse, ApiImplicitParam, ApiOperation } from '@nestjs/swagger';

@ApiUseTags('Axios')
@Controller('axios')
export class AxiosController {
  constructor(private readonly axiosService: AxiosService, @Inject('logger') private readonly loggerService: AppLogger) {}

  // получение accessToken-а у клиента по кредам юзера
  @ApiOperation({
    title: 'получение accessToken-а у клиента по кредам юзера',
  })
  @ApiResponse({ status: 200, description: 'Client access token', type: 'string'})
  @Post('oauth-get-token')
  @UsePipes(ValidatorPipe)
  async oAuthGetToken(@Body() axiosAuthDto: AxiosAuthDTO): Promise<string> {
    try {
      return await this.axiosService.getClientAccessToken(axiosAuthDto);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // получение userId у клиента по accessToken-у юзера
  @ApiOperation({
    title: 'получение userId у клиента по accessToken-у юзера',
  })
  @ApiImplicitParam({name: 'accessToken', description: 'Actual client access token'})
  @Get('get-user-id/:accessToken')
  async getUserIdFromClient(@Param('accessToken') accessToken: string) {
    try {
      return await this.axiosService.getUserByAccessToken(accessToken);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }
}
