import assert from "node:assert/strict";
import test from "node:test";

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { main, runValidation } from "../../scripts/validate-skills.mjs";
import { REQUIRED_SECTIONS } from "../../src/validation/validate-skill.mjs";

function validSkillContent(name) {
  const sections = REQUIRED_SECTIONS.map((section) => `## ${section}\n\nContent`).join("\n\n");

  return `---\nname: ${name}\ndescription: Test skill.\n---\n\n# Test Skill\n\n${sections}\n`;
}

function invalidSkillContent(name) {
  const sections = REQUIRED_SECTIONS.map((section) => `## ${section}\n\nContent`).join("\n\n");

  return `---\nname: ${name}\ndescription: ""\n---\n\n# Test Skill\n\n${sections}\n`;
}

test("returns 0 when all skills are valid", async (t) => {
  const skillsDirectory = await mkdtemp(join(tmpdir(), "skills-"));

  t.after(() => rm(skillsDirectory, { recursive: true, force: true }));

  const skillDirectory = join(skillsDirectory, "test-skill");
  await mkdir(skillDirectory);
  await writeFile(join(skillDirectory, "SKILL.md"), validSkillContent("test-skill"));

  const output = [];
  const errors = [];

  const exitCode = await runValidation({
    skillsDirectory,
    stdout: (message) => output.push(message),
    stderr: (message) => errors.push(message),
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(errors, []);
  assert.ok(output.includes("✓ test-skill: valid"));
});

test("return 1 when all skill are invalid", async (t) => {
  const skillsDirectory = await mkdtemp(join(tmpdir(), "skills-"));

  t.after(() => rm(skillsDirectory, { recursive: true, force: true }));

  const skillDirectory = join(skillsDirectory, "test-skill");
  await mkdir(skillDirectory);
  await writeFile(join(skillDirectory, "SKILL.md"), invalidSkillContent("test-skill"));


  const output = [];
  const errors = [];

  const exitCode = await runValidation({
    skillsDirectory,
    stdout: (message) => output.push(message),
    stderr: (message) => errors.push(message),
  });

  assert.equal(exitCode, 1);
});

test("returns 1 when a skill is invalid", async (t) => {
  const skillsDirectory = await mkdtemp(join(tmpdir(), "skills-"));

  t.after(() => rm(skillsDirectory, { recursive: true, force: true }));

  const skillDirectory = join(skillsDirectory, "invalid-skill");
  await mkdir(skillDirectory);
  await writeFile(join(skillDirectory, "SKILL.md"), "# Invalid skill\n");

  const errors = [];

  const exitCode = await runValidation({
    skillsDirectory,
    stdout: () => {},
    stderr: (message) => errors.push(message),
  });

  assert.equal(exitCode, 1);
  assert.ok(errors.some((message) => message.includes("missing or malformed frontmatter")));
});

test("returns 1 when no skills exist", async (t) => {
  const skillsDirectory = await mkdtemp(join(tmpdir(), "skills-"));

  t.after(() => rm(skillsDirectory, { recursive: true, force: true }));

  const errors = [];

  const exitCode = await runValidation({
    skillsDirectory,
    stdout: () => {},
    stderr: (message) => errors.push(message),
  });

  assert.equal(exitCode, 1);
  assert.deepEqual(errors, ["Validation failed: no skill directories found."]);
});

test("uses the project skills directory by default", async () => {
  const output = [];
  const errors = [];

  const exitCode = await main({
    args: [],
    stdout: (message) => output.push(message),
    stderr: (message) => errors.push(message),
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(errors, []);
  assert.ok(output.includes("✓ diagnose-bug: valid"));
});

test("accepts a custom relative skills directory", async (t) => {
  const workingDirectory = await mkdtemp(join(tmpdir(), "skills-cli-"));
  t.after(() => rm(workingDirectory, { recursive: true, force: true }));

  const skillsDirectory = join(workingDirectory, "custom-skills");
  const skillDirectory = join(skillsDirectory, "test-skill");
  await mkdir(skillDirectory, { recursive: true });
  await writeFile(join(skillDirectory, "SKILL.md"), validSkillContent("test-skill"));

  const exitCode = await main({
    args: ["custom-skills"],
    cwd: workingDirectory,
    stdout: () => {},
    stderr: () => {},
  });

  assert.equal(exitCode, 0);
});

test("accepts a custom absolute skills directory", async (t) => {
  const skillsDirectory = await mkdtemp(join(tmpdir(), "skills-cli-"));
  t.after(() => rm(skillsDirectory, { recursive: true, force: true }));

  const skillDirectory = join(skillsDirectory, "test-skill");
  await mkdir(skillDirectory);
  await writeFile(join(skillDirectory, "SKILL.md"), validSkillContent("test-skill"));

  const exitCode = await main({
    args: [skillsDirectory],
    stdout: () => {},
    stderr: () => {},
  });

  assert.equal(exitCode, 0);
});

test("returns 1 when the custom directory does not exist", async (t) => {
  const workingDirectory = await mkdtemp(join(tmpdir(), "skills-cli-"));
  t.after(() => rm(workingDirectory, { recursive: true, force: true }));

  const errors = [];
  const exitCode = await main({
    args: ["does-not-exist"],
    cwd: workingDirectory,
    stdout: () => {},
    stderr: (message) => errors.push(message),
  });

  assert.equal(exitCode, 1);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Unable to read skills directory/);
});
