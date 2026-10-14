import assert from "node:assert/strict";
import test from "node:test";

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";

import { join } from "node:path";
import {
  REQUIRED_SECTIONS,
  validateSkillContent,
  validateSkillPath,
} from "../../src/validation/validate-skill.mjs";

function validSkillContent(name) {
  const sections = REQUIRED_SECTIONS.map((section) => `## ${section}\n\nContent`).join("\n\n");

  return `---\nname: ${name}\ndescription: Test skill.\n---\n\n# Test Skill\n\n${sections}\n`;
}

test("should validate skill with SKILL.md file", async (t) => {
  // Given
  const tempDir = await mkdtemp(join(tmpdir(), "skill-tmp-"));

  t.after(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  const skillPath = join(tempDir, "diagnose-bug");
  await mkdir(skillPath);

  const filePath = join(skillPath, "SKILL.md");
  await writeFile(filePath, validSkillContent("diagnose-bug"));

  // When
  const result = await validateSkillPath(skillPath);

  // Then
  assert.equal(result.name, "diagnose-bug");
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("should not validate skill without SKILL.md file", async (t) => {
  // Given
  const tempDir = await mkdtemp(join(tmpdir(), "skill-tmp-"));

  t.after(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  const skillPath = join(tempDir, "diagnose-bug");
  await mkdir(skillPath);

  // When
  const result = await validateSkillPath(skillPath);

  // Then
  assert.equal(result.name, "diagnose-bug");
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["SKILL.md file is missing"]);
});

test("should throw when skill directory does not exist", async (t) => {
  // Given
  const tempDir = await mkdtemp(join(tmpdir(), "skill-tmp-"));

  t.after(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  const skillPath = join(tempDir, "does-not-exist");

  // When / Then
  await assert.rejects(
    () => validateSkillPath(skillPath),
    (error) => {
      assert.equal(error instanceof Error, true);
      assert.match(error.message, /Failed to read skill directory/);
      return true;
    });
});

test("rejects malformed YAML frontmatter without throwing", () => {
  const sections = REQUIRED_SECTIONS.map((section) => `## ${section}`).join("\n\n");
  const content = `---\nname: [invalid\n---\n\n${sections}`;

  const result = validateSkillContent("diagnose-bug", content);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("missing or malformed frontmatter"));
});

test("rejects a missing required frontmatter field", () => {
  const content = validSkillContent("diagnose-bug").replace("description: Test skill.\n", "");

  const result = validateSkillContent("diagnose-bug", content);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('missing frontmatter field "description"'));
});

test("rejects a frontmatter name that differs from the directory", () => {
  const result = validateSkillContent("diagnose-bug", validSkillContent("another-skill"));

  assert.equal(result.valid, false);
  assert.ok(
    result.errors.includes(
      'frontmatter name "another-skill" does not match directory "diagnose-bug"',
    ),
  );
});

test("reports every missing required section", () => {
  const content = `---\nname: diagnose-bug\ndescription: Test skill.\n---\n\n# Test Skill\n`;

  const result = validateSkillContent("diagnose-bug", content);

  assert.equal(result.valid, false);
  assert.deepEqual(
    result.errors,
    REQUIRED_SECTIONS.map((section) => `missing section "${section}"`),
  );
});
