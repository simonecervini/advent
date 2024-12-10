const input = await Bun.file(
  Bun.resolveSync("./inputs/04.txt", import.meta.dir)
).text();

const matrix = input
  .trim()
  .split("\n")
  .map((row) => [...row.trim()]);

const rowsCount = matrix.length;
const colsCount = matrix[0]?.length!;

// -- Part 1 --

function Part1() {
  const matchMatrix = Array.from({ length: rowsCount }, () =>
    Array.from({ length: colsCount }, () => 0)
  );

  const checkCells = (input: [number, number][]) => {
    const str = input.map(([i, j]) => matrix[i]?.[j]).join("");
    if (str === "XMAS" || str === "SAMX") {
      for (const [i, j] of input) {
        matchMatrix[i]![j]! += 1;
      }
    }
  };

  for (let i = 0; i < rowsCount; i++) {
    for (let j = 0; j < colsCount; j++) {
      checkCells([
        [i, j],
        [i + 1, j],
        [i + 2, j],
        [i + 3, j],
      ]);

      checkCells([
        [i, j],
        [i, j + 1],
        [i, j + 2],
        [i, j + 3],
      ]);

      checkCells([
        [i, j],
        [i - 1, j + 1],
        [i - 2, j + 2],
        [i - 3, j + 3],
      ]);

      checkCells([
        [i, j],
        [i - 1, j - 1],
        [i - 2, j - 2],
        [i - 3, j - 3],
      ]);
    }
  }

  const totalSum = matchMatrix.flat().reduce((sum, x) => sum + x, 0);

  console.table({
    matches_part1: totalSum / 4, // Right answer: 2530
  });
}

// -- Part 2 --

function Part2() {
  const matchMatrix = Array.from({ length: rowsCount }, () =>
    Array.from({ length: colsCount }, () => 0)
  );

  const checkCells = (input: [number, number][]) => {
    const str = input.map(([i, j]) => matrix[i]?.[j]).join("");
    const incrementedCells: [number, number][] = [];
    if (/^(MAS|SAM)(MAS|SAM)$/.test(str)) {
      for (const [i, j] of input) {
        if (incrementedCells.every(([ii, jj]) => i !== ii || j !== jj)) {
          incrementedCells.push([i, j]);
          matchMatrix[i]![j]! += 1;
        }
      }
    }
  };

  for (let i = 0; i < rowsCount; i++) {
    for (let j = 0; j < colsCount; j++) {
      checkCells([
        [i, j],
        [i + 1, j + 1],
        [i + 2, j + 2],
        [i + 2, j],
        [i + 1, j + 1],
        [i, j + 2],
      ]);
    }
  }

  const totalSum = matchMatrix.flat().reduce((sum, x) => sum + x, 0);

  console.table({
    matches_part2: totalSum / 5, // Right answer: 1921
  });
}

Part1();
Part2();
