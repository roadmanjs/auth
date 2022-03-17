import {MiddlewareFn} from 'type-graphql';
import isEmpty from 'lodash/isEmpty';
import {verify} from 'jsonwebtoken';

// TODO apply contentModel, it's id
// TODO finish comparator
export const isOwner: MiddlewareFn = async ({context}: any, next) => {
    const authorization = context.req.headers['authorization'];

    if (!authorization) {
        throw new Error('No authorization');
    }

    try {
        const token = authorization.split(' ')[1];
        const verified: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

        if (isEmpty(verified && verified.userId)) {
            throw new Error('No authorization, please try again');
        }
    } catch (err) {
        console.log(err);
        return null;
    }
    return next();
};
