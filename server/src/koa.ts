import { Injector } from 'injection-js';
import * as koa from 'koa';

declare module 'koa' {
    export interface BaseContext {
        // Added by ServerFactory during server creation
        readonly injector: Injector;
    }
}

export = koa;
