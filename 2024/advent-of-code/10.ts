import { expect } from "bun:test";

const input = (
  await Bun.file(Bun.resolveSync("./inputs/10.txt", import.meta.dir)).text()
).trim();

const exampleInput = `
89010123
78121874
87430965
96549874
45678903
32019012
01329801
10456732`;

type Matrix = Map<string, number>;

function parseInput(input: string): Matrix {
  const matrix: Matrix = new Map();
  for (const [y, row] of input.trim().split("\n").entries()) {
    for (const [x, value] of [...row.trim()].entries()) {
      matrix.set(`${x},${y}`, parseInt(value));
    }
  }
  return matrix;
}

const matrix = parseInput(input);
const exampleMatrix = parseInput(exampleInput);

type Point = { x: number; y: number };

type QuadTreeNode =
  | {
      _value: number;
      _pos: Point;
      n: QuadTreeNode;
      e: QuadTreeNode;
      s: QuadTreeNode;
      w: QuadTreeNode;
    }
  | {
      _value: number | null;
      _pos: Point;
    }
  | null;

function readMatrix(matrix: Matrix, p: Point) {
  const key = `${p.x},${p.y}`;
  const value = matrix.get(key);
  if (value === undefined) throw new TypeError("Undefined value");
  return value;
}
function buildQuadTree(matrix: Matrix, p: Point): QuadTreeNode {
  const withinBounds = (i: number) => i >= 0 && i < Math.sqrt(matrix.size);

  const curr = readMatrix(matrix, p);

  const n = withinBounds(p.y - 1)
    ? readMatrix(matrix, { ...p, y: p.y - 1 }) - curr === 1
      ? buildQuadTree(matrix, { ...p, y: p.y - 1 })
      : { _value: curr, _pos: p }
    : { _value: null, _pos: p };
  const e = withinBounds(p.x + 1)
    ? readMatrix(matrix, { ...p, x: p.x + 1 }) - curr === 1
      ? buildQuadTree(matrix, { ...p, x: p.x + 1 })
      : { _value: curr, _pos: p }
    : { _value: null, _pos: p };
  const s = withinBounds(p.y + 1)
    ? readMatrix(matrix, { ...p, y: p.y + 1 }) - curr === 1
      ? buildQuadTree(matrix, { ...p, y: p.y + 1 })
      : { _value: curr, _pos: p }
    : { _value: null, _pos: p };
  const w = withinBounds(p.x - 1)
    ? readMatrix(matrix, { ...p, x: p.x - 1 }) - curr === 1
      ? buildQuadTree(matrix, { ...p, x: p.x - 1 })
      : { _value: curr, _pos: p }
    : { _value: null, _pos: p };
  return curr === 9
    ? { _value: 9, _pos: p }
    : { _value: curr, _pos: p, n, e, s, w };
}

function isLeafNode(node: QuadTreeNode) {
  if (node === null) return true;
  return ["n" in node, "e" in node, "s" in node, "w" in node].every(
    (x) => x === false
  );
}

function flatMapTree(
  rootNode: QuadTreeNode,
  fn: (node: QuadTreeNode) => unknown
): unknown[] {
  if (rootNode === null || isLeafNode(rootNode)) {
    return [fn(rootNode)];
  }

  return (["n", "e", "s", "w"] as const).flatMap((x) => {
    if (x in rootNode) {
      // @ts-expect-error - trust me
      const node: QuadTreeNode = rootNode[x];
      return isLeafNode(node) ? fn(node) : flatMapTree(node, fn);
    } else {
      return [];
    }
  });
}

function getAnswers(matrix: Matrix) {
  let answer1 = 0;
  let answer2 = 0;

  for (const [key, value] of matrix.entries()) {
    if (value === 0) {
      const [xStr, yStr] = key.split(",");
      const x = parseInt(xStr ?? "");
      const y = parseInt(yStr ?? "");

      const quadTree = buildQuadTree(matrix, { x, y });

      const coords = flatMapTree(quadTree, (node) =>
        node?._value === 9 ? `${node._pos.x},${node._pos.y}` : []
      ) as string[];

      const score = new Set(coords).size;
      const rating = coords.length;

      answer1 += score;
      answer2 += rating;
    }
  }

  return { answer1, answer2 };
}

const exampleAnswers = getAnswers(exampleMatrix);
expect(exampleAnswers.answer1).toBe(36);
expect(exampleAnswers.answer2).toBe(81);

const answers = getAnswers(matrix);
expect(answers.answer1).toBe(430);
expect(answers.answer2).toBe(928);

console.log({ exampleAnswers, answers });
