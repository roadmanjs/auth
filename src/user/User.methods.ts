import UserModel, {
    LoginResponseType,
    UserType,
    allUserModelKeys,
    userModelName,
    userModelPublicSelectors,
} from './User.model';
import _, {isEmpty} from 'lodash';
import {createAccessToken, createRefreshToken} from './auth';

import {awaitTo} from 'couchset/dist/utils';
import {connectionOptions} from '@roadmanjs/couchset';
import {log} from '@roadmanjs/logs';

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
                throw new Error('Should not create new user');
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
export const createNewUser = async (args: UserType): Promise<LoginResponseType> => {
    const {email, fullname, phone, balance = 1, ...otherFields} = args;
    try {
        const findIfExits = await UserModel.pagination({
            where: {
                $or: [{email: {$eq: email}}, {phone: phone}],
            },
        });

        if (!isEmpty(findIfExits)) {
            throw new Error('user already exists');
        }

        const names = (fullname || '').split(' ');
        const firstname = names.length ? names[0] : null;
        const lastname = names.length ? names[1] : null;

        const user: UserType = {
            ...otherFields,
            fullname,
            firstname,
            lastname,
            phone,
            email,
            balance,
            currency: 'USD',
        };

        log('New user account', JSON.stringify(user));

        const userItem = _.pickBy(user, _.identity);
        // Create the user
        const createdUser: UserType = (await UserModel.create(userItem)) as UserType;

        const refreshToken = createRefreshToken(createdUser);
        const accessToken = createAccessToken(createdUser);

        return {
            success: true,
            user: createdUser,
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

        console.log('user search items', {parsedItems: parsedItems.length, rows: rows.length});

        return parsedItems as UserType[];
    } catch (error) {
        log('error getting ads listing methods', error);
        return [];
    }
};
