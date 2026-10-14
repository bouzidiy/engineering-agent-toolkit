import assert from "node:assert/strict";
import test from "node:test";

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runValidation } from "../../scripts/validate-skills.mjs";
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
