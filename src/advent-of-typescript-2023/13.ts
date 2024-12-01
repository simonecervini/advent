type LinRange<
  TFirst extends number,
  TLast extends number,
  TAcc extends Array<number> = [],
> = TAcc["length"] extends TLast
  ? TAcc[number]
  : LinRange<TFirst, TLast, [...TAcc, TAcc["length"]]>;

type DayCounter<TFirst extends number, TLast extends number> =
  | Exclude<LinRange<0, TLast>, LinRange<0, TFirst>>
  | TLast;

// -- Tests --

import { Expect, Equal } from "type-testing";

type TwelveDaysOfChristmas = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type test_0_actual = DayCounter<1, 12>;
//   ^?
type test_0_expected = TwelveDaysOfChristmas;
type test_0 = Expect<Equal<test_0_expected, test_0_actual>>;

type DaysUntilChristmas =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25;
type test_1_actual = DayCounter<1, 25>;
//   ^?
type test_1_expected = DaysUntilChristmas;
type test_1 = Expect<Equal<test_1_expected, test_1_actual>>;
