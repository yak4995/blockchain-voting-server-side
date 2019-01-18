import * as mongoose from 'mongoose';

//Схема хранимого в коллекции MongoDB обьекта
export const NodeSchema = new mongoose.Schema({
  hash: String,
  parent_hash: String,
  author_public_key: String,
  signature: String,
  type: Number,
  voting_description: String,
  start_time: Number,
  end_time: Number,
  voting_public_key: String,
  admitted_user_public_key: String,
  selected_variant: Number
});