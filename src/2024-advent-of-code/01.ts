const input = await Bun.file("./src/2024-advent-of-code/inputs/01.txt").text();

const lines = input.split("\n");

const listA: number[] = [];
const listB: number[] = [];
for (const line of lines) {
  const [a, b] = line.trim().split(/\s+/);
  listA.push(parseInt(a, 10));
  listB.push(parseInt(b, 10));
}

listA.sort((a, b) => a - b);
listB.sort((a, b) => a - b);

const totalDistance = listA.reduce((acc, value, index) => {
  return acc + Math.abs(value - listB[index]);
}, 0);

const similarityScore = listA.reduce((acc, value) => {
  return acc + value * listB.filter((x) => x === value).length;
}, 0);

console.table({
  totalDistance, // Correct answer: 2066446
  similarityScore, // Correct answer: 24931009
});
