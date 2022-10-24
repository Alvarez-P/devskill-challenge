import { FriendsQueries } from "../src";
import { resolved, rejected, createUserDataset, friendIdsOf, createMockFunction } from './test-utils';

describe('FriendsQueries', () => {

    let friendsQueries: FriendsQueries;
    let fetchCurrentUser: ReturnType<typeof createMockFunction>;

    beforeEach(() => {
        fetchCurrentUser = createMockFunction();
        friendsQueries = new FriendsQueries({ fetchCurrentUser });
    });

    describe("matching friends", () => {

        it("should find no friends if current user has no friends", async () => {
            // given
            const userWithoutFriends = createUserDataset({
                friends: [],
            });
            fetchCurrentUser.willReturn(resolved(userWithoutFriends));

            // when
            const matches = await friendsQueries.queryByNameMatching("any");

            // then
            expect(friendIdsOf(matches)).toEqual([]);
        });

        it("should find friend whose name includes search phrase", async () => {
            // given
            const user = createUserDataset({
                friends: [
                    { id: "greg", name: "Greg Gregowsky" },
                    { id: "anna", name: "Anna Ann" },
                ],
            });
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const matches = await friendsQueries.queryByNameMatching("nna");

            // then
            expect(friendIdsOf(matches)).toEqual([
                "anna",
            ]);
        });

    });

    describe("match positions", () => {

        it("should include position within single word name", async () => {
            // given
            const user = createUserDataset({
                friends: [
                    { id: "friend1", name: "xxx" },
                    { id: "friend2", name: "___xxx___" },
                ],
            });
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const matches = await friendsQueries.queryByNameMatching("xxx");

            // then
            expect(matches).toContain({
                friendId: "friend1",
                positions: [{
                    wordOffset: 0,
                    from: 0,
                    to: 3,
                }],
            });
            expect(matches).toContain({
                friendId: "friend2",
                positions: [{
                    wordOffset: 0,
                    from: 3,
                    to: 6,
                }],
            });
        });

        it("should calculate positions from each name's word in relation to word's beginning", async () => {
            // given
            const user = createUserDataset({
                friends: [
                    { id: "friend1", name: "x__ _x_ __x" },
                ],
            });
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const matches = await friendsQueries.queryByNameMatching("x");

            // then
            expect(matches[0].positions.length).toEqual(3);
            expect(matches[0].positions).toContain({
                wordOffset: 0, from: 0, to: 1,
            });
            expect(matches[0].positions).toContain({
                wordOffset: 4, from: 1, to: 2,
            });
            expect(matches[0].positions).toContain({
                wordOffset: 8, from: 2, to: 3,
            });
        });

        it("should order positions by their place in whole name", async () => {
            // given
            const user = createUserDataset({
                friends: [
                    { id: "friend1", name: "__x x__ _x_" },
                ],
            });
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const matches = await friendsQueries.queryByNameMatching("x");

            // then
            expect(matches[0].positions).toEqual([
                { wordOffset: 0, from: 2, to: 3 },
                { wordOffset: 4, from: 0, to: 1 },
                { wordOffset: 8, from: 1, to: 2 },
            ]);
        });

    });

    describe("matches' order", () => {

        it("should prioritize by lowest position of friends' name (single-world names)", async () => {
            // given
            const user = createUserDataset({
                friends: [
                    { id: "friend1", name: "abc__" },
                    { id: "friend2", name: "__abc" },
                    { id: "friend3", name: "_abc_" },
                ],
            });
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const matches = await friendsQueries.queryByNameMatching("abc");

            // then
            expect(friendIdsOf(matches)).toEqual([
                "friend1",
                "friend3",
                "friend2",
            ]);
        });

    });

    describe("fetch failure", () => {

        it("if possible should use previously fetched user if current user fetch failed", async () => {
            // given
            const user = createUserDataset({
                friends: [
                    { id: "greg1", name: "Greg" },
                    { id: "anna2", name: "Anna" },
                ],
            });
            fetchCurrentUser.willReturn(resolved(user));
            await friendsQueries.queryByNameMatching("anna");

            // when
            fetchCurrentUser.willReturn(rejected(user));
            const matches = await friendsQueries.queryByNameMatching("anna");

            // then
            expect(friendIdsOf(matches)).toEqual([
                "anna2",
            ]);
        });

    });

    describe("invalid data", () => {

        it("should find no friends if current user is undefined", async () => {
            // given
            const user = undefined;
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const matches = await friendsQueries.queryByNameMatching("any");

            // then
            expect(friendIdsOf(matches)).toEqual([]);
        });

        it("should filter out friends without name (undefined)", async () => {
            // given
            const user = createUserDataset({
                friends: [
                    { id: "friendWithName", name: "Friend With Name" },
                    { id: "friendWithoutName", name: undefined },
                ],
            });
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const matches = await friendsQueries.queryByNameMatching("Friend");

            // then
            expect(friendIdsOf(matches)).toEqual([
                "friendWithName",
            ]);
        });

    });
});