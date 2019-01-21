import * as mongoose from 'mongoose';

export const KeyPair = new mongoose.Schema({
    publicKey: String,
    privateKey: String
});