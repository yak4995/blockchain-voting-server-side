import { Document } from 'mongoose';
import { IKnownServer } from './i-known-server.interface';

export interface KnownServer extends IKnownServer, Document {
  readonly url: string;
}
