import 'reflect-metadata';
import 'mocha';

import {createNewUser, searchUserPublic} from './User.methods';

import {UserType} from './User.model';
import {expect} from 'chai';
import {faker} from '@faker-js/faker';
import {startCouchbase} from '@roadmanjs/couchset';

export const USERS: UserType[] = [];

export function createRandomUser(): UserType {
    const firstname = faker.name.firstName();
    const lastname = faker.name.lastName();

    return {
        username: faker.internet.userName(),
        address: faker.address.streetAddress(),
        avatar: faker.image.avatar(),
        city: faker.address.city(),
        country: faker.address.country(),
        coverImage: faker.image.avatar(),
        email: faker.internet.email(),
        firstname,
        fullname: firstname + ' ' + lastname,
        lastname,
        phone: faker.phone.number(),
        state: faker.address.state(),
        zipcode: faker.address.zipCode(),

        // @ts-ignore
        test: true,
    };
}

before((done) => {
    startCouchbase().then(() => done());
});

describe('UserMethods', () => {
    it('it should search for a user "Ceddy"', async () => {
        const users = await searchUserPublic('416');
        console.log('users', users);
        expect(users).to.be.an('array');
    });

    // it('it should create random users', async () => {
    //     Array.from({length: 100}).forEach(() => {
    //         USERS.push(createRandomUser());
    //     });

    //     const newUsers = await Promise.all(USERS.map((user) => createNewUser(user)));
    //     console.log('users', newUsers.length);
    //     expect(newUsers).to.be.an('array');
    // });

    // it('it should search for from toronto', async () => {
    //     const users = await searchUserPublic('toronto');
    //     console.log("users from toronto", users);
    //     expect(users).to.be.an('array');
    // });
});
