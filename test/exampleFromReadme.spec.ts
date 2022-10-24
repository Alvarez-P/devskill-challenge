import { FriendsQueries, User } from "../src";

describe('FriendsQueries', () => {
  describe("example from README", () => {

    it("should find matches", async () => {
      // given
      const user: User = {
        id: "mrouk3",
        friends: [
          { name: "Yazmin Lindgren", id: "YazL" },
          { name: "Queenie Ratke", id: "queen9" },
          { name: "Joy Stanton", id: "joyJoy" },
          { name: "Dr. Quentin Osinski", id: "0sin5k1" },
          { name: "Maribel Pollich", id: "mariP" },
          { name: "Ena Greenholten PhD", id: "greena" },
        ],
      };
      const searchPhrase = "En";

      // when
      const matches = await new FriendsQueries({
        fetchCurrentUser: () => Promise.resolve(user),
      }).queryByNameMatching(searchPhrase);

      // then
      expect(matches).toEqual([
        {
          friendId: "greena", // "Ena Greenholten PhD"
          positions: [
            { wordOffset: 0, from: 0, to: 2 }, // "En_ ___________ ___"
            { wordOffset: 4, from: 3, to: 5 }, // "___ ___en______ ___"
            // the second occurence of "En" in word "Greenholten" is ignored, see _matching_ section
          ],
        },
        {
          friendId: "0sin5k1", // "Dr. Quentin Osinski"
          positions: [
            { wordOffset: 4, from: 2, to: 4 }, // "___ __en___ _______"
          ],
        },
        {
          friendId: "queen9", // "Queenie Ratke"
          positions: [
            { wordOffset: 0, from: 3, to: 5 }, // "___en__ _____"
          ],
        },
        {
          friendId: "YazL", // "Yazmin Lindgren"
          positions: [
            { wordOffset: 7, from: 6, to: 8 }, // "______ ______en"
          ],
        },
      ]);
    });

  });
});
