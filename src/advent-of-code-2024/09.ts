import { expect, test } from "bun:test";

const input = (
  await Bun.file(Bun.resolveSync("./inputs/09.txt", import.meta.dir)).text()
).trim();

if (!/^\d+$/g.test(input)) {
  throw new Error("Invalid input");
}

const DOT = "." as const;

type Block = number | typeof DOT;

function parseBlocks(input: string) {
  const blocks: Array<Block> = [];
  for (const [id, lengthStr] of [...input].entries()) {
    const length = parseInt(lengthStr);
    if (id % 2 === 0) {
      blocks.push(...Array.from({ length }, () => id / 2));
    } else {
      blocks.push(...Array.from({ length }, () => DOT));
    }
  }
  return blocks;
}

function swap<T>(indices: [number, number], array: T[]): T[] {
  const [i, j] = indices;
  let ti = structuredClone(array[i]);
  let tj = structuredClone(array[j]);
  if (ti === undefined || tj === undefined) throw new Error();
  array[i] = tj;
  array[j] = ti;
  return array;
}

function checksum(blocks: Block[]) {
  let sum = 0;
  for (const [index, block] of blocks.entries()) {
    sum += typeof block === "number" ? index * block : 0;
  }
  return sum;
}

function groupBlocks(blocks: Block[]): { value: Block; len: number }[] {
  const groups: { value: Block; len: number }[] = [];
  for (const value of blocks) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.value === value) {
      lastGroup.len++;
    } else {
      groups.push({ value, len: 1 });
    }
  }
  return groups;
}

function ungroupBlocks(groups: ReturnType<typeof groupBlocks>) {
  const blocks: Block[] = [];
  for (const group of groups) {
    blocks.push(...Array(group.len).fill(group.value));
  }
  return blocks;
}

function getAnswer1(input: { blocks: Block[] }) {
  const { blocks } = input;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]!;
    if (block === DOT) continue;
    const firstFreeSpaceIndex = blocks.findIndex((x, j) => x === DOT && j < i);
    if (firstFreeSpaceIndex >= 0) {
      swap([i, firstFreeSpaceIndex], blocks);
    }
  }
  return checksum(blocks);
}

function getAnswer2(input: { blocks: Block[] }) {
  let groups = groupBlocks(input.blocks);

  for (const group of groups
    .toReversed()
    .filter((g) => typeof g.value === "number")) {
    const groupIndex = groups.findIndex((g) => g.value === group.value);

    const freeGroupIndex = groups.findIndex(
      (g, i) => g.value === DOT && g.len >= group.len && i < groupIndex
    );
    const freeGroup = groups[freeGroupIndex];

    if (freeGroup) {
      const padding = freeGroup.len - group.len;
      freeGroup.value = group.value;
      freeGroup.len = group.len;
      groups[groupIndex]!.value = DOT;
      if (padding > 0) {
        groups = [
          ...groups.slice(0, freeGroupIndex + 1),
          { len: padding, value: DOT },
          ...groups.slice(freeGroupIndex + 1),
        ];
      }
      groups = groupBlocks(ungroupBlocks(groups));
    }
  }

  const orderedBlocks = ungroupBlocks(groups);

  return checksum(orderedBlocks);
}

const answer1 = getAnswer1({ blocks: parseBlocks(input) });
const answer2 = getAnswer2({ blocks: parseBlocks(input) });

console.log("Answer 1:", answer1);
console.log("Answer 2:", answer2);

// -- Tests --

expect(swap([0, 1], [1, 2, 3, 4])).toEqual([2, 1, 3, 4]);
expect(swap([1, 3], [1, 2, 3, 4])).toEqual([1, 4, 3, 2]);
expect(groupBlocks(parseBlocks("12345"))).toEqual([
  { value: 0, len: 1 },
  { value: DOT, len: 2 },
  { value: 1, len: 3 },
  { value: DOT, len: 4 },
  { value: 2, len: 5 },
]);
