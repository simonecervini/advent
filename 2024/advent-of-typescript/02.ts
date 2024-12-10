type Demand = 900_000;

// -- Tests --

import type { Expect, Equal } from "type-testing";

type t0_actual = Demand; // =>
type t0_expected = 900_000; // =>
type t0 = Expect<Equal<t0_actual, t0_expected>>;

/*
 * Sometimes, throughout Advent of TypeScript, you'll see a test that asserts there _is_ a type error, often to ensure that you're providing a correct implementation.
 * In this example, passing `number` isn't good enough, so we're highlighting that to you by showing that would cause a type error if `number` is the value of `Demand`.
 */

// @ts-expect-error
type e0 = Expect<Equal<Demand, number>>;
