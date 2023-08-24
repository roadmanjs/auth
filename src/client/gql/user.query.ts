import {AuthResTypeFragment} from './shared';
import {UserTypeFragment} from './user.fragment';
import gql from 'graphql-tag';

// export const GET_END_USER = gql`
//   query GetEnduser($id: ID) {
//     enduser(id: $id) {
//       ...EnduserFragment
//     }
//   }
//   ${EnduserFragment}
// `;

export const GET_ALL_USERS = gql`
    query GetAllUsers($search: String, $page: Float, $limit: Float) {
        users(search: $search, page: $page, limit: $limit) {
            ...UserTypeFragment
        }
    }
    ${UserTypeFragment}
`;

export const GET_ME = gql`
    query GetMe {
        me {
            ...UserTypeFragment
        }
    }
    ${UserTypeFragment}
`;

export const GET_USER_PUBLIC = gql`
    query GetUser($id: String!) {
        data: getUser(id: $id) {
            ...UserTypeFragment
        }
    }
    ${UserTypeFragment}
`;

export const CHECK_USERNAME_MUTATION = gql`
    query CheckUsername($username: String!) {
        data: checkUsername(username: $username) {
            ...AuthResTypeFragment
        }
    }
    ${AuthResTypeFragment}
`;
