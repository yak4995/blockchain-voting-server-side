import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '../config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // обязателен и для OAuth2 стратегии и для JWT-стратегии
  constructor(private readonly authService: AuthService, private readonly configeService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configeService.get('JWT_SECRET_KEY'),
    });
  }

  // обязателен и для OAuth2 стратегии (но со строковым аргументом token вместо payload) и для JWT-стратегии
  // JwtStrategy использует AuthService для валидации декодированной полезной нагрузки
  // возвращает обьект, представляющий пользователя, которому принадлежал переданный токен
  async validate(payload: JwtPayload): Promise<{ name: string }> {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
