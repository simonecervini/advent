const input = await Bun.file(
  Bun.resolveSync("./inputs/07.txt", import.meta.dir)
).text();

const calibrations = input
  .trim()
  .split("\n")
  .map((row) => {
    const numbers = row.trim().replace(":", " ").split(/\s+/);
    return {
      inputs: numbers.slice(1).map((x) => parseInt(x)),
      output: parseInt(numbers[0]!),
    };
  });

function toBaseDigits(opts: {
  input: number;
  length: number;
  base: number;
}): number[] {
  const { input, length, base } = opts;
  return [...input.toString(base).padStart(length, "0")].map((x) =>
    parseInt(x)
  );
}

let answerPart1 = 0;
let answerPart2 = 0;

for (const calibration of calibrations) {
  const combinations1 = Array.from(
    { length: 2 ** (calibration.inputs.length - 1) },
    (_, input) =>
      toBaseDigits({ input, length: calibration.inputs.length - 1, base: 2 })
  );

  const combinations2 = Array.from(
    { length: 3 ** (calibration.inputs.length - 1) },
    (_, input) =>
      toBaseDigits({ input, length: calibration.inputs.length - 1, base: 3 })
  );

  for (const operators of combinations1) {
    let sum = calibration.inputs[0]!;
    for (let i = 1; i < calibration.inputs.length; i++) {
      const op = operators[i - 1];
      if (op === 0) {
        sum += calibration.inputs[i]!;
      } else {
        sum *= calibration.inputs[i]!;
      }
    }
    if (sum === calibration.output) {
      answerPart1 += sum;
      break;
    }
  }

  for (const operators of combinations2) {
    let sum = calibration.inputs[0]!;
    for (let i = 1; i < calibration.inputs.length; i++) {
      const op = operators[i - 1];
      if (op === 0) {
        sum += calibration.inputs[i]!;
      } else if (op === 1) {
        sum *= calibration.inputs[i]!;
      } else {
        sum = parseInt(sum.toString() + calibration.inputs[i]!);
      }
    }
    if (sum === calibration.output) {
      answerPart2 += sum;
      break;
    }
  }
}

console.log("Answer part 1:", answerPart1); // Right answer: 1260333054159
console.log("Answer part 2:", answerPart2); // Right answer: 162042343638683
