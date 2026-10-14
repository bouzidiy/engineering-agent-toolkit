import { readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateSkillPath } from "../src/validation/validate-skill.mjs";

export async function runValidation({
  skillsDirectory,
  stdout = console.log,
  stderr = console.error,
}) {
  let entries;

  try {
    entries = await readdir(skillsDirectory, { withFileTypes: true });
  } catch (error) {
    stderr(`Unable to read skills directory: ${error.message}`);
    return 1;
  }

  const skillDirectories = entries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));

  if (skillDirectories.length === 0) {
    stderr("Validation failed: no skill directories found.");
    return 1;
  }

  let errorCount = 0;

  const skillResults = await Promise.all(
    skillDirectories.map(async (directory) => {
      try {
        return await validateSkillPath(join(skillsDirectory, directory.name));
      } catch (error) {
        return {
          name: directory.name,
          valid: false,
          errors: [`unable to validate skill (${error.message})`],
        };
      }
    }),
  );

  for (const result of skillResults) {
    if (result.valid) {
      stdout(`✓ ${result.name}: valid`);
      continue;
    }

    for (const error of result.errors) {
      stderr(`✗ ${result.name}: ${error}`);
    }

    errorCount += result.errors.length;
  }

  if (errorCount > 0) {
    stderr(
      `Validation failed with ${errorCount} ${errorCount === 1 ? "error" : "errors"}.`,
    );
    return 1;
  }

  stdout(
    `Validated ${skillDirectories.length} ${skillDirectories.length === 1 ? "skill" : "skills"} successfully.`,
  );
  return 0;
}

export function resolveSkillsDirectory(requestedDirectory, cwd = process.cwd()) {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  return requestedDirectory
    ? resolve(cwd, requestedDirectory)
    : join(currentDir, "../skills");
}

export async function main({
  args = process.argv.slice(2),
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
} = {}) {
  const skillsDirectory = resolveSkillsDirectory(args[0], cwd);
  return runValidation({ skillsDirectory, stdout, stderr });
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  process.exitCode = await main();
}
