#!/usr/bin/env node

/**
 * Script to verify 100% test coverage
 * Usage: npm run check-coverage
 */

const fs = require("fs");
const path = require("path");

// Path to the coverage summary file
const coverageSummaryPath = path.join(
  __dirname,
  "..",
  "coverage",
  "coverage-summary.json"
);

try {
  // Check if coverage file exists
  if (!fs.existsSync(coverageSummaryPath)) {
    console.error("❌ Error: Coverage report not found!");
    console.error("Run tests with coverage first: npm run test:coverage");
    process.exit(1);
  }

  // Read and parse the coverage report
  const coverage = JSON.parse(fs.readFileSync(coverageSummaryPath, "utf8"));
  const total = coverage.total;

  // Display coverage statistics
  console.log("📊 COVERAGE REPORT:");
  console.log(`Statements: ${total.statements.pct}%`);
  console.log(`Branches: ${total.branches.pct}%`);
  console.log(`Functions: ${total.functions.pct}%`);
  console.log(`Lines: ${total.lines.pct}%`);

  // Check if any coverage metric is below 100%
  const notFullyCovered = [];

  if (total.statements.pct < 100) notFullyCovered.push("statements");
  if (total.branches.pct < 100) notFullyCovered.push("branches");
  if (total.functions.pct < 100) notFullyCovered.push("functions");
  if (total.lines.pct < 100) notFullyCovered.push("lines");

  if (notFullyCovered.length > 0) {
    console.error("❌ Error: Code coverage is not 100%");
    console.error(
      `The following metrics are below 100%: ${notFullyCovered.join(", ")}`
    );

    // Find files with less than 100% coverage
    console.error("\nFiles that need more test coverage:");

    Object.entries(coverage).forEach(([file, metrics]) => {
      // Skip the "total" entry
      if (file === "total") return;

      const hasLowCoverage =
        metrics.statements?.pct < 100 ||
        metrics.branches?.pct < 100 ||
        metrics.functions?.pct < 100 ||
        metrics.lines?.pct < 100;

      if (hasLowCoverage) {
        console.error(`- ${file}`);
        if (metrics.statements?.pct < 100)
          console.error(`  Statements: ${metrics.statements.pct}%`);
        if (metrics.branches?.pct < 100)
          console.error(`  Branches: ${metrics.branches.pct}%`);
        if (metrics.functions?.pct < 100)
          console.error(`  Functions: ${metrics.functions.pct}%`);
        if (metrics.lines?.pct < 100)
          console.error(`  Lines: ${metrics.lines.pct}%`);
      }
    });

    console.error(
      "\nPlease ensure all code is covered by tests before committing."
    );
    process.exit(1);
  } else {
    console.log("✅ Code coverage is 100%");
  }
} catch (error) {
  console.error("Error reading coverage report:", error.message);
  process.exit(1);
}
