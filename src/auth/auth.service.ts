import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '../config/config.service';
import { OuterServiceCredentialsDTO } from './dto/OuterServiceCredentialsDTO';
import { JwtTokenDTO } from './dto/JwtTokenDTO';

@Injectable()
export class AuthService {
  // обязателен и для OAuth2 стратегии (но с первым параметром другого типа - сервисом получения юзера по токену) и для JWT-стратегии
  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

  // только для JWT-стратегии
  // используется в AuthController для выдачи токена клиенту по переданным кредам
  async createToken(outerServiceCredentials: OuterServiceCredentialsDTO): Promise<JwtTokenDTO> {
    const appName = this.configService.get('OUTER_APP_NAME'),
      appKey = this.configService.get('OUTER_APP_KEY');
    if (outerServiceCredentials.name === appName && outerServiceCredentials.key === appKey) {
      const internalService: JwtPayload = { name: appName };
      // содержимое расшифрованного токена
      /*
      HEADER:
      {
        "alg": "HS256",
        "typ": "JWT"
      }
      PAYLOAD:
      {
        "name": "university.app.edu",
        "iat": 1542050976, //issued at
        "exp": 1542054576 //expired at
      }
      <SIGNATURE>
      */
      const accessToken = this.jwtService.sign(internalService);
      return {
        expiresIn: 3600,
        accessToken,
      };
    } else {
      throw new UnauthorizedException('Invalid credentials!');
    }
  }

  /*
    Обязателен и для OAuth2 стратегии (но со строковым аргументом token вместо payload и тогда он вернет юзера с БД)
    и для JWT-стратегии. Используется в классе стратегии для валидации токена на основании, например, записи в БД.
    Пример: return await this.usersService.findOneByEmail(payload.email);
    Но в нашем случае у нас одно значение в конфиге
  */
  // возвращает обьект, представляющий пользователя, которому принадлежал переданный токен
  async validateUser(payload: JwtPayload): Promise<{ name: string } | null> {
    return this.configService.get('OUTER_APP_NAME') === payload.name
      ? {
          name: payload.name,
        }
      : null;
  }
}
