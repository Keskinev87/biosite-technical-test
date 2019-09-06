import * as request from 'supertest';
import '../../../../test-helpers/unit-test-helper-barrel';
import { unitTestRootInjector } from '../../../../test-helpers/unit-test-injector';
import { ServerFactory } from '../../../server-factory';
import { UserRepository } from '../../../services/user-repository.service';

describe('#integration /api/users', () => {
    let server: any;
    let users: UserRepository;

    beforeEach(() => {
        const app = unitTestRootInjector.get(ServerFactory).create();
        server = app.listen(8081, '127.0.0.1');
        users = unitTestRootInjector.get(UserRepository);
        users.create({
            firstName: 'John',
            lastName: 'Doe',
            qualifications: [],
        });
    });

    afterEach(() => {
        server.close();
    });

    describe('/', () => {

        it('should list users', async () => {
            const response = await request(server).get('/api/users');

            expect(response.status).toEqual(200);
            expect(response.type).toEqual('application/json');
            expect(response.body).toEqual(users.list());
        });
    });

    describe('/:user_id', () => {

        it('should get users', async () => {
            const response = await request(server).get(`/api/users/${users.list()[0].id}`);

            expect(response.status).toEqual(200);
            expect(response.type).toEqual('application/json');
            expect(response.body).toEqual(users.list()[0]);
        });

        it('should return 404 for unknown users', async () => {
            const response = await request(server).get(`/api/users/5ac67406-ae49-4dad-8dcf-b14067bf5640`);

            expect(response.status).toEqual(404);
        });
    });
});
