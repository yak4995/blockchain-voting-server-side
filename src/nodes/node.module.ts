import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NodeSchema } from './schemas/node.schema';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { AuthModule } from 'auth/auth.module';
import { ConfigModule } from 'config/config.module';
import { RSAService } from './rsa.service';
import { KeyPair } from './schemas/key-pair.schema';

@Module({
  imports: [
    /*
      Этот модуль использует метод MongooseModule.forFeature (),
      чтобы определить, какие модели должны быть зарегистрированы в текущем модуле.
      Благодаря этому мы можем внедрить Mongoose-модель для Node в NodeService с помощью декоратора @InjectModel
      по ключу 'Node'
    */
    MongooseModule.forFeature([{ name: 'Node', schema: NodeSchema }, { name: 'KeyPair', schema: KeyPair }]),
    AuthModule,
    ConfigModule
  ],
  controllers: [NodeController],
  providers: [NodeService, RSAService]
})
export class NodeModule {}