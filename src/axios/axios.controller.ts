import { 
    Controller, 
    Post, 
    Body,
    UsePipes,
    Inject,
    Get,
    Param
} from '@nestjs/common';
import { AppLogger } from '../logger/app-logger.service';
import { ValidatorPipe } from '../common/validator.pipe';
import { AxiosService } from './axios.service';
import { AxiosAuthDTO } from './dto/axios-auth.dto';

@Controller('axios')
export class AxiosController {

  constructor(
    private readonly axiosService: AxiosService,
    @Inject('logger') private readonly loggerService: AppLogger
  ) {}

  //получение accessToken-а у клиента по кредам юзера
  @Post('oauth-get-token')
  @UsePipes(ValidatorPipe)
  async oAuthGetToken(@Body() axiosAuthDto: AxiosAuthDTO) {

    try {
        return await this.axiosService.getClientAccessToken(axiosAuthDto);
    } catch (e) {
        this.loggerService.error(e.message.error, e.trace);
        throw e;
    }
  }

  //получение userId у клиента по accessToken-у юзера
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