import 'dotenv/config';
import 'reflect-metadata';

import {couchsetRoadman} from '@roadmanjs/couchset';
import {getAuthResolvers} from '../roadman';
import {roadman} from 'roadman';

roadman({resolvers: [...getAuthResolvers()], roadmen: [couchsetRoadman as any]})
    .then(() => {
        console.log('roadman started');
    })
    .catch((error) => {
        console.error(error);
    });
