import {ContextType, MiddlewareFn} from 'couchset';
import {get as _get, isEmpty} from 'lodash';

import {log} from '@roadmanjs/logs';
import {verify} from 'jsonwebtoken';

/**
 *
 * @sets context.payload = { userId, iat, exp }
 * @param next
 * @returns
 */
export const isAuth: MiddlewareFn<ContextType> = ({context}, next) => {
    const authorization = _get(context, 'req.headers.authorization', '');
    const accessTokenSecret = _get(process.env, 'ACCESS_TOKEN_SECRET', '');

    if (isEmpty(authorization)) {
        throw new Error('Not Authenticated');
    }

    try {
        const token = authorization.split(' ')[1];
        const verified = verify(token, accessTokenSecret);
        context.payload = verified;
    } catch (err) {
        log('not authenticated');
        throw new Error('not authenticated');
    }

    return next();
};
