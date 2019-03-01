import { Document } from 'mongoose';

export interface KnownServer extends Document {
  readonly url: string;
}