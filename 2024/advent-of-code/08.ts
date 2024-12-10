const input = await Bun.file(
  Bun.resolveSync("./inputs/08.txt", import.meta.dir)
).text();

const data = input
  .trim()
  .split("\n")
  .map((row) => {
    return row.trim().split("");
  });

type MapValue = { pos: [number, number] };
const map = new Map<string, MapValue[]>();
for (let y = 0; y < data.length; y++) {
  for (let x = 0; x < data.length; x++) {
    const cell = data[y]![x]!;
    if (cell !== ".") {
      const arr = map.get(cell);
      const newValue: MapValue = { pos: [x, y] };
      if (arr) {
        arr.push(newValue);
      } else {
        map.set(cell, [newValue]);
      }
    }
  }
}

const dataWithAntinodes1 = structuredClone(data);
const dataWithAntinodes2 = structuredClone(data);

for (const nodes of map.values()) {
  const couples = new Set<string>();
  for (const a of nodes) {
    for (const b of nodes) {
      const couple = [a, b]
        .map((x) => x.pos.join(","))
        .sort((a, b) => a.localeCompare(b));
      const coupleHash = couple.join(";");

      if (couple[0] !== couple[1] && !couples.has(coupleHash)) {
        couples.add(coupleHash);

        // y=f(x), y = m(x-x0) + y0
        const m = (b.pos[1] - a.pos[1]) / (b.pos[0] - a.pos[0]);
        const f = (x: number) => m * (x - a.pos[0]) + a.pos[1];

        for (let x = 0; x < data.length; x++) {
          const y = f(x);

          const d0 = distance(b.pos, a.pos);
          const da = distance([x, y], a.pos);
          const db = distance([x, y], b.pos);

          if (Number.isInteger(y) && y >= 0 && y < data.length) {
            dataWithAntinodes2[y]![x]! = "#";
            if (
              !eq([x, y], a.pos) &&
              !eq([x, y], b.pos) &&
              (da === d0 || db === d0)
            ) {
              dataWithAntinodes1[y]![x]! = "#";
            }
          }
        }
      }
    }
  }
}

function eq(a: [number, number], b: [number, number]) {
  return a[0] === b[0] && a[1] === b[1];
}

function distance(a: [number, number], b: [number, number]) {
  const [x0, y0] = a;
  const [x1, y1] = b;
  return Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
}

const answerPart1 = dataWithAntinodes1.flat().filter((x) => x === "#").length;
const answerPart2 = dataWithAntinodes2.flat().filter((x) => x === "#").length;

console.log("Answer Part 1:", answerPart1); // Right answer: 291
console.log("Answer Part 2:", answerPart2); // Right answer: 1015
