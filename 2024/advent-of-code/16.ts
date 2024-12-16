import { Matrix, Vector2 } from "../../lib/utils";
import { expect } from "bun:test";

const DIRECTIONS = ["n", "e", "s", "w"] as const;

type Direction = (typeof DIRECTIONS)[number];

const DX: Record<Direction, number> = {
  n: 0,
  e: 1,
  s: 0,
  w: -1,
};

const DY: Record<Direction, number> = {
  n: -1,
  e: 0,
  s: 1,
  w: 0,
};

type Node = {
  x: number;
  y: number;
  direction: Direction;
};

const INPUTS = {
  example1: await Bun.file(
    Bun.resolveSync("./inputs/16.example1.txt", import.meta.dir)
  ).text(),
  example2: await Bun.file(
    Bun.resolveSync("./inputs/16.example2.txt", import.meta.dir)
  ).text(),
  real: await Bun.file(
    Bun.resolveSync("./inputs/16.txt", import.meta.dir)
  ).text(),
};

const answers = {
  part1: {
    example1: optimizeCost(parseInput(INPUTS.example1)),
    example2: optimizeCost(parseInput(INPUTS.example2)),
    real: optimizeCost(parseInput(INPUTS.real)),
  },
};

expect(answers.part1.example1).toBe(7036);
expect(answers.part1.example2).toBe(11048);
expect(answers.part1.real).toBe(88416);

console.table(answers);

function optimizeCost(opts: {
  start: Vector2;
  end: Vector2;
  grid: Matrix<string>;
}) {
  const { start, end, grid } = opts;

  const queue: Array<{ node: Node; cost: number }> = [];
  queue.push({ node: { ...start, direction: "e" }, cost: 0 });

  const visitedNodes = new Map<string, number>();

  function enqueue(item: (typeof queue)[number]) {
    queue.push(item);
    queue.sort((a, b) => a.cost - b.cost);
  }

  while (queue.length) {
    const item = queue.shift()!;

    const key = `${item.node.x},${item.node.y},${item.node.direction}`;
    if (visitedNodes.get(key) ?? -Infinity >= item.cost) {
      continue;
    }
    visitedNodes.set(key, item.cost);

    const nextPos = {
      x: item.node.x + DX[item.node.direction],
      y: item.node.y + DY[item.node.direction],
    };

    if (nextPos.x === end.x && nextPos.y === end.y) {
      return item.cost + 1;
    }

    if (grid.get(nextPos) === ".") {
      enqueue({
        node: {
          x: nextPos.x,
          y: nextPos.y,
          direction: item.node.direction,
        },
        cost: item.cost + 1,
      });
    }

    enqueue({
      node: {
        ...item.node,
        direction:
          DIRECTIONS[(DIRECTIONS.indexOf(item.node.direction) + 1) % 4]!,
      },
      cost: item.cost + 1000,
    });

    enqueue({
      node: {
        ...item.node,
        direction:
          DIRECTIONS[(DIRECTIONS.indexOf(item.node.direction) + 3) % 4]!,
      },
      cost: item.cost + 1000,
    });
  }

  throw new Error();
}

function parseInput(input: string) {
  const matrix = new Matrix<string>();
  const rows = input.trim().split("\n");

  let start: Vector2 | undefined = undefined;
  let end: Vector2 | undefined = undefined;
  for (const [y, row] of rows.entries()) {
    const cells = row.trim().split("");
    for (const [x, cell] of cells.entries()) {
      if (cell === "S") {
        start = { x, y };
      } else if (cell === "E") {
        end = { x, y };
      } else {
        matrix.set({ x, y }, cell);
      }
    }
  }

  if (!start || !end) {
    throw new Error();
  }

  return { start, end, grid: matrix };
}
