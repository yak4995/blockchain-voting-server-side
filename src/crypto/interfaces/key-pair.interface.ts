import { Document } from 'mongoose';

export interface KeyPair extends Document {
    readonly publicKey: string;
    readonly privateKey: string;
}