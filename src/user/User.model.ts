import {Field, InputType, Model, ObjectType} from 'couchset';

import GraphQLJSON from 'graphql-type-json';
import {isEmpty} from 'lodash';

const modelName = 'User';
/**
 * GraphQL Types start
 */

@ObjectType('UserType')
export class UserType {
    @Field(() => String, {nullable: true})
    id?: string = '';

    @Field(() => String, {nullable: true})
    email?: string = '';

    @Field(() => String, {nullable: true})
    username?: string = '';

    @Field(() => String, {nullable: true})
    fullname?: string = '';

    @Field(() => String, {nullable: true})
    firstname?: string = '';

    @Field(() => String, {nullable: true})
    lastname?: string = '';

    @Field(() => String, {nullable: true})
    phone?: string = '';

    @Field(() => String, {nullable: true})
    website?: string = '';

    @Field(() => String, {nullable: true})
    address?: string = '';

    @Field(() => String, {nullable: true})
    city?: string = '';

    @Field(() => String, {nullable: true})
    state?: string = '';

    @Field(() => String, {nullable: true})
    zipcode?: string = '';

    @Field(() => String, {nullable: true})
    country?: string = '';

    @Field(() => String, {nullable: true})
    bio?: string = '';

    @Field(() => String, {nullable: true})
    avatar?: string = '';

    @Field(() => String, {nullable: true})
    coverImage?: string = '';

    // Wallet here
    @Field(() => String, {nullable: true})
    currency?: string = '';

    @Field(() => Number, {nullable: true})
    balance?: number = 0;

    @Field(() => Boolean, {nullable: true})
    admin?: boolean = false;

    @Field(() => [String], {nullable: true})
    plans?: string[] = [];

    // Revoke accessToken
    @Field(() => Number, {nullable: true})
    tokenVersion?: number = 0;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;
}

export const allUserModelKeys: string[] = Object.getOwnPropertyNames(new UserType());

@InputType('UserTypeInput')
export class UserTypeInput {
    @Field(() => String, {nullable: true})
    email?: string;

    @Field(() => String, {nullable: true})
    username?: string;

    @Field(() => String, {nullable: true})
    fullname?: string;

    @Field(() => String, {nullable: true})
    firstname?: string;

    @Field(() => String, {nullable: true})
    lastname?: string;

    @Field(() => String, {nullable: true})
    phone?: string;

    @Field(() => String, {nullable: true})
    website?: string;

    @Field(() => String, {nullable: true})
    address?: string;

    @Field(() => String, {nullable: true})
    country?: string;

    @Field(() => String, {nullable: true})
    city?: string = '';

    @Field(() => String, {nullable: true})
    state?: string = '';

    @Field(() => String, {nullable: true})
    zipcode?: string = '';

    @Field(() => String, {nullable: true})
    bio?: string;

    @Field(() => String, {nullable: true})
    avatar?: string;

    @Field(() => String, {nullable: true})
    coverImage?: string;
}

export const userModelPublicSelectors = [
    'id',
    'email',
    'username',
    'fullname',
    'firstname',
    'lastname',
    'phone',
    'website',
    'address',
    'city',
    'state',
    'zipcode',
    'country',
    'bio',
    'avatar',
    'coverImage',
];

@ObjectType()
export class LoginResponseType {
    @Field(() => Boolean, {nullable: false})
    success: boolean;

    @Field(() => String, {nullable: true})
    message?: string;

    @Field(() => String, {nullable: true})
    refreshToken: string;

    @Field(() => String, {nullable: true})
    accessToken: string;

    @Field(() => UserType, {nullable: true})
    user: UserType;
}

@ObjectType('AuthResType')
export class AuthResType {
    @Field(() => Boolean, {nullable: false})
    success: boolean;

    @Field(() => String, {nullable: true})
    message?: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Field((type) => GraphQLJSON, {nullable: true})
    data?: any;
}

export const UserModel: Model = new Model(modelName);

/**
 * Methods
 */
export const incrementRefreshToken = async (userId: string): Promise<boolean> => {
    const existing = await UserModel.findById(userId);
    if (!isEmpty(existing)) {
        const currentVersion = existing.tokenVersion || 0;
        existing.tokenVersion = currentVersion + 1;
        await UserModel.save(existing);
        return true;
    }
    return false;
};

export default UserModel;
