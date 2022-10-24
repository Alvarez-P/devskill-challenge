import { User, QueryMatch } from "../src";

export const resolved = <T>(value: T) => Promise.resolve(value);
export const rejected = (error) => Promise.reject(error);



type FetchFunctionWithMock = {
  (): Promise<User> // standard type of `fetchCurrentUser`
  willReturn: <T>(p: Promise<T>) => void // additional function that enables mocking the result
}

/**
 * Creates a disposable (one-time) fetchCurrentUser function.
 * Its `willReturn(promise)` method should be called to mock the result to be used inside tests.
 */
export const createMockFunction = () => {
  let mockedUserPromise: Promise<User>;
  const fetchCurrentUser = (() => mockedUserPromise) as FetchFunctionWithMock;
  fetchCurrentUser.willReturn = (userPromise) => {
    mockedUserPromise = userPromise;
  };
  return fetchCurrentUser;
}



export const createUserDataset = (overrides: Partial<User>): User => {
  const defaults: User = {
    id: "any-user-id",
    friends: [
      { id: "id1", name: "any-friend-1-id" },
      { id: "id2", name: "any-friend-2-id" },
    ],
  };
  return Object.assign({}, defaults, overrides);
};

export const friendIdsOf = (matches: QueryMatch[]) =>
  matches.map(match => match.friendId);
