const input = await Bun.file(
  Bun.resolveSync("./inputs/05.txt", import.meta.dir)
).text();

const rules: [number, number][] = [];
const updates: number[][] = [];

let parsingUpdates = false;
for (const row of input.split("\n")) {
  if (row === "") {
    parsingUpdates = true;
    continue;
  }
  if (parsingUpdates) {
    updates.push(row.split(",").map((x) => parseInt(x)));
  } else {
    rules.push(row.split("|").map((x) => parseInt(x)) as [number, number]);
  }
}

function correctUpdate(update: number[]) {
  const applicableRules = rules.filter(
    ([a, b]) => update.includes(a) || update.includes(b)
  );
  return update.toSorted((a, b) => {
    const rule = applicableRules.find((rule) => rule[0] === a && rule[1] === b);
    return rule ? (rule[0] === a ? -1 : 1) : 0;
  });
}

function isUpdateCorrect(update: number[]) {
  const correctedUpdate = correctUpdate(update);
  for (let i = 0; i < update.length; i++) {
    if (update[i] !== correctedUpdate[i]) {
      return false;
    }
  }
  return true;
}

let sum1 = 0;
let sum2 = 0;
for (const update of updates) {
  if (isUpdateCorrect(update)) {
    const middle = update[Math.floor(update.length / 2)]!;
    sum1 += middle;
  } else {
    const correctedUpdate = correctUpdate(update);
    sum2 += correctedUpdate[Math.floor(correctedUpdate.length / 2)]!;
  }
}

console.table({
  part1: sum1, // Right answer: 6034
  part2: sum2, // Right answer: 6305
});
