import {get as _get, isEmpty} from 'lodash';

import {ContextType} from '../shared';
import {MiddlewareFn} from 'couchset';
import {log} from '@roadmanjs/logs';
import {verify} from 'jsonwebtoken';

export const verifyAuthToken = (token: string) => {
    const secret = _get(process.env, 'ACCESS_TOKEN_SECRET', '');
    const verified = verify(token, secret, {ignoreExpiration: false});
    return verified;
};
/**
 *
 * @sets context.payload = { userId, iat, exp }
 * @param next
 * @returns
 */
export const isAuth: MiddlewareFn<ContextType> = ({context}, next) => {
    const authorization = _get(context, 'req.headers.authorization', '');

    if (isEmpty(authorization)) {
        throw new Error('Not Authenticated');
    }

    try {
        const token = authorization.split(' ')[1];
        const verified = verifyAuthToken(token);
        context.payload = verified;
    } catch (err) {
        log('not authenticated');
        throw new Error('not authenticated');
    }

    return next();
};
