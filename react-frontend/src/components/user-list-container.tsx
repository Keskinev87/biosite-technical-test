import React from 'react';
import UserProfile from './users/user-profile';
import Button from './shared/button';

export interface Qualification {
    id: string;
    type: string;
    uniqueId: string | null;
    expiry: string | null;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    qualifications: Qualification[];
}

interface UserListState {
    users: Array<User>,
    shouldFetch: boolean,
    isFetching: boolean,
    isError: boolean,
    error: string
}

const initialState: UserListState = {
    users: [],
    shouldFetch: true,
    isFetching: true,
    isError: false,
    error: ''
}

class UserListComponent extends React.Component<{}, UserListState> {
    constructor(props:{} ={}) {
        super(props);
        this.state = initialState;
        this.fetchAllUsers = this.fetchAllUsers.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
    }

    componentDidMount() {
        this.state.shouldFetch && this.fetchAllUsers();
    }

    componentDidUpdate() {
        this.state.shouldFetch && this.fetchAllUsers();
    }

    addNewUser() {
        console.log("Add new user");
        fetch('http://localhost:8080/api/users/commands', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/vnd.in.biosite.create-user+json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify({
                firstName: "John",
                lastName: "Doe"
            }), // body data type must match "Content-Type" header
        })
        .then(() => {
            this.setState((prevState) => ({
                ...prevState,
                shouldFetch: true,
                isFetching: true,
            }))
        })
        .catch(error => {
            this.setState((prevState) => ({
                ...prevState,
                shouldFetch: false,
                isFetching: false,
                isError: true,
                error: "Could not create a new user. Please check your connection...",
            }))
        })
    }

    fetchAllUsers() {
        fetch('http://localhost:8080/api/users')
        .then(response => response.json())
        .then(users => this.setState((prevState) => ({
            ...prevState,
            users: users,
            shouldFetch: false,
            isFetching: false,
            isError: false,
            error: ''
        })))
        .catch((error: Error) => {
            this.setState((prevState) => ({
                ...prevState,
                shouldFetch: false,
                isFetching: false,
                isError: true,
                error: "Could not fetch the users. Please check your connection...",
            }))
        })
    }

    render() {
        let element: any = <div>Loading...</div>;
        switch (true) {
            case this.state.isFetching:
                element = <div>Loading...</div>;
                break;
            case this.state.isError:
                element = <p>{this.state.error}</p>;
                break;
            default:
                element = <div className="users-list-container">
                            {(this.state.users).map(user => (
                                <UserProfile key={user.id} {...user}/>
                            ))}
                            <Button {...{onClick: this.addNewUser, name: "Add new user"}} />
                        </div>
            
        }
        return (
            <section className="users-section">
               {element}
            </section>
        )
    }
}

export default UserListComponent;