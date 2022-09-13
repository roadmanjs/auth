import {Resolver, Mutation, Arg, UseMiddleware} from 'couchset';
import {LoginResponseType} from './User.model';
import {log} from '@roadmanjs/logs';

import {phoneLogin} from './User.methods';
import {FirebaseTokenVerify} from '../middlewares/firebaseToken';

@Resolver()
export class UserAuthResolver {
    @Mutation(() => LoginResponseType)
    @UseMiddleware(FirebaseTokenVerify)
    async phoneLogin(
        @Arg('phone', () => String, {nullable: false}) phone: string,
        @Arg('firebaseToken', () => String, {nullable: false}) _firebaseToken: string,
        @Arg('createNew', () => Boolean, {nullable: true}) createNew: boolean
        // @Ctx() {res}: ContextType
    ): Promise<LoginResponseType> {
        log(`LOGIN: phone=${phone} _firebaseToken=${_firebaseToken}`);

        return await phoneLogin(phone, createNew);
    }
}

export default UserAuthResolver;
