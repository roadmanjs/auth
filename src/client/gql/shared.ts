import gql from 'graphql-tag';

export interface ResType {
    success: boolean;
    message?: string;
    data?: any;
}

export const AuthResTypeFragment = gql`
    fragment AuthResTypeFragment on AuthResType {
        success
        message
        data
    }
`;
