// Import order is important here!
// tslint:disable:ordered-imports

// DI related imports
import { contextProviders, rootProviders } from '../src/inject';
import { Injectable, Injector, ReflectiveInjector } from 'injection-js';

// Services
import { ContextInjectorFactory } from '../src/context-injector';

// This file mirrors src/inject.ts, but with some additional unit-test-specific
// providers added and some providers replaced with mocks.

@Injectable()
export class UnitTestContextInjectorFactory {
    create(): Injector {
        return _unitTestRootInjector.createChildFromResolved(resolvedContextUnitTestProviders);
    }
}

const rootUnitTestProviders = [
    ...rootProviders,
    { provide: ContextInjectorFactory, useClass: UnitTestContextInjectorFactory },
];

const contextUnitTestProviders = [
    ...contextProviders,
];


const resolvedContextUnitTestProviders = ReflectiveInjector.resolve(contextUnitTestProviders);

let _unitTestRootInjector: ReflectiveInjector = ReflectiveInjector.resolveAndCreate(rootUnitTestProviders);
let unitTestRootInjector: Injector = _unitTestRootInjector;

beforeEach(() => {
    unitTestRootInjector = _unitTestRootInjector = ReflectiveInjector.resolveAndCreate(rootUnitTestProviders);
});

export {
    unitTestRootInjector,
    rootUnitTestProviders,
    contextUnitTestProviders,
};
