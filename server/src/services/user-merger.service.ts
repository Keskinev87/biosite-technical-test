import { Injectable } from 'injection-js';
import { User } from './user-repository.service';


@Injectable()
export class UserMerger {
    public merge(users: User[]): User {
        return {
            id: '',
            firstName: '',
            lastName: '',
            qualifications: [],
        };
    }
}
