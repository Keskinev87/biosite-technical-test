import * as http from 'http';
import { Injectable } from 'injection-js';
import * as cors from 'kcors';
import * as koaHelmet from 'koa-helmet';

import { ContextInjectorFactory } from './context-injector';
import * as Koa from './koa';
import { createRootRouter } from './routes';


@Injectable()
export class ServerFactory {
    constructor(
        private contextInjectorFactory: ContextInjectorFactory,
    ) {
    }

    create() {

        const app = new Koa();
        const rootRouter = createRootRouter();

        const self = this;
        Object.defineProperty(app.context, 'injector', {
            get: function(this: Koa.Context) {
                return Object.defineProperty(this, 'injector', {
                    // Pass the context into the injector so that we can DI
                    // values from the context.
                    value: self.contextInjectorFactory.create(this),
                }).injector;
            },
        });

        app.use(koaHelmet());
        app.use(koaHelmet.contentSecurityPolicy({ directives: { defaultSrc: ['\'self\''] } }));

        app.use(cors());
        app.use(rootRouter.allowedMethods());
        app.use(rootRouter.routes());

        return http.createServer(app.callback());
    }
}
