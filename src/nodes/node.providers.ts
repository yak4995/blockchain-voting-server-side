import { Connection } from 'mongoose';
import { NodeSchema } from './schemas/node.schema';
import { RegisteredVoterSchema } from './schemas/registered-voters.schema';
import RegisteredVoterRepository from './repositories/registered-voter.repository';
import NodeRepository from './repositories/node.repository';

export const nodeProviders = [
  {
    provide: 'NodeModelToken',
    useFactory: (
      connection: Connection, // connection - подключение к монго-БД полученное по ключу DbConnectionToken
    ) => connection.model('Node', NodeSchema), // возвращает mongoose-модель на основе класса, которую можно получить по ключу
    inject: ['DbConnectionToken'],
  },
  {
    provide: 'RegisteredVoterModelToken',
    useFactory: (
      connection: Connection, // connection - подключение к монго-БД полученное по ключу DbConnectionToken
    ) => connection.model('RegisteredVoters', RegisteredVoterSchema), // возвращает mongoose-модель на основе класса, которую можно получить по ключу
    inject: ['DbConnectionToken'],
  },
  {
    provide: 'RegisteredVoterRepository',
    useClass: RegisteredVoterRepository,
  },
  {
    provide: 'NodeRepository',
    useClass: NodeRepository,
  },
];
