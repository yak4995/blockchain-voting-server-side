import * as mongoose from 'mongoose';

// Схема хранимого в коллекции MongoDB обьекта
export const NodeSchema = new mongoose.Schema({
  hash: String,
  parentHash: String,
  authorPublicKey: String,
  signature: String,
  type: Number,
  votingDescription: String,
  startTime: Number,
  endTime: Number,
  candidates: Array,
  admittedVoters: Array,
  registeredVoters: Array,
  votingPublicKey: String,
  admittedUserPublicKey: String,
  selectedVariant: String,
});
