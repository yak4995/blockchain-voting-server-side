import * as mongoose from 'mongoose';

// Схема хранимого в коллекции MongoDB обьекта
export const KnownServerSchema = new mongoose.Schema({
  url: String
});
