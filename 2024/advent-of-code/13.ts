import { expect } from "bun:test";

type Point = { x: number; y: number };

type Machine = {
  target: Point;
  controls: {
    a: Point;
    b: Point;
  };
};

const INPUTS = {
  example: await Bun.file(
    Bun.resolveSync("./inputs/13.example.txt", import.meta.dir)
  ).text(),
  real: await Bun.file(
    Bun.resolveSync("./inputs/13.txt", import.meta.dir)
  ).text(),
};

function getAnswer1(machines: Machine[]) {
  let totalPrice = 0;
  for (const machine of machines) {
    const bestPrice = findBestPrice(machine);
    if (Number.isFinite(bestPrice)) {
      totalPrice += bestPrice;
    }
  }
  return totalPrice;
}

function getAnswer2(machines: Machine[]) {
  let totalPrice = 0;
  for (const machine of machines) {
    machine.target.x += 10000000000000;
    machine.target.y += 10000000000000;
    const bestPrice = findBestPrice(machine);
    if (Number.isFinite(bestPrice)) {
      totalPrice += bestPrice;
    }
  }
  return totalPrice;
}

const answer1 = {
  example: getAnswer1(parseInput(INPUTS.example)),
  real: getAnswer1(parseInput(INPUTS.real)),
};

const answer2 = {
  example: getAnswer2(parseInput(INPUTS.example)),
  real: getAnswer2(parseInput(INPUTS.real)),
};

expect(answer1.example).toBe(480);
expect(answer1.real).toBe(33921);
expect(answer2.real).toBe(82261957837868);

console.table(answer1);
console.table(answer2);

function findBestPrice(machine: Machine) {
  const detA = det(
    machine.controls.a.x,
    machine.controls.a.y,
    machine.controls.b.x,
    machine.controls.b.y
  );

  if (detA === 0) {
    return Infinity;
  }

  const alpha =
    det(
      machine.target.x,
      machine.controls.b.x,
      machine.target.y,
      machine.controls.b.y
    ) / detA;

  const beta =
    det(
      machine.controls.a.x,
      machine.target.x,
      machine.controls.a.y,
      machine.target.y
    ) / detA;

  if (!Number.isInteger(alpha) || !Number.isInteger(beta)) {
    return Infinity;
  }

  return 3 * alpha + beta;
}

function det(a: number, b: number, c: number, d: number) {
  return a * d - b * c;
}

function parseInput(input: string) {
  const machines: Machine[] = [];
  const rows = input
    .trim()
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x);
  if (rows.length % 3 !== 0) throw new Error();

  function parseNumbers(str: string) {
    return str
      .matchAll(/\d+/g)
      .map((x) => {
        const n = parseInt(x[0]);
        if (!Number.isFinite(n)) throw new TypeError();
        return n;
      })
      .toArray();
  }

  for (let i = 0; i < rows.length; i += 3) {
    const [ax, ay] = parseNumbers(rows[i]!);
    const [bx, by] = parseNumbers(rows[i + 1]!);
    const [tx, ty] = parseNumbers(rows[i + 2]!);
    machines.push({
      target: {
        x: tx!,
        y: ty!,
      },
      controls: {
        a: { x: ax!, y: ay! },
        b: { x: bx!, y: by! },
      },
    });
  }
  return machines;
}
