import '../../test-helpers/unit-test-helper-barrel';
import { unitTestRootInjector } from '../../test-helpers/unit-test-injector';
import { UserMerger } from './user-merger.service';
import { Qualification, User } from './user-repository.service';

import { validate } from 'class-validator';
import { map } from 'lodash';

// We don't care about returned order, but tests are easier to write if they are sorted
function sortQualifications(qualifications: Qualification[]) {
    const sorted = [...qualifications];
    sorted.sort((left, right) => {
        if (left.type < right.type)
            return -1;
        else if (left.type > right.type)
            return 1;
        else if (left.uniqueId === null && right.uniqueId !== null)
            return -1;
        else if (left.uniqueId !== null && right.uniqueId === null)
            return 1;
        else if (left.uniqueId !== null && right.uniqueId !== null && left.uniqueId < right.uniqueId)
            return -1;
        else if (left.uniqueId !== null && right.uniqueId !== null && left.uniqueId > right.uniqueId)
            return 1;
        else if (left.expiry === null && right.expiry !== null)
            return -1;
        else if (left.expiry !== null && right.expiry === null)
            return 1;
        else if (left.expiry !== null && right.expiry !== null && left.expiry < right.expiry)
            return -1;
        else if (left.expiry !== null && right.expiry !== null && left.expiry > right.expiry)
            return 1;
        else
            return 0;
    });
    return sorted;
}


describe('#unit user merger service', () => {

    let service: UserMerger;
    beforeEach(() => {
        service = unitTestRootInjector.get(UserMerger);
    });

    describe('simple cases', () => {
        it('should throw with no users', () => {
            expect(() => service.merge([])).toThrow();
        });

        it('should be a no-op with one user', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [],
                },
            ];

            expect(service.merge(users)).toEqual(users[0]);
        });
    });

    describe('id', () => {
        it('should return a new user with a new unique UUID', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [],
                },
            ];

            const newUser = service.merge(users);

            expect(users).not.toContain(newUser);
            expect(map(users, (user) => user.id)).not.toContain(newUser.id);
            expect(newUser.id).toMatch(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/);
        });
    });

    describe('name', () => {
        it('should take the firstName and lastName from the first user', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'James',
                    lastName: 'Smith',
                    qualifications: [],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.firstName).toEqual('John');
            expect(newUser.lastName).toEqual('Doe');
        });

        it('should expand initials', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'J',
                    lastName: 'D',
                    qualifications: [],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.firstName).toEqual('John');
            expect(newUser.lastName).toEqual('Doe');
        });

        it('should expand initials with a dot', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'J.',
                    lastName: 'D.',
                    qualifications: [],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.firstName).toEqual('John');
            expect(newUser.lastName).toEqual('Doe');
        });

        it('should not expand other shortened names', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'Jo',
                    lastName: 'Smith',
                    qualifications: [],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'Joanne',
                    lastName: 'Smith',
                    qualifications: [],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.firstName).toEqual('Jo');
            expect(newUser.lastName).toEqual('Smith');
        });
    });

    describe('qualifications', () => {
        it('should generate new UUIDs for qualifications', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: 'a8b1bb81-226b-4b93-bb23-6d3b5bd45fec',
                            type: 'First aid',
                            uniqueId: null,
                            expiry: null,
                        },
                    ],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.qualifications.length).toEqual(1);
            expect(newUser.qualifications[0].id).not.toEqual('a8b1bb81-226b-4b93-bb23-6d3b5bd45fec');
            expect(newUser.qualifications[0].type).toEqual('First aid');
            expect(newUser.qualifications[0].uniqueId).toBeNull();
            expect(newUser.qualifications[0].expiry).toBeNull();
        });

        it('should merge duplicate qualifications with no unique id or expiry', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: 'a8b1bb81-226b-4b93-bb23-6d3b5bd45fec',
                            type: 'First aid',
                            uniqueId: null,
                            expiry: null,
                        },
                    ],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: '70bc1fb9-a91c-45fa-8996-7f5edab3a586',
                            type: 'First aid',
                            uniqueId: null,
                            expiry: null,
                        },
                    ],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.qualifications.length).toEqual(1);
            expect(newUser.qualifications[0].id).not.toEqual('a8b1bb81-226b-4b93-bb23-6d3b5bd45fec');
            expect(newUser.qualifications[0].id).not.toEqual('70bc1fb9-a91c-45fa-8996-7f5edab3a586');
            expect(newUser.qualifications[0].type).toEqual('First aid');
            expect(newUser.qualifications[0].uniqueId).toBeNull();
            expect(newUser.qualifications[0].expiry).toBeNull();
        });

        it('should merge duplicate qualifications with no expiry', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: 'a8b1bb81-226b-4b93-bb23-6d3b5bd45fec',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: null,
                        },
                    ],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: '70bc1fb9-a91c-45fa-8996-7f5edab3a586',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: null,
                        },
                    ],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.qualifications.length).toEqual(1);
            expect(newUser.qualifications[0].id).not.toEqual('a8b1bb81-226b-4b93-bb23-6d3b5bd45fec');
            expect(newUser.qualifications[0].id).not.toEqual('70bc1fb9-a91c-45fa-8996-7f5edab3a586');
            expect(newUser.qualifications[0].type).toEqual('First aid');
            expect(newUser.qualifications[0].uniqueId).toEqual('1234');
            expect(newUser.qualifications[0].expiry).toBeNull();
        });

        it('should merge duplicate qualifications', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: 'a8b1bb81-226b-4b93-bb23-6d3b5bd45fec',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: '2029-07-22',
                        },
                    ],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: '70bc1fb9-a91c-45fa-8996-7f5edab3a586',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: '2029-07-22',
                        },
                    ],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.qualifications.length).toEqual(1);
            expect(newUser.qualifications[0].id).not.toEqual('a8b1bb81-226b-4b93-bb23-6d3b5bd45fec');
            expect(newUser.qualifications[0].id).not.toEqual('70bc1fb9-a91c-45fa-8996-7f5edab3a586');
            expect(newUser.qualifications[0].type).toEqual('First aid');
            expect(newUser.qualifications[0].uniqueId).toEqual('1234');
            expect(newUser.qualifications[0].expiry).toEqual('2029-07-22');
        });

        it('should preserve duplicate qualifications with different unique IDs', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: 'a8b1bb81-226b-4b93-bb23-6d3b5bd45fec',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: null,
                        },
                    ],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: '70bc1fb9-a91c-45fa-8996-7f5edab3a586',
                            type: 'First aid',
                            uniqueId: '5678',
                            expiry: null,
                        },
                    ],
                },
            ];

            const newUser = service.merge(users);
            const sortedQualifications = sortQualifications(newUser.qualifications);
            expect(sortedQualifications.length).toEqual(2);
            expect(sortedQualifications[0].id).not.toEqual('a8b1bb81-226b-4b93-bb23-6d3b5bd45fec');
            expect(sortedQualifications[0].id).not.toEqual('70bc1fb9-a91c-45fa-8996-7f5edab3a586');
            expect(sortedQualifications[0].type).toEqual('First aid');
            expect(sortedQualifications[0].uniqueId).toEqual('1234');
            expect(sortedQualifications[0].expiry).toBeNull();
            expect(sortedQualifications[1].id).not.toEqual('a8b1bb81-226b-4b93-bb23-6d3b5bd45fec');
            expect(sortedQualifications[1].id).not.toEqual('70bc1fb9-a91c-45fa-8996-7f5edab3a586');
            expect(sortedQualifications[1].type).toEqual('First aid');
            expect(sortedQualifications[1].uniqueId).toEqual('5678');
            expect(sortedQualifications[1].expiry).toBeNull();
        });

        it('should preserve duplicate qualifications when the expiry date is null', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: 'a8b1bb81-226b-4b93-bb23-6d3b5bd45fec',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: null,
                        },
                    ],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: '70bc1fb9-a91c-45fa-8996-7f5edab3a586',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: '2029-01-01',
                        },
                    ],
                },
            ];

            const newUser = service.merge(users);
            const sortedQualifications = sortQualifications(newUser.qualifications);
            expect(sortedQualifications.length).toEqual(2);
            expect(sortedQualifications[0].id).not.toEqual('a8b1bb81-226b-4b93-bb23-6d3b5bd45fec');
            expect(sortedQualifications[0].id).not.toEqual('70bc1fb9-a91c-45fa-8996-7f5edab3a586');
            expect(sortedQualifications[0].type).toEqual('First aid');
            expect(sortedQualifications[0].uniqueId).toEqual('1234');
            expect(sortedQualifications[0].expiry).toBeNull();
            expect(sortedQualifications[1].id).not.toEqual('a8b1bb81-226b-4b93-bb23-6d3b5bd45fec');
            expect(sortedQualifications[1].id).not.toEqual('70bc1fb9-a91c-45fa-8996-7f5edab3a586');
            expect(sortedQualifications[1].type).toEqual('First aid');
            expect(sortedQualifications[1].uniqueId).toEqual('1234');
            expect(sortedQualifications[1].expiry).toEqual('2029-01-01');
        });

        it('should use the later expiry date for duplicates where the expiry date has been set', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: 'a8b1bb81-226b-4b93-bb23-6d3b5bd45fec',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: '2029-01-01',
                        },
                    ],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: '70bc1fb9-a91c-45fa-8996-7f5edab3a586',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: '2029-07-22',
                        },
                    ],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.qualifications.length).toEqual(1);
            expect(newUser.qualifications[0].id).not.toEqual('a8b1bb81-226b-4b93-bb23-6d3b5bd45fec');
            expect(newUser.qualifications[0].id).not.toEqual('70bc1fb9-a91c-45fa-8996-7f5edab3a586');
            expect(newUser.qualifications[0].type).toEqual('First aid');
            expect(newUser.qualifications[0].uniqueId).toEqual('1234');
            expect(newUser.qualifications[0].expiry).toEqual('2029-07-22');
        });
    });

    describe('multiple users', () => {
        it('should merge all users in the array', () => {
            const users: User[] = [
                {
                    id: '0435f2fe-0b26-49a8-a3f1-98578e27290c',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: 'a8b1bb81-226b-4b93-bb23-6d3b5bd45fec',
                            type: 'First aid',
                            uniqueId: '1234',
                            expiry: '2029-01-01',
                        },
                    ],
                },
                {
                    id: '61949450-fbd9-4e73-a574-9904c0d2fad5',
                    firstName: 'J',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: '70bc1fb9-a91c-45fa-8996-7f5edab3a586',
                            type: 'Fire marshal',
                            uniqueId: '1234',
                            expiry: '2029-07-22',
                        },
                    ],
                },
                {
                    id: '56978abd-3776-4835-ac3b-e0d5810e0b78',
                    firstName: 'John',
                    lastName: 'Doe',
                    qualifications: [
                        {
                            id: '8a8add10-1ae9-4417-a4b0-5fb2e012fb75',
                            type: 'CSCS - Red - Trainee',
                            uniqueId: '0000',
                            expiry: '2029-07-22',
                        },
                    ],
                },
            ];

            const newUser = service.merge(users);
            expect(newUser.firstName).toEqual('John');
            expect(newUser.lastName).toEqual('Doe');
            const sortedQualifications = sortQualifications(newUser.qualifications);
            expect(sortedQualifications.length).toEqual(3);
            expect(sortedQualifications[0].type).toEqual('CSCS - Red - Trainee');
            expect(sortedQualifications[0].uniqueId).toEqual('0000');
            expect(sortedQualifications[0].expiry).toEqual('2029-07-22');
            expect(sortedQualifications[1].type).toEqual('Fire marshal');
            expect(sortedQualifications[1].uniqueId).toEqual('1234');
            expect(sortedQualifications[1].expiry).toEqual('2029-07-22');
            expect(sortedQualifications[2].type).toEqual('First aid');
            expect(sortedQualifications[2].uniqueId).toEqual('1234');
            expect(sortedQualifications[2].expiry).toEqual('2029-01-01');


        });
    });
});
