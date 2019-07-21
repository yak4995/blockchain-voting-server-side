import { Connection } from 'mongoose';
import { KeyPair } from './schemas/key-pair.schema';
import KeyPairRepository from './repositories/key-pair.repository';

export const rsaProviders = [
  {
    provide: 'KeyPairModelToken',
    useFactory: (
      connection: Connection, // connection - подключение к монго-БД полученное по ключу DbConnectionToken
    ) => connection.model('KeyPair', KeyPair), // возвращает mongoose-модель на основе класса, которую можно получить по ключу
    inject: ['DbConnectionToken'],
  },
  {
    provide: 'KeyPairRepository',
    useClass: KeyPairRepository,
  },
];
