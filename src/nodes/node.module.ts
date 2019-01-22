import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NodeSchema } from './schemas/node.schema';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { AuthModule } from 'auth/auth.module';
import { ConfigModule } from 'config/config.module';
import { LoggerModule } from 'logger/app-logger.module';

@Module({
  imports: [
    LoggerModule.forRoot('node.txt'),
    /*
      Этот модуль использует метод MongooseModule.forFeature (),
      чтобы определить, какие модели должны быть зарегистрированы в текущем модуле.
      Благодаря этому мы можем внедрить Mongoose-модель для Node в NodeService с помощью декоратора @InjectModel
      по ключу 'Node'
    */
    MongooseModule.forFeature([{ name: 'Node', schema: NodeSchema }]),
    AuthModule,
    ConfigModule
  ],
  controllers: [NodeController],
  providers: [NodeService]
})
export class NodeModule {}