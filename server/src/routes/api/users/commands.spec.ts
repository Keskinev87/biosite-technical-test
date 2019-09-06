import * as request from 'supertest';
import '../../../../test-helpers/unit-test-helper-barrel';
import { unitTestRootInjector } from '../../../../test-helpers/unit-test-injector';
import { ServerFactory } from '../../../server-factory';
import { UserRepository } from '../../../services/user-repository.service';

describe('#integration /api/users/commands', () => {
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

    it('should return 400 for an unknown content type', async () => {
        const response = await request(server)
            .post('/api/users/commands')
            .send({})
            .set('Content-Type', 'application/not-a-command+json');

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
            message: 'unsupported content type: application/not-a-command+json',
        });
    });

    describe('application/vnd.in.biosite.create-user+json', () => {

        it('should create a user', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    firstName: 'James',
                    lastName: 'Smith',
                    qualifications: [],
                })
                .set('Content-Type', 'application/vnd.in.biosite.create-user+json');

            expect(response.status).toEqual(201);
            expect(response.header.location).toEqual(`/api/users/${users.list()[1].id}`);
            expect(users.list()[1].firstName).toEqual('James');
            expect(users.list()[1].lastName).toEqual('Smith');
        });

        it('should return 400 if firstName is missing', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    lastName: 'Smith',
                    qualifications: [],
                })
                .set('Content-Type', 'application/vnd.in.biosite.create-user+json');

            expect(response.status).toEqual(400);
        });

        it('should return 400 if lastName is missing', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    firstName: 'James',
                    qualifications: [],
                })
                .set('Content-Type', 'application/vnd.in.biosite.create-user+json');

            expect(response.status).toEqual(400);
        });

        it('should return 400 if unrecognised fields are supplied', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    firstName: 'James',
                    lastName: 'Smith',
                    notAField: true,
                })
                .set('Content-Type', 'application/vnd.in.biosite.create-user+json');

            expect(response.status).toEqual(400);
        });
    });

    describe('application/vnd.in.biosite.delete-user+json', () => {
        it('should delete a user', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    id: users.list()[0].id,
                })
                .set('Content-Type', 'application/vnd.in.biosite.delete-user+json');

            expect(response.status).toEqual(200);
            expect(users.list()).toEqual([]);
        });
    });

    describe('application/vnd.in.biosite.update-user-name+json', () => {
        it('should update a user', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    id: users.list()[0].id,
                    firstName: 'James',
                    lastName: 'Smith',
                })
                .set('Content-Type', 'application/vnd.in.biosite.update-user-name+json');

            expect(response.status).toEqual(200);
            expect(users.list()[0].firstName).toEqual('James');
            expect(users.list()[0].lastName).toEqual('Smith');
        });
    });

    describe('application/vnd.in.biosite.add-qualification+json', () => {
        it('should add a qualification', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    userId: users.list()[0].id,
                    type: 'First aid',
                })
                .set('Content-Type', 'application/vnd.in.biosite.add-qualification+json');

            expect(response.status).toEqual(200);
            expect(users.list()[0].qualifications[0].type).toEqual('First aid');
        });
    });

    describe('application/vnd.in.biosite.delete-qualification+json', () => {
        beforeEach(() => {
            users.addQualification({
                userId: users.list()[0].id,
                type: 'First aid',
                uniqueId: null,
                expiry: null,
            });
        });

        it('should delete a qualification', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    id: users.list()[0].qualifications[0].id,
                })
                .set('Content-Type', 'application/vnd.in.biosite.delete-qualification+json');

            expect(response.status).toEqual(200);
            expect(users.list()[0].qualifications).toEqual([]);
        });
    });

    describe('application/vnd.in.biosite.merge-users+json', () => {
        beforeEach(() => {
            users.create({
                firstName: 'John',
                lastName: 'Doe',
                qualifications: [
                    {
                        type: 'First aid',
                        uniqueId: null,
                        expiry: null,
                    },
                ],
            });
        });

        it('should return a 400 error if the ids field is missing', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({})
                .set('Content-Type', 'application/vnd.in.biosite.merge-users+json');

            expect(response.status).toEqual(400);
        });

        it('should return a 400 error if only 1 id is provided', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    ids: [
                        users.list()[0].id,
                    ],
                })
                .set('Content-Type', 'application/vnd.in.biosite.merge-users+json');

            expect(response.status).toEqual(400);
        });

        it('should return a 400 error if any id does not exist', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    ids: [
                        users.list()[0].id,
                        'a513df5f-e6a4-4006-98dd-618ee8210f6f',
                    ],
                })
                .set('Content-Type', 'application/vnd.in.biosite.merge-users+json');

            expect(response.status).toEqual(400);
        });

        it('should respond with the merged user', async () => {
            const response = await request(server)
                .post('/api/users/commands')
                .send({
                    ids: [
                        users.list()[0].id,
                        users.list()[1].id,
                    ],
                })
                .set('Content-Type', 'application/vnd.in.biosite.merge-users+json');

            expect(response.status).toEqual(200);
            expect(users.list().length).toEqual(1);
            expect(users.list()[0].firstName).toEqual('John');
            expect(users.list()[0].lastName).toEqual('Doe');
            expect(users.list()[0].qualifications.length).toEqual(1);
            expect(users.list()[0].qualifications[0].type).toEqual('First aid');
        });
    });
});
