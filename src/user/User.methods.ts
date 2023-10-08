import UserModel, {
    LoginResponseType,
    UserType,
    allUserModelKeys,
    userModelName,
    userModelPublicSelectors,
} from './User.model';
import _, {isEmpty} from 'lodash';
import {createAccessToken, createRefreshToken} from './auth';

import argon2 from 'argon2';
import {awaitTo} from 'couchset/dist/utils';
import bip39 from 'bip39';
import {connectionOptions} from '@roadmanjs/couchset';
import {log} from '@roadmanjs/logs';

const passwordVerify = async (hash: string, password: string): Promise<boolean> => {
    try {
        if (await argon2.verify(hash, password)) {
            // password match
            return true;
        } else {
            // password did not match
        }
        return false;
    } catch (err) {
        // internal failure
        return false;
    }
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
    log(`CheckUsernameExists: username=${username}`);

    const users = await UserModel.pagination({
        select: allUserModelKeys,
        where: {
            $or: [{email: {$eq: username}}, {username}],
        },
    });

    log(`users found are users=${users.length}`);

    if (isEmpty(users)) {
        return false;
    }

    return true;
};

export const passwordLogin = async (
    username: string,
    password: string,
    createNew = false
): Promise<LoginResponseType> => {
    try {
        log(`PWLOGIN: username=${username}`);

        if (isEmpty(username)) {
            throw new Error('username is required');
        }

        if (isEmpty(password)) {
            throw new Error('password is required');
        }

        const users = await UserModel.pagination({
            select: allUserModelKeys,
            where: {
                $or: [{email: {$eq: username}}, {username}],
            },
        });

        log(`users found are users=${users.length}`);

        const foundUsers: UserType[] = users;

        const firstUser = foundUsers[0];

        if (!isEmpty(firstUser)) {
            if (createNew) {
                throw new Error('Account already exists, please login');
            }

            // login

            // user is found
            const user = firstUser; // get first document

            const passwordMatch = await passwordVerify(user.hash, password);

            if (!passwordMatch) {
                // TODO make it more generic, broad.
                throw new Error('password did not match');
            }

            const response = await createLoginToken(user); // login user without password

            return response;
        } else {
            if (!createNew) {
                throw new Error('Should create a new account');
            }
            // create new
            const response = await createNewUser(
                {
                    email: '',
                    fullname: '',
                    username,
                },
                password
            );

            log(`creating new user =${JSON.stringify(response)}`);

            return response;
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error && error.message,
            accessToken: null,
            refreshToken: null,
            user: null,
        } as unknown as LoginResponseType;
    }
};

export const phoneLogin = async (phone: string, createNew = false): Promise<LoginResponseType> => {
    try {
        const username = phone;

        log(`LOGIN: phone=${phone}`);

        const users = await UserModel.pagination({
            select: allUserModelKeys,
            where: {
                $or: [{email: {$eq: username}}, {phone: username}, {phone: `+1${username}`}],
            },
        });

        log(`users found are users=${users.length}`);

        const foundUsers: UserType[] = users;

        const firstUser = foundUsers[0];

        if (!isEmpty(firstUser)) {
            // user is found
            const user = firstUser; // get first document

            const response = await createLoginToken(user); // login user without password

            return response;
        } else {
            if (!createNew) {
                throw new Error('Should create a new account');
            }
            // create new
            const response = await createNewUser({
                email: '',
                fullname: '',
                phone,
            });

            log(`creating new user =${JSON.stringify(response)}`);

            return response;
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error && error.message,
            accessToken: null,
            refreshToken: null,
            user: null,
        } as unknown as LoginResponseType;
    }
};

/**
 * Shared Create user method
 * @param args
 */
export const createNewUser = async (
    args: UserType,
    password?: string
): Promise<LoginResponseType> => {
    const {email, fullname, phone, username, balance = 1, ...otherFields} = args;

    const isPhoneAuth = isEmpty(password);

    try {
        let findIfExits = await UserModel.pagination({
            where: {
                $or: [{email: {$eq: email}}, {username}],
            },
        });

        if (isPhoneAuth) {
            findIfExits = await UserModel.pagination({
                where: {
                    $or: [{email: {$eq: email}}, {phone: phone}, {username}],
                },
            });
        }

        if (!isEmpty(findIfExits)) {
            throw new Error('user already exists');
        }

        const names = (fullname || '').split(' ');
        const firstname = names.length ? names[0] : null;
        const lastname = names.length ? names[1] : null;
        let passwordHash = '',
            mnemonicHash = '',
            mnemonic = '';

        if (!isPhoneAuth) {
            passwordHash = await argon2.hash(password);
            mnemonic = bip39.generateMnemonic();
            mnemonicHash = await argon2.hash(mnemonic);
        }

        const user: UserType = {
            ...otherFields,
            fullname,
            firstname,
            lastname,
            phone,
            email,
            balance,
            currency: 'USD',
            hash: passwordHash,
            mnemonicHash,
            username,
        };

        log('New user account', JSON.stringify(user));

        const userItem = _.pickBy(user, _.identity);
        // Create the user
        const createdUser: UserType = (await UserModel.create(userItem)) as UserType;

        const refreshToken = createRefreshToken(createdUser);
        const accessToken = createAccessToken(createdUser);

        return {
            success: true,
            user: {...createdUser, mnemonic} as any, // one time see only
            refreshToken,
            accessToken,
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/**
 * Shared user login experience
 * @param user
 * @param password
 */
export const createLoginToken = async (user: UserType): Promise<LoginResponseType> => {
    try {
        if (!user) {
            throw new Error('could not find user');
        }

        const refreshToken = createRefreshToken(user);
        const accessToken = createAccessToken(user);

        return {
            success: true,
            accessToken,
            refreshToken,
            user,
        };
    } catch (error) {
        console.error('error login in', error);
        throw error;
    }
};

export const searchUserPublic = async (search: string, limit = 20): Promise<UserType[]> => {
    try {
        const searchString = search.toLowerCase();
        const bucket = connectionOptions.bucketName;

        const query = `
        SELECT ${userModelPublicSelectors.join()}
        FROM \`${bucket}\` AS ${bucket}
        WHERE _type = "${userModelName}" 
            AND ( 
               REGEXP_CONTAINS(lower(firstname), "${searchString}+.*")
            OR REGEXP_CONTAINS(lower(lastname), "${searchString}+.*")
            OR REGEXP_CONTAINS(lower(fullname), "${searchString}+.*")
            OR REGEXP_CONTAINS(lower(phone), "${searchString}+.*")
            )
            LIMIT ${limit};
        `;

        const [errorFetching, data = []] = await awaitTo(
            UserModel.customQuery<UserType[]>({
                limit,
                query,
                params: {limit},
            })
        );

        if (errorFetching) {
            throw errorFetching;
        }

        const [rows = []] = data;

        const parsedItems = rows.map((row) => UserModel.parse(row));

        log('user search items', {parsedItems: parsedItems.length, rows: rows.length});

        return parsedItems as UserType[];
    } catch (error) {
        log('error getting ads listing methods', error);
        return [];
    }
};
