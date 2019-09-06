import { Injectable, Injector, ReflectiveInjector } from 'injection-js';
import { contextProviders } from './inject';
import { Context } from './koa';

@Injectable()
export class ContextInjectorFactory {
    private resolvedContextProviders: any;
    constructor(
        private injector: Injector,
    ) {
        this.resolvedContextProviders = ReflectiveInjector.resolve(contextProviders);
    }

    create(ctx: Context | null = null): Injector {
        return (this.injector as ReflectiveInjector).createChildFromResolved(this.resolvedContextProviders);
    }
}
