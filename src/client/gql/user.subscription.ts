import {UserTypeFragment} from './user.fragment';
import gql from 'graphql-tag';

export const USER_SUBSCRIPTION = gql`
    subscription SubUser($id: String) {
        data: onUser(id: $id) {
            ...UserTypeFragment
        }
    }
    ${UserTypeFragment}
`;
