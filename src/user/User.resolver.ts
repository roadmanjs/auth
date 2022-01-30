import {Resolver, Query, Mutation, Arg, Ctx, UseMiddleware, ContextType} from 'couchset';
import {UserType, UserModel, incrementRefreshToken, ResType, UserTypeInput} from './User.model';
import {sendRefreshToken} from './auth';
import {isAuth} from '../middlewares/isAuth';
import isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import {verify} from 'jsonwebtoken';
import {log} from '@roadmanjs/logs';

@Resolver()
export class UserResolver {
    @Query(() => UserType)
    @UseMiddleware(isAuth)
    async me(@Ctx() context: ContextType): Promise<UserType | null> {
        const authorization = _get(context, 'req.headers.authorization', '');
        if (isEmpty(authorization)) {
            throw new Error('Not Authenticated');
        }
        try {
            const token = authorization.split(' ')[1];
            const verified = verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
            const {userId} = verified;
            if (isEmpty(userId)) {
                throw new Error('userId is not valid');
            }

            const user = await UserModel.findById(userId);
            return user;
        } catch (err) {
            console.log('error getting me', err);
            throw err;
        }
    }

    @Mutation(() => ResType)
    @UseMiddleware(isAuth)
    async revokeRefreshTokenForUser(@Arg('userId', () => String) userId: string): Promise<ResType> {
        try {
            const updated = await incrementRefreshToken(userId);
            if (!updated) {
                throw new Error('error revokeRefreshTokenForUser');
            }
            return {success: true};
        } catch (err) {
            return {success: false, message: err && err.message};
        }
    }

    // @UseMiddleware(FirebaseToken)
    @UseMiddleware(isAuth)
    @Mutation(() => ResType)
    async updateUserProfile(
        @Arg('user', () => UserTypeInput) user: UserTypeInput,
        @Ctx() {payload}: ContextType
    ): Promise<ResType> {
        try {
            // TODO client verification for certain fields like phone, email and username only.
            // TODO @phone inject firebase auth for phone number
            // TODO @email
            // TODO username just check in database and give error accordingly.
            const userId = payload && payload.userId;
            log('update userId', userId);

            const findUser = await UserModel.findById(userId);

            if (findUser) {
                const updatedUser = {
                    ...findUser,
                    ...user,
                };

                const apiUpdateUser = await UserModel.updateById(userId, updatedUser);

                return {success: true, data: apiUpdateUser};
            }
            throw new Error('error updating user');
        } catch (err) {
            return {success: false, message: err && err.message};
        }
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async logout(@Ctx() {res}: ContextType) {
        sendRefreshToken(res, '');
        return true;
    }
}

export default UserResolver;
