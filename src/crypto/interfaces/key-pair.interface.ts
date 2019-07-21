import { Document } from 'mongoose';
import { IKeyPair } from './i-key-pair.interface';

export interface KeyPair extends IKeyPair, Document {
  readonly publicKey: string;
  readonly privateKey: string;
}
