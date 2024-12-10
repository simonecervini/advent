const input = await Bun.file(
  Bun.resolveSync("./inputs/01.txt", import.meta.dir)
).text();

const lines = input.split("\n");

const listA: number[] = [];
const listB: number[] = [];
for (const line of lines) {
  const [a, b] = line.trim().split(/\s+/);
  listA.push(parseInt(a!, 10));
  listB.push(parseInt(b!, 10));
}

listA.sort((a, b) => a - b);
listB.sort((a, b) => a - b);

const totalDistance = listA.reduce((acc, value, index) => {
  return acc + Math.abs(value - listB[index]!);
}, 0);

const similarityScore = listA.reduce((acc, value) => {
  return acc + value * listB.filter((x) => x === value).length;
}, 0);

console.table({
  totalDistance, // Right answer: 2066446
  similarityScore, // Right answer: 24931009
});
