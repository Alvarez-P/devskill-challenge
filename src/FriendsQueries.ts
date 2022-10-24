import { User, QueryMatch } from './types'

class FriendsQueries {

    private fetchCurrentUser: () => Promise<User>
    
    constructor({ fetchCurrentUser }) {
        this.fetchCurrentUser = fetchCurrentUser;
    }

    queryByNameMatching(searchPhrase: string): Promise<QueryMatch[]> {
        return Promise.resolve([]);
    }

}

export { FriendsQueries };
