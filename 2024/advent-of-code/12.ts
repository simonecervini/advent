import { expect } from "bun:test";
import chalk from "chalk";

type Point = { x: number; y: number };
type PlantMap = Map<string, string>;

const INPUTS = {
  example: parseInput(
    await Bun.file(
      Bun.resolveSync("./inputs/12.example.txt", import.meta.dir)
    ).text()
  ),
  real: parseInput(
    await Bun.file(Bun.resolveSync("./inputs/12.txt", import.meta.dir)).text()
  ),
} satisfies Record<string, PlantMap>;

function getAnswer1(map: PlantMap) {
  const dataByRegion = new Map<string, { area: number; perimeter: number }>();
  const deltas = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ] as const;

  for (const [key, plant] of map) {
    const p = keyToPoint(key);
    if (!dataByRegion.has(plant)) {
      dataByRegion.set(plant, { area: 0, perimeter: 0 });
    }
    const dataEntry = dataByRegion.get(plant)!;
    dataEntry.area++;

    for (const [dx, dy] of deltas) {
      if (readMap(sum(p, { x: dx, y: dy }), map) !== plant) {
        dataEntry.perimeter++;
      }
    }
  }
  return dataByRegion
    .values()
    .reduce(
      (sum, regionData) => sum + regionData.area * regionData.perimeter,
      0
    );
}

function getAnswer2(map: PlantMap) {
  const dataByRegion = new Map<string, { area: number; angles: number }>();
  const deltas = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ] as const;

  for (const [key, plant] of map) {
    const p = keyToPoint(key);
    if (!dataByRegion.has(plant)) {
      dataByRegion.set(plant, { area: 0, angles: 0 });
    }
    const dataEntry = dataByRegion.get(plant)!;
    dataEntry.area++;

    for (const [dx, dy] of deltas) {
      if (
        readMap(sum(p, { x: dx }), map) !== plant &&
        readMap(sum(p, { y: dy }), map) !== plant
      ) {
        dataEntry.angles++;
      }
      if (
        readMap(sum(p, { x: dx }), map) === plant &&
        readMap(sum(p, { y: dy }), map) === plant &&
        readMap(sum(p, { x: dx, y: dy }), map) !== plant
      ) {
        dataEntry.angles++;
      }
    }
  }

  return dataByRegion
    .values()
    .reduce((sum, regionData) => sum + regionData.area * regionData.angles, 0);
}

const results = {
  answer1: {
    example: getAnswer1(INPUTS.example),
    real: getAnswer1(INPUTS.real),
  },
  answer2: {
    example: getAnswer2(INPUTS.example),
    real: getAnswer2(INPUTS.real),
  },
};

expect(results.answer1.example).toBe(1930);
expect(results.answer1.real).toBe(1486324);
expect(results.answer2.example).toBe(1206);
expect(results.answer2.real).toBe(898684);

console.table(results.answer1);
console.table(results.answer2);

// -- Core --

function parseInput(input: string): PlantMap {
  const inputMap: PlantMap = new Map();
  for (const [y, row] of input.trim().split("\n").entries()) {
    for (const [x, plant] of [...row.trim()].entries()) {
      inputMap.set(pointToKey({ x, y }), plant);
    }
  }
  const map: PlantMap = new Map();
  let index = 0;
  for (const [key, value] of inputMap.entries()) {
    const p = keyToPoint(key);
    index++;
    const navigator = createRegionNeighboursNavigator({
      expectedValue: value,
      map: inputMap,
    });
    for (const np of navigator(p)) {
      map.set(
        pointToKey(np),
        `${value}.${index.toString(36).toUpperCase().padStart(2, "0")}`
      );
    }
  }
  return map;
}

function createRegionNeighboursNavigator(opts: {
  expectedValue: string;
  map: PlantMap;
}) {
  const { expectedValue, map } = opts;
  const alreadyVisitedPoints = new Set<string>();
  return function* navigator(start: Point): Generator<Point> {
    const value = readMap(start, map);
    if (value !== expectedValue) return null;
    if (alreadyVisitedPoints.has(pointToKey(start))) return;
    alreadyVisitedPoints.add(pointToKey(start));
    yield start;
    yield* navigator(sum(start, { y: -1 }));
    yield* navigator(sum(start, { y: 1 }));
    yield* navigator(sum(start, { x: 1 }));
    yield* navigator(sum(start, { x: -1 }));
  };
}

// -- Utils --

function readMap(pos: string | Point, map: PlantMap) {
  return map.get(typeof pos === "string" ? pos : pointToKey(pos));
}

function printMap(map: PlantMap) {
  const matrix = Array.from({ length: Math.sqrt(map.size) }, () =>
    Array.from({ length: Math.sqrt(map.size) })
  );
  const colorByValue = new Map<string, number>();
  const uniqueValues = new Set(map.values());
  for (const [index, key] of [...uniqueValues].entries()) {
    colorByValue.set(key, Math.floor((index / uniqueValues.size) * 256));
  }
  for (const [k, v] of map.entries()) {
    const p = keyToPoint(k);
    matrix[p.y]![p.x] = chalk
      .bgAnsi256(colorByValue.get(v) ?? NaN)
      .ansi256(((colorByValue.get(v) ?? NaN) + 128) % 256)(v);
  }
  console.table(matrix);
}

function keyToPoint(key: string): Point {
  const [xStr, yStr] = key.split(",");
  const x = parseInt(xStr ?? "");
  const y = parseInt(yStr ?? "");
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError();
  return { x, y };
}

function pointToKey(point: Point): string {
  return `${point.x},${point.y}`;
}

function sum(...points: Partial<Point>[]): Point {
  return {
    x: points.reduce((x, p) => x + (p?.x ?? 0), 0),
    y: points.reduce((x, p) => x + (p?.y ?? 0), 0),
  };
}
