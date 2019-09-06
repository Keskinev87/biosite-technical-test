import { Injectable } from 'injection-js';
import { LogLevel } from './services/logger.service';

@Injectable()
export class Config {
    get listenPort(): number {
        return 8080;
    }

    get listenAddress(): string {
        return '127.0.0.1';
    }

    get logSourceFile(): boolean {
        return true;
    }

    get logLevel(): LogLevel {
        return 'debug';
    }

    get loggerName(): string {
        return 'server';
    }
}

