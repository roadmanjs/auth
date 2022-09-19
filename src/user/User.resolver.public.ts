import {Resolver, Arg, Query} from 'couchset';
import {log} from '@roadmanjs/logs';
import {UserType} from './User.model';
import {searchUserPublic} from './User.methods';

@Resolver()
export class UserResolverPublic {
    @Query(() => [UserType])
    async getUser(
        @Arg('id', () => String, {nullable: false}) id: string
    ): Promise<UserType[] | null> {
        try {
            const username = id;

            log(`GET USER: id,username=${username}`);

            const users = await searchUserPublic(id);

            log(`users found are users=${users && users.length}`);

            return users;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

export default UserResolverPublic;
