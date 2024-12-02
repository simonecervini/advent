const input = await Bun.file(
  Bun.resolveSync("./inputs/02.txt", import.meta.dir)
).text();

const reports = input
  .split("\n")
  .map((report) => report.trim().split(/\s+/).map(Number));

const allowedDiffs = new Set([1, 2, 3]);

const isReportSafe = (report: number[]) => {
  if (!allowedDiffs.has(Math.abs(report[1] - report[0]))) {
    return false;
  }

  const expectedSign = Math.sign(report[1] - report[0]);
  for (let i = 2; i < report.length; i++) {
    const prev = report[i - 1];
    const curr = report[i];
    const actualSign = Math.sign(curr - prev);
    if (
      actualSign !== expectedSign ||
      !allowedDiffs.has(Math.abs(curr - prev))
    ) {
      return false;
    }
  }
  return true;
};

const safeReports = {
  base: 0,
  withProblemDampener: 0,
};
for (const report of reports) {
  const isSafe = isReportSafe(report);
  if (isSafe) {
    safeReports.base++;
    safeReports.withProblemDampener++;
  } else {
    const reportVariants = Array.from({ length: report.length }, (_, i) =>
      report.toSpliced(i, 1)
    );
    if (reportVariants.some((report) => isReportSafe(report))) {
      safeReports.withProblemDampener++;
    }
  }
}

console.table({
  base: safeReports.base, // Right answer: 390
  withProblemDampener: safeReports.withProblemDampener, // Right answer: 439
});
