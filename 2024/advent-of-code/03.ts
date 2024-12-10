const input = await Bun.file(
  Bun.resolveSync("./inputs/03.txt", import.meta.dir)
).text();

const regex = new RegExp(
  /(mul\((\d{1,3}),(\d{1,3})\))|(do\(\))|(don't\(\))/,
  "g"
);

let answerP1 = 0;
let answerP2 = 0;
let canSumToP2 = true;

for (const [cmd, _, maybeA, maybeB] of input.matchAll(regex)) {
  if (cmd === "do()") {
    canSumToP2 = true;
  } else if (cmd === "don't()") {
    canSumToP2 = false;
  } else if (cmd.startsWith("mul")) {
    if (typeof maybeA !== "string" || typeof maybeB !== "string") {
      throw new Error("Cannot parse mul() parameters");
    }
    const a = parseInt(maybeA);
    const b = parseInt(maybeB);
    answerP1 += a * b;
    if (canSumToP2) {
      answerP2 += a * b;
    }
  }
}

console.table({
  answerP1, // Right answer: 173529487
  answerP2, // Right answer: 99532691
});
