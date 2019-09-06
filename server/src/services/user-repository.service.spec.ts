import '../../test-helpers/unit-test-helper-barrel';
import { unitTestRootInjector } from '../../test-helpers/unit-test-injector';
import { Qualification, User, UserRepository } from './user-repository.service';


describe('#unit user repository service', () => {

    let service: UserRepository;
    beforeEach(() => {
        service = unitTestRootInjector.get(UserRepository);
    });

    describe('initial state', () => {
        it('should be empty initially', () => {
            expect(service.list()).toEqual([]);
        });
    });

    describe('creating a user', () => {
        it('should return an added user record', () => {
            const user = service.create({
                firstName: 'John',
                lastName: 'Doe',
                qualifications: [],
            });

            expect(user.firstName).toEqual('John');
            expect(user.lastName).toEqual('Doe');
            expect(user.qualifications).toEqual([]);
            expect(user.id).not.toBeFalsy();
        });

        it('should get added user records', () => {
            const user = service.create({
                firstName: 'John',
                lastName: 'Doe',
                qualifications: [],
            });

            expect(service.get(user.id)).toEqual(user);
        });

        it('should list added user records', () => {
            const user = service.create({
                firstName: 'John',
                lastName: 'Doe',
                qualifications: [],
            });

            expect(service.list()).toEqual([user]);
        });
    });

    describe('updating a user\'s name', () => {
        let user: User;
        beforeEach(() => {
            user = service.create({
                firstName: 'John',
                lastName: 'Doe',
                qualifications: [],
            });
        });

        it('should get an updated user record', () => {
            service.updateName({
                id: user.id,
                firstName: 'Jack',
                lastName: 'Smith',
            });

            expect(service.get(user.id)!.firstName).toEqual('Jack');
            expect(service.get(user.id)!.lastName).toEqual('Smith');
        });

        it('should list an updated user record', () => {
            service.updateName({
                id: user.id,
                firstName: 'Jack',
                lastName: 'Smith',
            });

            expect(service.list()[0]!.firstName).toEqual('Jack');
            expect(service.list()[0]!.lastName).toEqual('Smith');
        });
    });

    describe('deleting a user', () => {
        let user: User;
        beforeEach(() => {
            user = service.create({
                firstName: 'John',
                lastName: 'Doe',
                qualifications: [],
            });
        });

        it('should return undefined for a deleted user', () => {
            service.delete({id: user.id});

            expect(service.get(user.id)).toBeUndefined();
        });

        it('should not list a deleted user record', () => {
            service.delete({id: user.id});

            expect(service.list()).toEqual([]);
        });
    });

    describe('adding a qualification', () => {
        let user: User;
        beforeEach(() => {
            user = service.create({
                firstName: 'John',
                lastName: 'Doe',
                qualifications: [],
            });
        });

        it('should return an added qualification', () => {
            const qualification = service.addQualification({
                userId: user.id,
                type: 'First aid',
                uniqueId: null,
                expiry: null,
            });

            expect(qualification!.type).toEqual('First aid');
            expect(qualification!.uniqueId).toBeNull();
            expect(qualification!.expiry).toBeNull();
            expect(qualification!.id).not.toBeFalsy();
        });

        it('should add the qualification to the user', () => {
            const qualification = service.addQualification({
                userId: user.id,
                type: 'First aid',
                uniqueId: null,
                expiry: null,
            });

            expect(service.get(user.id)!.qualifications).toEqual([qualification!]);
        });

        it('should return undefined if the user does not exist', () => {
            const qualification = service.addQualification({
                userId: '5ac67406-ae49-4dad-8dcf-b14067bf5640',
                type: 'First aid',
                uniqueId: null,
                expiry: null,
            });

            expect(qualification).toBeUndefined();
        });
    });

    describe('deleting a qualification', () => {
        let user: User;
        let qualification: Qualification;
        beforeEach(() => {
            user = service.create({
                firstName: 'John',
                lastName: 'Doe',
                qualifications: [],
            });
            qualification = service.addQualification({
                userId: user.id,
                type: 'First aid',
                uniqueId: null,
                expiry: null,
            })!;
        });

        it('should not return a deleted qualification for user', () => {
            service.deleteQualification({ id: qualification.id });

            expect(service.get(user.id)!.qualifications).toEqual([]);
        });
    });
});
