import * as mongoose from 'mongoose';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

export const databaseProviders = [
  {
    imports: [ConfigModule],
    provide: 'DbConnectionToken',
    useFactory: async (configService: ConfigService): Promise<typeof mongoose> => 
      await mongoose.connect(configService.get('MONGODB_URI')),
    inject: [ConfigService],
  },
];