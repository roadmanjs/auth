import {ResType} from './shared';
import gql from 'graphql-tag';

export interface UserType {
    id: string;
    admin?: boolean;
    username?: string;
    fullname?: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    website?: string;
    country?: string;
    bio?: string;
    address?: string;
    state?: string;
    city?: string;
    zipcode?: string;
    coverImage?: string;
    avatar?: string;
    tokenVersion?: number;
    balance: number;
    currency: string;
}

export interface LoginResponseType extends ResType {
    accessToken: string;
    refreshToken: string;
    user: UserType;
}

export const UserTypeFragment = gql`
    fragment UserTypeFragment on UserType {
        id
        admin
        username
        fullname
        firstname
        lastname
        email
        phone
        website
        country
        bio
        address
        state
        city
        zipcode
        tokenVersion
        coverImage
        avatar
        balance
        currency
    }
`;

export const LoginResponseTypeFragment = gql`
    fragment LoginResponseTypeFragment on LoginResponseType {
        accessToken
        refreshToken
        user {
            ...UserTypeFragment
        }

        success
        message
    }
    ${UserTypeFragment}
`;

export default UserTypeFragment;
