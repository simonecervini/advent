type Repeat<
  Char extends string,
  Length extends number,
  TList extends string[] = [],
> = TList["length"] extends Length
  ? TList
  : Repeat<Char, Length, [...TList, Char]>;

type Rebuild<
  TList extends number[],
  TAcc extends any[] = [],
  TIndex extends number = 1,
> = TList extends [infer First extends number, ...infer Others extends number[]]
  ? Rebuild<
      Others,
      [
        ...TAcc,
        ...Repeat<
          TIndex extends 1
            ? "🛹"
            : TIndex extends 2
              ? "🚲"
              : TIndex extends 3
                ? "🛴"
                : TIndex extends 4
                  ? "🏄"
                  : never,
          First
        >,
      ],
      TIndex extends 1
        ? 2
        : TIndex extends 2
          ? 3
          : TIndex extends 3
            ? 4
            : TIndex extends 4
              ? 1
              : never
    >
  : TAcc;

// -- Tests --

import { Expect, Equal } from "type-testing";

type test_0_actual = Rebuild<[2, 1, 3, 3, 1, 1, 2]>;
//   ^?
type test_0_expected = [
  "🛹",
  "🛹",
  "🚲",
  "🛴",
  "🛴",
  "🛴",
  "🏄",
  "🏄",
  "🏄",
  "🛹",
  "🚲",
  "🛴",
  "🛴",
];
type test_0 = Expect<Equal<test_0_expected, test_0_actual>>;

type test_1_actual = Rebuild<[3, 3, 2, 1, 2, 1, 2]>;
//   ^?
type test_1_expected = [
  "🛹",
  "🛹",
  "🛹",
  "🚲",
  "🚲",
  "🚲",
  "🛴",
  "🛴",
  "🏄",
  "🛹",
  "🛹",
  "🚲",
  "🛴",
  "🛴",
];
type test_1 = Expect<Equal<test_1_expected, test_1_actual>>;

type test_2_actual = Rebuild<[2, 3, 3, 5, 1, 1, 2]>;
//   ^?
type test_2_expected = [
  "🛹",
  "🛹",
  "🚲",
  "🚲",
  "🚲",
  "🛴",
  "🛴",
  "🛴",
  "🏄",
  "🏄",
  "🏄",
  "🏄",
  "🏄",
  "🛹",
  "🚲",
  "🛴",
  "🛴",
];
type test_2 = Expect<Equal<test_2_expected, test_2_actual>>;
