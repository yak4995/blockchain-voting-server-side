import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RSAService } from './rsa.service';
import { CryptoController } from './crypto.controller';
import { rsaProviders } from './rsa.providers';
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../logger/app-logger.module';

@Module({
    imports: [
      LoggerModule.forRoot('crypto.txt'),
      /*
        Этот модуль использует метод MongooseModule.forFeature (),
        чтобы определить, какие модели должны быть зарегистрированы в текущем модуле.
        Благодаря этому мы можем внедрить Mongoose-модель для Node в NodeService с помощью декоратора @InjectModel
        по ключу 'Node'
      */
      //MongooseModule.forFeature([{ name: 'KeyPair', schema: KeyPair }]),
      DatabaseModule, //а этот модуль мы подключили вместо закомментированного сверху, чтобы можно было тестировать сервисы, требующие mongoose-модели
      AuthModule
    ],
    controllers: [CryptoController],
    providers: [
      RSAService, 
      ...rsaProviders //динамический сервис для иньекции по ключу KeyPairModelToken (то есть создания mongoose-модели для KeyPair)
    ],
    exports: [RSAService]
})
export class CryptoModule {}