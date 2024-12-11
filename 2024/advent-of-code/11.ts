import { expect } from "bun:test";

function parseInput(input: string) {
  return input
    .trim()
    .split(" ")
    .map((s) => parseInt(s));
}

const exampleInput = "125 17";
const exampleValues = parseInput(exampleInput);

const input = "77 515 6779622 6 91370 959685 0 9861";
const values = parseInput(input);

const cache = new Map<string, number>();

function blink(values: number[], repeat: number): number {
  let sum = 0;
  for (const value of values) {
    sum += blinkValue(value, 1, repeat);
  }
  return sum;
}

function blinkValue(val: number, sum: number, repeat: number): number {
  if (repeat === 0) {
    return sum;
  }

  if (cache.has(`${val},${repeat}`)) {
    return cache.get(`${val},${repeat}`)!;
  }

  let result: number;

  if (val === 0) {
    result = blinkValue(1, sum, repeat - 1);
  } else if (val.toString().length % 2 === 0) {
    const str = val.toString();
    const halfLength = str.length / 2;
    const leftHalfValue = parseInt(str.slice(0, halfLength));
    const rightHalfValue = parseInt(str.slice(halfLength));
    result =
      blinkValue(leftHalfValue, sum, repeat - 1) +
      blinkValue(rightHalfValue, sum, repeat - 1);
  } else {
    result = blinkValue(val * 2024, sum, repeat - 1);
  }

  cache.set(`${val},${repeat}`, result);
  return result;
}

expect(blink(exampleValues, 6)).toBe(22);
expect(blink(exampleValues, 25)).toBe(55312);

const answer1 = blink(values, 25);
const answer2 = blink(values, 75);

expect(answer1).toBe(187738);
expect(answer2).toBe(223767210249237);

console.table({ answer1, answer2 });
