import {Resolver, Mutation, Arg, Ctx, UseMiddleware} from 'couchset';
import isEmpty from 'lodash/isEmpty';
import {UserModel, LoginResponseType, UserType, allUserModelKeys} from './User.model';
import {log} from '@roadmanjs/logs';

import {createNewUser, createLoginToken} from './User.methods';
import {FirebaseTokenVerify} from '../middlewares/firebaseToken';
import {sendRefreshToken} from './auth';
import {ContextType} from '../shared';

@Resolver()
export class UserAuthResolver {
    @Mutation(() => LoginResponseType)
    @UseMiddleware(FirebaseTokenVerify)
    async phoneLogin(
        @Arg('phone', () => String, {nullable: false}) phone: string,
        @Arg('firebaseToken', () => String, {nullable: false}) _firebaseToken: string,
        @Arg('createNew', () => Boolean, {nullable: true}) createNew: boolean,
        @Ctx() {res}: ContextType
    ): Promise<LoginResponseType> {
        try {
            const username = phone;

            log(`LOGIN: phone=${phone} _firebaseToken=${_firebaseToken}`);

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

                const {refreshToken} = response;

                sendRefreshToken(res, refreshToken);

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

                const {refreshToken} = response;

                sendRefreshToken(res, refreshToken);

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
    }
}

export default UserAuthResolver;
