import React from 'react';
import { User } from '../user-list-container';

function UserProfile(props: User) {
    return (
        <div className="user-profile">
            <span>First Name: {props.firstName}</span>
            <span>Last Name: {props.lastName}</span>
            <span>Qualifications: {props.qualifications.map((qual) => {
                return `${qual.type} Expires: ${qual.expiry}`
            })}</span>
        </div>
    )
}

export default UserProfile;