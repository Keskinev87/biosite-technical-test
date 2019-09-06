import { Injectable } from 'injection-js';
import { User, Qualification } from './user-repository.service';
import * as uuid from 'uuid/v4';


@Injectable()
export class UserMerger {
    public merge(users: User[]): User {
        if (users.length === 0)
            throw new Error("Please select at least two users")
        else {
            let firstName = users[0].firstName;
            let lastName = users[0].lastName;

            if(firstName.length === 1 || firstName[firstName.length - 1] === '.')
                firstName = users[1].firstName
            
            if(lastName.length === 1 || lastName[lastName.length - 1] === '.')
                lastName = users[1].lastName

            let newUser: User = {
                id: users.length > 1 ? uuid() : users[0].id,
                firstName: firstName,
                lastName: lastName,
                qualifications: []
            }

            let allQualifications: Array<Qualification> = [];
            users.forEach((user: User) => {
                allQualifications =  allQualifications.concat(user.qualifications);
            });
            
            allQualifications.forEach((qualification: Qualification) => {
                let qualIndex = newUser.qualifications.findIndex(el => el.type === qualification.type && el.uniqueId === qualification.uniqueId);
                if(qualIndex !== -1) {
                    let firstQualification = newUser.qualifications[qualIndex];
                    
                    if(firstQualification.expiry !== null && qualification.expiry !== null && new Date(qualification.expiry).getTime() > new Date(firstQualification.expiry).getTime())
                        firstQualification.expiry = qualification.expiry;
                    if(firstQualification.expiry === null && qualification.expiry !== null)
                        newUser.qualifications.push(Object.assign({}, qualification,{id: uuid()}));
                        
                } 
                else {
                    qualification.id = uuid();
                    newUser.qualifications.push(qualification);
                } 
                    
            });

            
            
            return newUser
        }
        
    }
}
