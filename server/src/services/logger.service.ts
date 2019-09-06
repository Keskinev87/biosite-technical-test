import * as bunyan from 'bunyan';
import { Injectable } from 'injection-js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'trace';

export type BunyanLogger = bunyan;

export abstract class LoggerConfig {
    // Warning: turning this on is *slow*
    abstract get logSourceFile(): boolean;

    abstract get logLevel(): LogLevel;

    abstract get loggerName(): string;
}


// This is an abstract class rather than an interface because DI doesn't work
// with interfaces.
@Injectable()
export abstract class LoggerService {
    abstract get fatal(): (format: any, ...params: any[]) => void;
    abstract get error(): (format: any, ...params: any[]) => void;
    abstract get warning(): (format: any, ...params: any[]) => void;
    abstract get info(): (format: any, ...params: any[]) => void;
    abstract get debug(): (format: any, ...params: any[]) => void;
    abstract get trace(): (format: any, ...params: any[]) => void;

    abstract createChild(data: object): LoggerService;
}


@Injectable()
export class RootLoggerService extends LoggerService {
    private bunyanInstance: BunyanLogger;

    constructor(
        config: LoggerConfig,
    ) {
        super();
        this.bunyanInstance = bunyan.createLogger({
            name: config.loggerName,
            level: config.logLevel,
            src: config.logSourceFile,
            stream: process.stdout,
        });

        // We need to do this (instead of just having a wrapper function) so
        // that stack traces work correctly.
        this.fatal = this.bunyanInstance.fatal.bind(this.bunyanInstance);
        this.error = this.bunyanInstance.error.bind(this.bunyanInstance);
        this.warning = this.bunyanInstance.warn.bind(this.bunyanInstance);
        this.info = this.bunyanInstance.info.bind(this.bunyanInstance);
        this.debug = this.bunyanInstance.debug.bind(this.bunyanInstance);
        this.trace = this.bunyanInstance.trace.bind(this.bunyanInstance);
    }

    createChild(data: object): LoggerService {
        return new ChildLoggerService(this.bunyanInstance, data);
    }

    // We need to do this (instead of just having a wrapper function) so that
    // stack traces work correctly.
    fatal: (format: any, ...params: any[]) => void;
    error: (format: any, ...params: any[]) => void;
    warning: (format: any, ...params: any[]) => void;
    info: (format: any, ...params: any[]) => void;
    debug: (format: any, ...params: any[]) => void;
    trace: (format: any, ...params: any[]) => void;
}


// Not injectable, create from an injected RootLoggerService
export class ChildLoggerService extends LoggerService {

    private bunyanInstance: BunyanLogger;

    constructor(
        parent: BunyanLogger,
        data: object,
    ) {
        super();
        this.bunyanInstance = parent.child(data);

        // We need to do this (instead of just having a wrapper function) so
        // that stack traces work correctly.
        this.fatal = this.bunyanInstance.fatal.bind(this.bunyanInstance);
        this.error = this.bunyanInstance.error.bind(this.bunyanInstance);
        this.warning = this.bunyanInstance.warn.bind(this.bunyanInstance);
        this.info = this.bunyanInstance.info.bind(this.bunyanInstance);
        this.debug = this.bunyanInstance.debug.bind(this.bunyanInstance);
        this.trace = this.bunyanInstance.trace.bind(this.bunyanInstance);
    }

    createChild(data: object): LoggerService {
        return new ChildLoggerService(this.bunyanInstance, data);
    }

    // We need to do this (instead of just having a wrapper function) so that
    // stack traces work correctly.
    fatal: (format: any, ...params: any[]) => void;
    error: (format: any, ...params: any[]) => void;
    warning: (format: any, ...params: any[]) => void;
    info: (format: any, ...params: any[]) => void;
    debug: (format: any, ...params: any[]) => void;
    trace: (format: any, ...params: any[]) => void;
}
