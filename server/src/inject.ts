import { Injector, ReflectiveInjector } from 'injection-js';
import * as uuid from 'uuid/v4';

import { Config } from './config';
import { ContextInjectorFactory } from './context-injector';
import { ServerFactory } from './server-factory';
import { LoggerConfig, LoggerService, RootLoggerService } from './services/logger.service';
import { UserMerger } from './services/user-merger.service';
import { UserRepository } from './services/user-repository.service';

// Providers which can be shared across all requests (i.e. ones with no
// internal state) go in here.
export const rootProviders = [
    Config,
    { provide: LoggerConfig, useExisting: Config },
    RootLoggerService,
    { provide: LoggerService, useClass: RootLoggerService },
    ServerFactory,
    ContextInjectorFactory,
    UserMerger,
    UserRepository,
];
const _rootInjector = ReflectiveInjector.resolveAndCreate(rootProviders);

// Providers which need to be re-created for each request go in here.
export const contextProviders = [
    {
        provide: LoggerService,
        useFactory: (baseLogger: RootLoggerService) => baseLogger.createChild({requestId: uuid()}),
        deps: [RootLoggerService],
    },
];

// NOTE: you almost never want to use rootInjector directly because it will make
// your code impossible to test: you can't use an injector which injects mocks
// if you've hard-coded the injector to use. Instead make your thing a service
// and inject dependencies in the usual way. The only place where rootInjector
// should be used is in index.ts.
//
// We need to cast this to the plain Injector interface because
// ReflectiveInjector.get isn't type safe (it always returns an any).
export const rootInjector: Injector = _rootInjector;
