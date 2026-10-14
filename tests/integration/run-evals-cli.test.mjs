import assert from "node:assert/strict";
import test from "node:test";

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runEvaluations } from "../../scripts/run-evals.mjs";

async function createSkill(root, name, triggers = ["error"]) {
  const directory = join(root, name);
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, "SKILL.md"),
    `---\nname: ${name}\ntriggers:\n${triggers.map((trigger) => `  - ${trigger}`).join("\n")}\n---\n`,
  );
}

async function createSuite(root, name, cases) {
  const directory = join(root, name);
  await mkdir(directory, { recursive: true });
  const serializedCases = cases.map((evaluationCase) => `
  - name: ${evaluationCase.name}
    prompt: ${evaluationCase.prompt}
    expected: ${evaluationCase.expected}`).join("\n");
  await writeFile(join(directory, "cases.yml"), `skill: ${name}\ncases:${serializedCases}\n`);
}

async function createWorkspace(t) {
  const root = await mkdtemp(join(tmpdir(), "evals-cli-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const evalsDirectory = join(root, "evals");
  const skillsDirectory = join(root, "skills");
  await mkdir(evalsDirectory);
  await mkdir(skillsDirectory);
  return { evalsDirectory, skillsDirectory };
}

test("evaluates multiple skills and returns 0 when every case passes", async (t) => {
  const { evalsDirectory, skillsDirectory } = await createWorkspace(t);
  await createSkill(skillsDirectory, "diagnose-bug", ["error"]);
  await createSuite(evalsDirectory, "diagnose-bug", [
    { name: "positive", prompt: "Investigate this error", expected: "use" },
    { name: "negative", prompt: "Explain a HashMap", expected: "do-not-use" },
  ]);
  await createSkill(skillsDirectory, "review-code", ["review"]);
  await createSuite(evalsDirectory, "review-code", [
    { name: "positive", prompt: "Review this code", expected: "use" },
  ]);

  const output = [];
  const errors = [];
  const exitCode = await runEvaluations({
    evalsDirectory,
    skillsDirectory,
    stdout: (message) => output.push(message),
    stderr: (message) => errors.push(message),
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(errors, []);
  assert.equal(output.at(-1), "3/3 evaluations passed.");
});

test("returns 1 and reports a failed expectation", async (t) => {
  const { evalsDirectory, skillsDirectory } = await createWorkspace(t);
  await createSkill(skillsDirectory, "diagnose-bug", ["error"]);
  await createSuite(evalsDirectory, "diagnose-bug", [
    { name: "wrong expectation", prompt: "Explain a HashMap", expected: "use" },
  ]);

  const errors = [];
  const exitCode = await runEvaluations({
    evalsDirectory,
    skillsDirectory,
    stdout: () => {},
    stderr: (message) => errors.push(message),
  });

  assert.equal(exitCode, 1);
  assert.ok(errors[0].includes("expected use, got do-not-use"));
  assert.equal(errors.at(-1), "0/1 evaluations passed.");
});

test("returns 1 when a suite file is missing", async (t) => {
  const { evalsDirectory, skillsDirectory } = await createWorkspace(t);
  await mkdir(join(evalsDirectory, "diagnose-bug"));
  await createSkill(skillsDirectory, "diagnose-bug", ["error"]);

  const errors = [];
  const exitCode = await runEvaluations({
    evalsDirectory,
    skillsDirectory,
    stdout: () => {},
    stderr: (message) => errors.push(message),
  });

  assert.equal(exitCode, 1);
  assert.ok(errors[0].includes("Unable to read evaluation input"));
});
