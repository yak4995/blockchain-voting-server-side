import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  constructor(environment: string) {
    if (['development', 'undefined', 'test'].includes(environment)) {
      dotenv.config({ path: 'development.env' }); // переносим все данные с файла в process.env
    }
  }

  get(key: string): string {
    // c прода будет брать сразу с process.env
    return process.env[key];
  }
}
