import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'auth/auth.module';
import { RSAService } from './rsa.service';
import { KeyPair } from './schemas/key-pair.schema';
import { CryptoController } from './crypto.controller';

@Module({
    imports: [
      /*
        Этот модуль использует метод MongooseModule.forFeature (),
        чтобы определить, какие модели должны быть зарегистрированы в текущем модуле.
        Благодаря этому мы можем внедрить Mongoose-модель для Node в NodeService с помощью декоратора @InjectModel
        по ключу 'Node'
      */
      MongooseModule.forFeature([{ name: 'KeyPair', schema: KeyPair }]),
      AuthModule
    ],
    controllers: [CryptoController],
    providers: [RSAService]
  })
  export class CryptoModule {}