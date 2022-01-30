import gql from 'graphql-tag';

export interface ResType {
    success: boolean;
    message?: string;
    data?: any;
}

export const ResTypeFragment = gql`
    fragment ResTypeFragment on ResType {
        success
        message
        data
    }
`;
