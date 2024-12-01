type FindIndex<
  TArray extends any[],
  TIndex = TArray["length"],
> = TArray extends [...infer Rest, infer U]
  ? TIndex extends 0
    ? -1
    : U extends "🎅🏼"
      ? Rest["length"]
      : FindIndex<Rest, Rest["length"]>
  : -1;

type FindSanta<
  TArray extends string[][],
  I = TArray["length"],
> = TArray extends [...infer Rest, infer U]
  ? U extends string[]
    ? Rest extends string[][]
      ? FindIndex<U> extends -1
        ? I extends 0
          ? -1
          : FindSanta<Rest>
        : [Rest["length"], FindIndex<U>]
      : -1
    : -1
  : -1;

// -- Tests --

import { Expect, Equal } from "type-testing";

type Forest0 = [
  ["🎅🏼", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
];
type test_0_actual = FindSanta<Forest0>;
//   ^?
type test_0_expected = [0, 0];
type test_0 = Expect<Equal<test_0_expected, test_0_actual>>;

type Forest1 = [
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎅🏼", "🎄", "🎄"],
];
type test_1_actual = FindSanta<Forest1>;
//   ^?
type test_1_expected = [3, 1];
type test_1 = Expect<Equal<test_1_expected, test_1_actual>>;

type Forest2 = [
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎅🏼", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
];
type test_2_actual = FindSanta<Forest2>;
//   ^?
type test_2_expected = [2, 2];
type test_2 = Expect<Equal<test_2_expected, test_2_actual>>;

type Forest3 = [
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎅🏼", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
];
type test_3_actual = FindSanta<Forest3>;
//   ^?
type test_3_expected = [2, 1];
type test_3 = Expect<Equal<test_3_expected, test_3_actual>>;

type Forest4 = [
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎅🏼", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
];
type test_4_actual = FindSanta<Forest4>;
//   ^?
type test_4_expected = [1, 2];
type test_4 = Expect<Equal<test_4_expected, test_4_actual>>;
