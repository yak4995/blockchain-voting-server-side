import { Connection } from 'mongoose';
import { KnownServerSchema } from './schemas/known-server';
import KnownServerRepository from './repositories/known-server.repository';

export const axiosProviders = [
  {
    provide: 'KnownServersModelToken',
    useFactory: (connection: Connection) => connection.model('KnownServer', KnownServerSchema),
    inject: ['DbConnectionToken'],
  },
  {
    provide: 'KnownServerRepository',
    useClass: KnownServerRepository,
  },
];
