import { Module } from '@nestjs/common';
import { NodeController } from './node.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/app-logger.module';
import { CryptoModule } from '../crypto/crypto.module';
import { nodeProviders } from './node.providers';
import { DatabaseModule } from '../database/database.module';
import { AxiosModule } from '../axios/axios.module';
import { NodeValidationService } from './services/node-validation.service';
import { NodeReadService } from './services/node-read.service';
import { NodePersistanceService } from './services/node-persistance.service';
import { RegisteredVotersService } from './services/registered-voters.service';

@Module({
  imports: [
    LoggerModule.forRoot('node.txt'),
    /*
      Этот модуль использует метод MongooseModule.forFeature (),
      чтобы определить, какие модели должны быть зарегистрированы в текущем модуле.
      Благодаря этому мы можем внедрить Mongoose-модель для Node в NodeService с помощью декоратора @InjectModel
      по ключу 'Node'
    */
    // MongooseModule.forFeature([{ name: 'Node', schema: NodeSchema }]),
    DatabaseModule,
    AuthModule,
    ConfigModule,
    CryptoModule,
    AxiosModule,
  ],
  controllers: [NodeController],
  providers: [NodeValidationService, NodeReadService, NodePersistanceService, RegisteredVotersService, ...nodeProviders],
})
export class NodeModule {}
