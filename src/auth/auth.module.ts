import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from 'config/config.service';
import { ConfigModule } from 'config/config.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    //тоже самое, что и forRoot
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secretOrPrivateKey: configService.get('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: 3600,
        },
      }),
      inject: [ConfigService],
    })
  ],
  providers: [
    AuthService,
    JwtStrategy
  ],
  controllers: [AuthController],
  //реэкспорт PassportModule в модули, которые импортируют этот
  exports: [PassportModule]
})
export class AuthModule {}