# Biosite Technical Test

In this repository you will find a technical test representative of the kind of work you might do at 
Biosite. We would expect you to spend between 2 and 4 hours on the exercises, depending on your 
level of experience.

To get started clone the repository and install the dependencies from within the `server` directory:

    cd server
    npm ci

Start the server by running the following command:

    npm start

The placeholder application can be browsed to on:

    http://localhost:8080

There are a handful of API routes, the following route gets a list of users:

    curl http://localhost:8080/api/users

Unsurprisingly, a specific user (with id `:id`) can be accessed at

    curl http://localhost:8080/api/users/:id

Users are created by posting "commands":

    curl http://localhost:8080/api/users/commands -H 'Content-Type: application/vnd.in.biosite.create-user+json' -d '{"firstName": "John", "lastName": "Doe"}'

There are a few other commands available, you can find them in `server/src/routes/api/users/commands.ts`.

## Instructions

Click the **Use this template** button above to create a private repository in your own github
account and invite @biositesoftware as a _collaborator_ on your repository.

Please complete as much of the test as you can in the time you have. We recommend you complete the
parts in order on a new branch. Please open a pull request back to the master branch and add
@biositesoftware as a reviewer.

We suggest you annotate your pull request with what you have completed, as well as any other
information you feel is necessary.


### Part A. Fix the unit tests that are broken

The following command runs the unit tests:

    npm run test:unit

You will need to implement the `merge` function in `server/src/services/user-merger.service.ts` in
order to make the failing tests pass.


### Part B. Fix the integration tests that are broken after completion of Part A.

The following command runs the integration tests:

    npm run test:integration

all tests can be run with

    npm run test

The integration tests indicate that part of the API is missing, complete the missing API.


### Part C. Build a simple user interface utilising some of the APIs

The scope is up to you, but we are looking for _quality_, not _quantity_. A well structured
demonstration of your capabilities that only uses one of the APIs is perfectly acceptable.

We work in both Angular and React (depending on the project), so we have included template front
ends for both frameworks. We suggest you choose the one you are most comfortable with. With either
project run

    npm ci

to install dependencies and then

    npm start

to launch a development server.

There are a number of packages pre-installed, feel free to use any you see fit or add any of your
own choosing.

Good luck!

