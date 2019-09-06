import 'reflect-metadata';


import { Config } from './config';
import { rootInjector } from './inject';
import { ServerFactory } from './server-factory';
import { LoggerService } from './services/logger.service';

// Construct an emergency error logger here for use when the real logger
// injection fails.
// tslint:disable-next-line:no-console
let logFatalError = (error: Error) => console.error('fatal error:', error);

(async () => {
    try {
        const config = rootInjector.get(Config);
        const rootLogger = rootInjector.get(LoggerService);
        logFatalError = (error: Error) => rootLogger.fatal(error);

        // This gets us stack traces for promise rejections that contain an Error class.
        // It also stops node complaining about deprecated behaviour.
        process.on('unhandledRejection', (r) => {
            rootLogger.error('Unhandled promise rejection:\n', r);
        });

        // Almost all setup code should go inside this factory so that it can be
        // integration tested by the api tests.
        const server = rootInjector.get(ServerFactory).create();

        server.on('close', () => {
            rootLogger.error('server was closed, exiting application');
            process.exit(1);
        });

        server.listen(config.listenPort, config.listenAddress);

        rootLogger.debug('ready');
    }
    catch (e) {
        logFatalError(e);
        process.exit(1);
    }
})();
