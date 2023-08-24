import {Resolver, Mutation, Arg, UseMiddleware} from 'couchset';
import {AuthResType, LoginResponseType} from './User.model';
import {log} from '@roadmanjs/logs';

import {checkUsernameExists, passwordLogin, phoneLogin} from './User.methods';
import {FirebaseTokenMiddleware} from '../middlewares/firebaseToken';

@Resolver()
export class UserAuthResolver {
    @Mutation(() => LoginResponseType)
    @UseMiddleware(FirebaseTokenMiddleware())
    async phoneLogin(
        @Arg('phone', () => String, {nullable: false}) phone: string,
        @Arg('firebaseToken', () => String, {nullable: false}) _firebaseToken: string,
        @Arg('createNew', () => Boolean, {nullable: true}) createNew: boolean
        // @Ctx() {res}: ContextType
    ): Promise<LoginResponseType> {
        log(`LOGIN: phone=${phone} _firebaseToken=${_firebaseToken}`);

        return await phoneLogin(phone, createNew);
    }

    // captcha code middleware
    @Mutation(() => LoginResponseType)
    async passwordLogin(
        @Arg('username', () => String, {nullable: false}) username: string,
        @Arg('password', () => String, {nullable: false}) password: string,
        @Arg('createNew', () => Boolean, {nullable: false}) createNew: boolean
        // captcha code
        // @Ctx() {res}: ContextType
    ): Promise<LoginResponseType> {
        log(`LOGIN: phone=${username}`);
        return await passwordLogin(username, password, createNew);
    }

    @Mutation(() => AuthResType)
    async checkUsername(
        @Arg('username', () => String, {nullable: false}) username: string
        // captcha code
        // @Ctx() {res}: ContextType
    ): Promise<AuthResType> {
        log(`Check Username: phone=${username}`);
        try {
            const usernameExists = await checkUsernameExists(username);

            if (usernameExists) {
                throw new Error('Username already exists');
            }

            return {
                success: true,
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: error.message,
            };
        }
    }

    // passwordReset, passwordChangeToken
    // TODO emailLogin
}

export default UserAuthResolver;
