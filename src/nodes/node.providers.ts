import { Connection } from 'mongoose';
import { NodeSchema } from './schemas/node.schema';

export const nodeProviders = [
  {
    provide: 'NodeModelToken',
    useFactory: (connection: Connection) => //connection - подключение к монго-БД полученное по ключу DbConnectionToken
      connection.model('Node', NodeSchema), //возвращает mongoose-модель на основе класса, которую можно получить по ключу
    inject: ['DbConnectionToken'],
  },
];