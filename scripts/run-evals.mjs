import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { evaluateFiles } from "../src/evaluation/evaluate-skill.mjs";

export async function runEvaluations({
  evalsDirectory,
  skillsDirectory,
  stdout = console.log,
  stderr = console.error,
}) {
  let entries;

  try {
    entries = await readdir(evalsDirectory, { withFileTypes: true });
  } catch (error) {
    stderr(`Unable to read evaluations directory: ${error.message}`);
    return 1;
  }

  const evaluationDirectories = entries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));

  if (evaluationDirectories.length === 0) {
    stderr("Evaluation failed: no evaluation suites found.");
    return 1;
  }

  let passed = 0;
  let failed = 0;

  const evaluationResults = await Promise.all(
    evaluationDirectories.map(async (directory) => {
      try {
        const result = await evaluateFiles({
          casesPath: join(evalsDirectory, directory.name, "cases.yml"),
          skillPath: join(skillsDirectory, directory.name, "SKILL.md"),
        });
        return { result };
      } catch (error) {
        return { directoryName: directory.name, error };
      }
    }),
  );

  for (const evaluation of evaluationResults) {
    if (evaluation.error) {
      stderr(`✗ ${evaluation.directoryName}: ${evaluation.error.message}`);
      failed += 1;
      continue;
    }

    const { result } = evaluation;

    for (const evaluationCase of result.cases) {
      if (evaluationCase.passed) {
        stdout(`✓ ${result.skill}: ${evaluationCase.name}`);
        passed += 1;
      } else {
        stderr(
          `✗ ${result.skill}: ${evaluationCase.name} (expected ${evaluationCase.expected}, got ${evaluationCase.actual})`,
        );
        failed += 1;
      }
    }
  }

  const total = passed + failed;
  const summary = `${passed}/${total} evaluations passed.`;

  if (failed > 0) {
    stderr(summary);
    return 1;
  }

  stdout(summary);
  return 0;
}

export async function main() {
  const currentFile = fileURLToPath(import.meta.url);
  const projectDirectory = join(dirname(currentFile), "..");
  return runEvaluations({
    evalsDirectory: join(projectDirectory, "evals"),
    skillsDirectory: join(projectDirectory, "skills"),
  });
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  process.exitCode = await main();
}
