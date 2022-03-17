import {MiddlewareFn} from 'type-graphql';
import {UserModel} from '../user';
import _get from 'lodash/get';
import {log} from '@roadmanjs/logs';

export const isAdmin: MiddlewareFn = async ({context}: any, next) => {
    try {
        const userId = _get(context, 'payload.userId', '');
        const user = await UserModel.findById(userId);
        if (user && user.admin) {
            log(`user is admin`, user.id);
            return next();
        }
        throw new Error('not admin');
    } catch (err) {
        console.log(err);
        return null;
    }
};
