import { Logger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { EOL as endOfLine } from 'os';

@Injectable()
export class AppLogger extends Logger {

    private readonly logFilePath: string;

    constructor(logsPath: string, logFileName: string) {
        super();
        this.logFilePath = logsPath + '/' + logFileName;
        if( ! fs.existsSync(logsPath)) {
            fs.mkdirSync(logsPath);
        }
    }

    log(message: string) {
        fs.writeFile(this.logFilePath, 'LOG: ' + message + endOfLine, { flag: 'a' }, (err) => {
            if (err) {
                super.error(err);
            }
        });
        super.log(message);
    }

    error(message: string, trace: string) {
        fs.writeFile(this.logFilePath, 'ERROR: ' + message + endOfLine, { flag: 'a' }, (err) => {
            if (err) {
                super.error(err);
            }
        });
        super.error(message, trace);
    }

    warn(message: string) {
        fs.writeFile(this.logFilePath, 'WARNING: ' + message + endOfLine, { flag: 'a' }, (err) => {
            if (err) {
                super.error(err);
            }
        });
        super.warn(message);
    }
}