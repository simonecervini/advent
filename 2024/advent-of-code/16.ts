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

const results = {
  example1: optimizeCost(parseInput(INPUTS.example1)),
  example2: optimizeCost(parseInput(INPUTS.example2)),
  real: optimizeCost(parseInput(INPUTS.real)),
};

expect(results.example1.answer1).toBe(7036);
expect(results.example2.answer1).toBe(11048);
expect(results.real.answer1).toBe(88416);
expect(results.example1.answer2).toBe(45);
expect(results.example2.answer2).toBe(64);
expect(results.real.answer2).toBe(442);

console.table(results);

function optimizeCost(opts: {
  start: Vector2;
  end: Vector2;
  grid: Matrix<string>;
}) {
  const { start, end, grid } = opts;

  const queue: Array<{ node: Node; cost: number; path: Node[] }> = [];
  queue.push({
    node: { ...start, direction: "e" },
    cost: 0,
    path: [{ ...start, direction: "e" }],
  });

  const visitedNodes = new Map<string, number>();

  let bestPaths: Node[][] = [];
  let bestCost = Infinity;

  while (queue.length) {
    const item = queue.shift()!;

    const key = `${item.node.x},${item.node.y},${item.node.direction}`;
    if (item.cost > (visitedNodes.get(key) ?? Infinity)) {
      continue;
    }
    visitedNodes.set(key, item.cost);

    const nextPos = {
      x: item.node.x + DX[item.node.direction],
      y: item.node.y + DY[item.node.direction],
    };

    if (nextPos.x === end.x && nextPos.y === end.y) {
      const finalCost = item.cost + 1;
      const finalPath = [
        ...item.path,
        { ...nextPos, direction: item.node.direction },
      ];
      if (finalCost < bestCost) {
        bestPaths = [finalPath];
        bestCost = finalCost;
      } else if (finalCost === bestCost) {
        bestPaths.push(finalPath);
      }

      continue;
    }

    if (grid.get(nextPos) === ".") {
      const nextNode = {
        x: nextPos.x,
        y: nextPos.y,
        direction: item.node.direction,
      };
      queue.push({
        node: nextNode,
        cost: item.cost + 1,
        path: [...item.path, nextNode],
      });
    }

    const nextCwNode = {
      ...item.node,
      direction: DIRECTIONS[(DIRECTIONS.indexOf(item.node.direction) + 1) % 4]!,
    };
    queue.push({
      node: nextCwNode,
      cost: item.cost + 1000,
      path: [...item.path, nextCwNode],
    });

    const nextCcwNode = {
      ...item.node,
      direction: DIRECTIONS[(DIRECTIONS.indexOf(item.node.direction) + 3) % 4]!,
    };
    queue.push({
      node: nextCcwNode,
      cost: item.cost + 1000,
      path: [...item.path, nextCcwNode],
    });

    queue.sort((a, b) => a.cost - b.cost);
  }

  if (bestPaths.length === 0) {
    throw new Error("No path found");
  }

  return {
    answer1: bestCost,
    answer2: new Set(
      bestPaths.flatMap((path) => path.map((node) => `${node.x},${node.y}`))
    ).size,
  };
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
