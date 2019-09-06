
// A module importing all the top-level includes needed for unit tests, just
// import this at the top of your unit tests.

import 'jasmine';
import 'reflect-metadata';


function abortOnUnhandledRejection() {
    process.on('unhandledRejection', (r: any) => {
        // tslint:disable-next-line:no-console
        console.log(`\nUnhandled promise rejection: ${r}, aborting tests\n${r.stack}`);

        // We can't just throw here because jasmine will think that
        // whichever test is currently running caused the exception, but
        // since this promise wasn't await'ed the test that actually caused
        // the problem is likely to have finished already and a different
        // test will be running. For now we just abort the whole program,
        // hopefully the exception message contains enough information to
        // find the broken test.
        process.exit(1);
    });
}

abortOnUnhandledRejection();
