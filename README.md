# Introduction

Your task is to implement the funtion `FriendsQueries#queryByNameMatching` per the requirements and make all tests pass.

# Setup

Follow these steps if you are using zip/git mode (i.e. not available inside Devskiller in-browser IDE):

1. `npm install` – install dependencies
2. `npm test` – run all tests once (this will be used to evaluate your solutions)
3. `npm run test:watch` - run all tests in _watch mode_ (optionally, you can use it locally if you prefer)

# Task

- you are provided with a `FriendsQueries` class which has missing implementation
- all necessary TypeScript types are already provided, use them
- while testing, the class instance will be passed various `fetchCurrentUser` functions via constructor. You will not have to create this function, only consume it to access the data. The details on how to use the `fetchCurrentUser` function are described in the _Input_ section below. 
- once you fetch the data via `fetchCurrentUser` function, your actual task begins - you need to process the results within `FriendsQueries#queryByNameMatching` method, the details are available in the _Requirements_ section below.
- at the end of the document, the _Example_ section demonstrates an example dataset with correct results. Read it carefully.

## Input

### `fetchCurrentUser`

`fetchCurrentUser` is a function which returns a `Promise`, either resolved or rejected. The resolved `Promise` contains user data in form of TypeScript `User` type:

```json
{
    "id": <string>,
    "friends": [
        { 
            "name": <string>, 
            "id": <string>
        },
    ]
}
```

Constraints regarding returned user:

* `friends` property can be missing or null

Constraints regarding every friend of returned user:

* `id` property can be any string (also empty `""`), can be missing or null
* `name` property can be any string (also empty `""`), can be missing or null

### `searchPhrase`

`searchPhrase` is a string used to find matching friends by their `name` property.

Constraints:

* `searchPhrase` **cannot** be undefined or null,
* `searchPhrase` **cannot** be empty,
* `searchPhrase` **cannot** contain any whitespace.

## Requirements

For current user `FriendsQueries#queryByNameMatching(searchPhrase)` should return an array of IDs of their friends with `name` matching the given search phrase. Array should also contain information about positions in names where the search phrase was found – it will be useful for operations further on like indicating in the UI the matching parts of names.

Resolved result array should contain matches in the form of TypeScript `QueryMatch` type: 

```json
{
    // ID of friend whose name matches phrase
    "friendId": <string>,
    // positions of phrase in words of friend's name
    // (only first position within each word should be included)
    "positions": [
        { 
            // index within a name where word starts
            "wordOffset": <integer>, 
            // index within a word where phrase starts
            "from": <integer>,
            // index within a word where phrase ends
            "to": <integer>
        },
    ]
}
```

### matching

1. A Friend's name matches the search phrase if the phrase can be found inside `name`. **Example**: name `John Smith` matches `J`, `John`, `mit`, `Smith`, `h` etc.

2. **Casing**. Letter case is irrelevant. **Example**: the name `John` matches `Jo`, `jo`, `jO` etc.

3. **Series of words**. A friend's name should be considered as a series of words, delimited by the start/end of the name and by any **internal whitespace** inside (regular space, tabulation etc.). **Example**: `Dr. John Smith` has words `Dr.`, `John` and `Smith`.

4. Every match position points to the location of the search phrase within a given **word** of a friend's name. There are `from` and `to` indicating start and end of phrase (counting from word's beginning) and `wordOffset` indicating at which index a word starts within the name. **Example**:
   * in the name `John Smith` there are two words: `John` has `wordOffset=0` and `Smith` has `wordOffset=5`. Think of the `wordOffset` as the offset (index) at which the words starts in the entire name 
   * `John` has no matches with phrase `mi`
   * `Smith` has a match with phrase `mi` that starts at `1` and ends at `3`. Taking `wordOffset` into account, the final result is: `{ wordOffset: 5, from: 1, to: 3 }`.

5. **One match per word**. Only the first match position within a given word should be included in the result, which means if the search phrase can be found more than once in a word, then only the first occurrence matters. **Example**: in the name `Ena Greenholten`, within the second word `Greenholten` there are two occurences of `en` -  first one gets into the result (`___en______`, `{ wordOffset: 4, from: 3, to: 5 }`), while the second one gets **ignored**: (`_________en`, `{ wordOffset: 4, from: 9, to: 11 }`)

6. **Check correctness**. Please note that you can use the `{ wordOffset: number, from: number, to: number }` to check correctness of your calculations. **It's not required, but it can help you**. Use `name.slice(wordOffset + from, wordOffset + to)`. **Example**:
   - name `Ena Greenholten`, when searching for `en` phrase will match with `{ wordOffset: 0, from: 0, to: 2 }` (first word) and `{ wordOffset: 4, from: 3, to: 5 }` (second word)
   - first word (`Ena`): `"Ena Greenholten".slice(0 + 0, 0 + 2)` -> `"En"`
   - second word (`Greenholten`): `"Ena Greenholten".slice(4 + 3, 4 + 5)` -> `"en"` (first occurence, second occurence is ignored)

### ordering

* Positions of the phrases for one matched friend should be ordered by their position within the whole name, which means that the position of a phrase within the first matching word should go first, then from the second matching word etc.

* Matches of a given friend should go first if `from` value of any of its match positions is lowest when comparing with other friends. In other words: if `smi` is used as a search phrase then `John Smith` should go first (phrase at index `0` of some word), then `Cosmith Johsmith` (phrase at index `2` of some word), and `John Johsmith` should go third (with phase at index `3` of some word).   

You must solve the following issue:
* The order of two matching friends if their first positions within words are the same. Lucky you!

### caching

Assuming you use same the instance of `FriendsQueries` for more than 1 `queryByNameMatching` call: 

* In the case of `fetchCurrentUser` resulting in a rejected promise the last known user data should be used instead …

* … unless no successfully fetched user data exists. In that case `queryByNameMatching` should output an empty array. 

### not-so-happy paths

* If a user has no friends, `queryByNameMatching` should resolve with empty array.
 
* If a friend's name doesn't match a given search phrase, `queryByNameMatching` should resolve with empty array.

* If a user or their friends are not defined, `queryByNameMatching` should resolve with an empty array.

* Friends with falsy `id` or `name` should be considered as non-matching.

## Example

Let's assume that user data returned in a resolved promise of `fetchCurrentUser` resembles the following …

```json
{
    id: "mrouk3",
    friends: [
        { name: "Yazmin Lindgren"     , id: "YazL"    },
        { name: "Queenie Ratke"       , id: "queen9"  },
        { name: "Joy Stanton"         , id: "joyJoy"  },
        { name: "Dr. Quentin Osinski" , id: "0sin5k1" },
        { name: "Maribel Pollich"     , id: "mariP"   },
        { name: "Ena Greenholten PhD" , id: "greena"  }
    ]
}
``` 

… then if we perform a query with the search phrase `En` …

```js
const friendsQueries = new FriendsQueries({ fetchCurrentUser });
friendsQueries.queryByNameMatching("En")
    .then(matches => {
        // …
    });
```

… returned `matches` will be

```json
[
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
]
```
