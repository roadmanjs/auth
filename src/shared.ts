import {Request, Response} from 'express';

import {RedisPubSub} from 'graphql-redis-subscriptions';

export interface ContextType {
    req: Request;
    res: Response;
    payload?: any;
    pubsub?: RedisPubSub;
}
