import * as mongoose from 'mongoose';

export const RegisteredVoterSchema = new mongoose.Schema({
  hash: String,
  registeredVoterId: Number,
});