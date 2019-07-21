import { Injectable, BadRequestException, HttpService, Inject } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { AxiosAuthDTO } from './dto/axios-auth.dto';
import { NodeDto } from '../nodes/dto/create-node.dto';
import * as jwt_decode from 'jwt-decode';
import { KnownServer } from '../nodes/interfaces/known-server.interface';
import BaseRepository from '../common/base.repository';

@Injectable()
export class AxiosService {
  private readonly clientUrl: string;
  private readonly OAuthClientId: string;
  private readonly OAuthClientSecret: string;

  private readonly ERROR_TEXT = 'Incorrect client oauth args';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject('KnownServerRepository')
    private readonly knownServerRepository: BaseRepository<KnownServer>,
  ) {
    this.clientUrl = configService.get('OAUTH_APP_URL');
    this.OAuthClientId = configService.get('OAUTH_APP_ID');
    this.OAuthClientSecret = configService.get('OAUTH_APP_SECRET');
  }

  async getClientAccessToken(axiosAuthDto: AxiosAuthDTO): Promise<string> {
    try {
      const response = await this.httpService
          .post(this.clientUrl + '/oauth/token', {
            grant_type: 'password',
            client_id: this.OAuthClientId,
            client_secret: this.OAuthClientSecret,
            username: axiosAuthDto.username,
            password: axiosAuthDto.password,
            scope: '',
          })
          .toPromise(),
        result = response.data;
      return jwt_decode<any>(await result.access_token).jti;
    } catch (e) {
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect client oauth args: ' + e.message);
    }
  }

  async getUserByAccessToken(accessToken: string) {
    try {
      const response = await this.httpService
          .get(this.clientUrl + '/api/user', {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .toPromise(),
        result = response.data;
      return await result;
    } catch (e) {
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect access token: ' + e.message);
    }
  }

  async pushNode(node: NodeDto): Promise<void> {
    try {
      const externalServers = await this.knownServerRepository.findAll();
      await Promise.all(externalServers.map(server =>
        this.httpService
          .post(server.url + '/nodes/get-external-node', {
            headers: {
              Accept: 'application/json',
            },
            node,
          })
          .toPromise(),
      ));
    } catch (e) {
      throw new BadRequestException(this.ERROR_TEXT, `We have not being able to push node`);
    }
  }
}
