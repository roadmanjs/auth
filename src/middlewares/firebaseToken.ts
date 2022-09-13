import * as _firebase from 'firebase-admin';

import {FirebaseConfig, configureFirebase} from '@roadmanjs/firebase-admin';

import {MiddlewareFn} from 'couchset';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import {log} from '@roadmanjs/logs';

export const verifyFirebaseToken = (
    idToken: string,
    firebase = _firebase
): Promise<string | null> => {
    // idToken comes from the client app
    return new Promise((res) => {
        firebase
            .auth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                res(uid);
            })
            .catch((error) => {
                // Handle error
                log(`Error verifying token ${error && error.token}`);
                res(null);
            });
    });
};

export const FirebaseTokenMiddleware = (config?: FirebaseConfig): MiddlewareFn => {
    return async ({args}: any, next) => {
        const firebase = await configureFirebase(config);
        const token = (args && args.firebaseToken) || get(args, 'user.firebaseToken', ''); // args.user.firebaseToken;

        if (isEmpty(token)) {
            throw new Error('Token No authorization');
        }

        try {
            const verified = await verifyFirebaseToken(token, firebase as any);

            if (!verified) {
                throw new Error('No authorization, please try again');
            }
        } catch (err) {
            console.log(err);
            return null;
        }
        return next();
    };
};

export const FirebaseTokenVerify: MiddlewareFn = async ({args}: any, next) => {
    await configureFirebase();
    const token = (args && args.firebaseToken) || get(args, 'user.firebaseToken', ''); // args.user.firebaseToken;

    if (isEmpty(token)) {
        throw new Error('Token No authorization');
    }

    try {
        const verified = await verifyFirebaseToken(token);

        if (!verified) {
            throw new Error('No authorization, please try again');
        }
    } catch (err) {
        console.log(err);
        return null;
    }
    return next();
};
