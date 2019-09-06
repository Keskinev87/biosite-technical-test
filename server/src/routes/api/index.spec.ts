import * as request from 'supertest';
import '../../../test-helpers/unit-test-helper-barrel';
import { unitTestRootInjector } from '../../../test-helpers/unit-test-injector';
import { ServerFactory } from '../../server-factory';

describe('#integration /api', () => {
    let server: any;
    beforeEach(() => {
        const app = unitTestRootInjector.get(ServerFactory).create();
        server = app.listen(8081, '127.0.0.1');
    });

    afterEach(() => {
        server.close();
    });

    describe('/test', () => {

        it('should return status ok', async () => {
            const response = await request(server).get('/api/test');

            expect(response.status).toEqual(200);
            expect(response.type).toEqual('application/json');
            expect(response.body).toEqual({
                status: 'ok',
            });
        });
    });
});
