import { expect } from "bun:test";

import { Matrix, Vector2 } from "../../lib/utils";

const INPUTS = {
  example1: await Bun.file(
    Bun.resolveSync("./inputs/15.example1.txt", import.meta.dir)
  ).text(),
  example2: await Bun.file(
    Bun.resolveSync("./inputs/15.example2.txt", import.meta.dir)
  ).text(),
  real: await Bun.file(
    Bun.resolveSync("./inputs/15.txt", import.meta.dir)
  ).text(),
};

function play(input: ReturnType<typeof parseInput>) {
  const { moves, matrix } = input;

  let playerPos = matrix.entries().find(([_, value]) => value === "@")![0];
  matrix.delete(playerPos);

  for (const moveEntry of moves) {
    let delta = {
      "<": { x: -1, y: 0 },
      ">": { x: 1, y: 0 },
      "^": { x: 0, y: -1 },
      v: { x: 0, y: 1 },
    }[moveEntry]!;

    if (move(playerPos, delta)) {
      playerPos.x += delta.x;
      playerPos.y += delta.y;
    }
  }

  function move(p0: Vector2, delta: Vector2) {
    let canCommit = true;

    const rollbackQueue: (() => void)[] = [];

    function moveImpl(p0: Vector2, delta: Vector2) {
      const newPos = { x: p0.x + delta.x, y: p0.y + delta.y };
      const newPosVal = matrix.get(newPos);

      if (!newPosVal) {
        const v0 = matrix.get(p0);
        return {
          commit: () => {
            if (v0 !== undefined) {
              matrix.set(newPos, v0);
              matrix.delete(p0);
              rollbackQueue.unshift(() => {
                matrix.delete(newPos);
                matrix.set(p0, v0);
              });
            }
          },
        };
      } else if (newPosVal === "#") {
        canCommit = false;
        return false;
      } else {
        if (!canCommit) return false;

        const neighborCandidates =
          delta.x === 0
            ? [
                { x: newPos.x + 1, y: newPos.y },
                { x: newPos.x - 1, y: newPos.y },
              ]
            : [
                { x: newPos.x, y: newPos.y + 1 },
                { x: newPos.x, y: newPos.y - 1 },
              ];

        const neighbor = neighborCandidates.find(
          (p) => matrix.get(p) === newPosVal
        );

        const resA = moveImpl(newPos, delta);

        let resB: ReturnType<typeof moveImpl> | undefined;
        if (neighbor) {
          resB = moveImpl(neighbor, delta);
        }

        if (resA && resB !== false) {
          resA.commit();
          resB?.commit();
          return moveImpl(p0, delta);
        }
      }

      if (!canCommit) {
        for (const rollback of rollbackQueue) {
          rollback();
        }
      }

      return false;
    }

    return moveImpl(p0, delta);
  }

  const addedIds = new Set<string>();
  const sum = matrix.entries().reduce((sum, [_, val]) => {
    if (/\d+/.test(val) && !addedIds.has(val)) {
      addedIds.add(val);
      const [pos] = matrix
        .entries()
        .filter((x) => x[1] === val)
        .toArray()
        .sort(([p1], [p2]) => p1.x - p2.x)[0]!;
      return sum + 100 * pos.y + pos.x;
    } else {
      return sum;
    }
  }, 0);

  return sum;
}

const results = {
  part1: {
    example1: play(parseInput(INPUTS.example1, false)),
    example2: play(parseInput(INPUTS.example2, false)),
    real: play(parseInput(INPUTS.real, false)),
  },
  part2: {
    example2: play(parseInput(INPUTS.example2, true)),
    real: play(parseInput(INPUTS.real, true)),
  },
};

console.table(results);

expect(results.part1.example1).toBe(2028);
expect(results.part1.example2).toBe(10092);
expect(results.part1.real).toBe(1516281);
expect(results.part2.example2).toBe(9021);
expect(results.part2.real).toBe(1527969);

function parseInput(input: string, double?: boolean) {
  const matrix = new Matrix<string>();

  let _input = input.trim();

  if (double) {
    _input = _input
      .replaceAll("#", "##")
      .replaceAll("O", "[]")
      .replaceAll(".", "..")
      .replaceAll("@", "@.");
  }

  const rows = _input.split("\n");

  const i = rows.findLastIndex((row) => row === "");

  let nextBoxId = 0;

  for (const [y, row] of rows.slice(0, i).entries()) {
    const rowCells = row.trim().split("");
    for (const [x, content] of rowCells
      .entries()
      .filter((entry) => entry[1] !== "]")) {
      if (content === "O" || content === "[") {
        matrix.set({ x, y }, nextBoxId.toString());
        if (double) {
          matrix.set({ x: x + 1, y }, nextBoxId.toString());
        }
        nextBoxId++;
      } else if (content !== ".") {
        matrix.set({ x, y }, content);
      }
    }
  }
  const moves = rows
    .slice(i + 1)
    .map((row) => row.trim())
    .join("")
    .split("");
  return { matrix, moves };
}
