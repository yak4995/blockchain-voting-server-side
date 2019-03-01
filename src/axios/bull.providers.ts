import { Connection } from 'mongoose';
import { KnownServerSchema } from './schemas/known-server';

export const bullProviders = [
  {
    provide: 'KnownServersModelToken',
    useFactory: (connection: Connection) => connection.model('KnownServer', KnownServerSchema),
    inject: ['DbConnectionToken'],
  },
];
