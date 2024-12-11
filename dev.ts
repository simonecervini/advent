import { Command } from "commander";

const program = new Command();

const getCurrentYear = () => new Date().getFullYear().toString();

program.name("advent").version("12.25.0");

program
  .command("aoc")
  .alias("advent-of-code")
  .description("Run a specific Advent of Code file for the given year")
  .option(
    "-y, --year <year>",
    "Specify the year (default: current year)",
    getCurrentYear()
  )
  .argument("<file>", "Specify the file number to execute (e.g., 1, 2, 03, 04)")
  .action((file, options) => {
    const year = options.year || getCurrentYear();

    Bun.spawnSync(
      [
        "pnpm",
        "bun",
        "--watch",
        "run",
        `${year}/advent-of-code/${String(file).padStart(2, "0")}.ts`,
      ],
      {
        stdout: "inherit",
        stderr: "inherit",
      }
    );
  });

program
  .command("aot")
  .alias("advent-of-typescript")
  .description(
    "Run TypeScript type checks for a specific Advent of TypeScript file."
  )
  .option(
    "-y, --year <year>",
    "Specify the year (default: current year)",
    getCurrentYear()
  )
  .argument("<file>", "Specify the file number to check (e.g., 1, 2, 03, 04)")
  .action((file, options) => {
    const year = options.year || getCurrentYear();

    Bun.spawnSync(
      [
        "pnpm",
        "tsc",
        "--noEmit",
        "--watch",
        "--skipLibCheck",
        `${year}/advent-of-typescript/${String(file).padStart(2, "0")}.ts`,
      ],
      {
        stdout: "inherit",
        stderr: "inherit",
      }
    );
  });

program.parse(process.argv);
