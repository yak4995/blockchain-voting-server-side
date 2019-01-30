import { Injectable, BadRequestException, HttpService } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { AxiosAuthDTO } from './dto/axios-auth.dto';
import * as jwt_decode from 'jwt-decode';

@Injectable()
export class AxiosService {

  private readonly clientUrl: string;
  private readonly OAuthClientId: string; 
  private readonly OAuthClientSecret: string; 

  private readonly ERROR_TEXT = 'Incorrect client oauth args';

  constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {
    this.clientUrl = configService.get('OAUTH_APP_URL');
    this.OAuthClientId = configService.get('OAUTH_APP_ID');
    this.OAuthClientSecret = configService.get('OAUTH_APP_SECRET');
  }

  async getClientAccessToken(axiosAuthDto: AxiosAuthDTO): Promise<string> {

    try {
        const response = await this.httpService.post(
                    this.clientUrl + '/oauth/token',
                    {
                        grant_type: 'password',
                        client_id: this.OAuthClientId,
                        client_secret: this.OAuthClientSecret,
                        username: axiosAuthDto.username,
                        password: axiosAuthDto.password,
                        scope: ''
                    })
                    .toPromise(),
              result = response.data;
        return jwt_decode<any>(await result.access_token).jti;
    } catch (e) {
        throw new BadRequestException(this.ERROR_TEXT, 'Incorrect client oauth args: ' + e.message);
    }
  }

  async getUserIdByAccessToken(accessToken: string) {
    try {
        const response = await this.httpService.get(
                    this.clientUrl + '/api/user',
                    {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                    .toPromise(),
              result = response.data;
        return await result;
    } catch (e) {
        console.log(e);
        throw new BadRequestException(this.ERROR_TEXT, 'Incorrect access token: ' + e.message);
    }
  }
}