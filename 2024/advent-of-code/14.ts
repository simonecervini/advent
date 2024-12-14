import { expect } from "bun:test";

type Vector2 = {
  x: number;
  y: number;
};

type Robot = {
  id: string;
  p: Vector2;
  v: Vector2;
};

const INPUTS = {
  example: await Bun.file(
    Bun.resolveSync("./inputs/14.example.txt", import.meta.dir)
  ).text(),
  real: await Bun.file(
    Bun.resolveSync("./inputs/14.txt", import.meta.dir)
  ).text(),
};

function moveRobots(opts: {
  robots: Robot[];
  size: Vector2;
  times: number;
  onMove?: (
    map: Map<string, Set<string>>,
    index: number,
    stop: () => void
  ) => void;
}) {
  const { robots, size, times, onMove } = opts;

  const map = new Map<string, Set<string>>();
  for (let i = 0; i < size.x; i++) {
    for (let j = 0; j < size.y; j++) {
      map.set(`${i},${j}`, new Set());
    }
  }

  let stop = false;
  for (let i = 0; i < times && !stop; i++) {
    for (const robot of robots) {
      const current = map
        .entries()
        .find(([_, robotIds]) => robotIds.has(robot.id));

      const currentPos: Vector2 = current
        ? stringToVector(current[0])
        : robot.p;
      const newPos: Vector2 = {
        x: limit(currentPos.x + robot.v.x, size.x),
        y: limit(currentPos.y + robot.v.y, size.y),
      };

      if (current) {
        map.get(current[0])?.delete(robot.id);
      }

      const mapKey = vectorToString(newPos);
      const ids = map.get(mapKey) ?? new Set();
      ids.add(robot.id);
      map.set(mapKey, ids);
    }
    onMove?.(map, i, () => {
      stop = true;
    });
  }
  return map;
}

function getAnswer1(opts: {
  robots: Robot[];
  size: Vector2;
  duration: number;
}) {
  const { robots, size, duration } = opts;

  const map = moveRobots({ robots, size, times: duration });

  const halfX = Math.floor(size.x / 2);
  const halfY = Math.floor(size.y / 2);

  const countQ1 = map
    .entries()
    .filter(([key]) => {
      const p = stringToVector(key);
      return p.x < halfX && p.y < halfY;
    })
    .reduce((sum, [_, robotIds]) => sum + robotIds.size, 0);
  const countQ2 = map
    .entries()
    .filter(([key]) => {
      const p = stringToVector(key);
      return p.x > halfX && p.y < halfY;
    })
    .reduce((sum, [_, robotIds]) => sum + robotIds.size, 0);
  const countQ3 = map
    .entries()
    .filter(([key]) => {
      const p = stringToVector(key);
      return p.x < halfX && p.y > halfY;
    })
    .reduce((sum, [_, robotIds]) => sum + robotIds.size, 0);
  const countQ4 = map
    .entries()
    .filter(([key]) => {
      const p = stringToVector(key);
      return p.x > halfX && p.y > halfY;
    })
    .reduce((sum, [_, robotIds]) => sum + robotIds.size, 0);

  const safetyScore = countQ1 * countQ2 * countQ3 * countQ4;

  return safetyScore;
}

function getAnswer2(opts: { robots: Robot[]; size: Vector2 }) {
  const { robots, size } = opts;

  let index = NaN;

  moveRobots({
    robots,
    size,
    times: Infinity,
    onMove: (map, i, stop) => {
      const str = printMap(map, size.x, size.y, true);
      if (str.includes("11111111")) {
        index = i;
        console.log(str);
        stop();
      }
    },
  });

  return index + 1;
}

const answer1 = {
  example: getAnswer1({
    robots: parseInput(INPUTS.example),
    size: { x: 11, y: 7 },
    duration: 100,
  }),
  real: getAnswer1({
    robots: parseInput(INPUTS.real),
    size: { x: 101, y: 103 },
    duration: 100,
  }),
};

console.log({ answer1 });

expect(answer1.example).toBe(12);
expect(answer1.real).toBe(232253028);

const answer2 = getAnswer2({
  robots: parseInput(INPUTS.real),
  size: { x: 101, y: 103 },
});
console.log({ answer2 });

// -- Utils --

function parseInput(input: string) {
  const numbers = input
    .matchAll(/(-{0,1}\d)+/gm)
    .map(([num]) => parseInt(num))
    .toArray();
  const robots: Robot[] = [];
  if (numbers.length % 4 !== 0) throw new Error();
  for (let i = 0; i < numbers.length; i += 4) {
    robots.push({
      id: i.toString(),
      p: { x: numbers[i]!, y: numbers[i + 1]! },
      v: { x: numbers[i + 2]!, y: numbers[i + 3]! },
    });
  }
  return robots;
}

function printMap(
  map: Map<string, Set<unknown>>,
  sizeX: number,
  sizeY: number,
  noEmit?: boolean
) {
  const arr = Array.from({ length: sizeY }, () => Array(sizeX).fill("."));

  for (const [key, robotIds] of map.entries()) {
    const p = stringToVector(key);
    arr[p.y]![p.x] = robotIds.size > 0 ? robotIds.size : ".";
  }

  let output = "";
  for (const row of arr) {
    output +=
      row.map((cell) => (cell === "." ? cell : cell.toString())).join("") +
      "\n";
  }

  if (!noEmit) {
    console.log(output);
  }

  return output;
}

function vectorToString(p: Vector2) {
  return [p.x, p.y].join(",");
}

function stringToVector(s: string) {
  const [xStr, yStr] = s.split(",");
  return {
    x: parseInt(xStr ?? ""),
    y: parseInt(yStr ?? ""),
  };
}

function limit(val: number, max: number) {
  if (val < 0) {
    return Math.abs(max + val) % max;
  }
  return val % max;
}
