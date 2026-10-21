import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateSuite,
  loadSkillDefinition,
  parseEvaluationSuite,
  shouldUseSkill,
} from "../../src/evaluation/evaluate-skill.mjs";

const validSuite = `
skill: diagnose-bug
cases:
  - name: error report
    prompt: Diagnose this runtime error.
    expected: use
`;

test("parses a valid evaluation suite", () => {
  const suite = parseEvaluationSuite(validSuite);

  assert.equal(suite.skill, "diagnose-bug");
  assert.equal(suite.cases.length, 1);
});

test("rejects invalid evaluation YAML", () => {
  assert.throws(
    () => parseEvaluationSuite("skill: [invalid"),
    /Invalid evaluation YAML/,
  );
});

test("rejects an evaluation case without a prompt", () => {
  const content = `
skill: diagnose-bug
cases:
  - name: missing prompt
    expected: use
`;

  assert.throws(() => parseEvaluationSuite(content), /requires a non-empty "prompt"/);
});

test("rejects an unknown expected result", () => {
  const content = validSuite.replace("expected: use", "expected: maybe");

  assert.throws(() => parseEvaluationSuite(content), /invalid "expected"/);
});

test("rejects duplicate evaluation case names", () => {
  const content = `
skill: diagnose-bug
cases:
  - name: duplicate
    prompt: First prompt.
    expected: use
  - name: duplicate
    prompt: Second prompt.
    expected: do-not-use
`;

  assert.throws(() => parseEvaluationSuite(content), /must be unique/);
});

test("loads triggers from skill frontmatter", () => {
  const skill = loadSkillDefinition(`---\nname: diagnose-bug\ntriggers:\n  - error\n---\n`);

  assert.deepEqual(skill, { name: "diagnose-bug", triggers: ["error"] });
});

test("selects a skill by explicit name or trigger", () => {
  const skill = { name: "diagnose-bug", triggers: ["root cause", "error"] };

  assert.equal(shouldUseSkill(skill, "Use the diagnose-bug skill"), true);
  assert.equal(shouldUseSkill(skill, "Find the ROOT   CAUSE please"), true);
  assert.equal(shouldUseSkill(skill, "Explain a HashMap"), false);
});

test("short skill names match complete terms only", () => {
  const skill = { name: "rea", triggers: ["reverse engineering"] };

  assert.equal(shouldUseSkill(skill, "Use REA to inspect this application"), true);
  assert.equal(shouldUseSkill(skill, "We need reverse engineering"), true);
  assert.equal(shouldUseSkill(skill, "Create an Angular form"), false);
  assert.equal(shouldUseSkill(skill, "Read the README"), false);
});

test("evaluates passing and failing cases", () => {
  const suite = parseEvaluationSuite(`
skill: diagnose-bug
cases:
  - name: positive
    prompt: Investigate this error.
    expected: use
  - name: deliberately wrong expectation
    prompt: Explain a HashMap.
    expected: use
`);

  const result = evaluateSuite(suite, {
    name: "diagnose-bug",
    triggers: ["error"],
  });

  assert.equal(result.passed, 1);
  assert.equal(result.failed, 1);
  assert.deepEqual(result.cases.map(({ actual }) => actual), ["use", "do-not-use"]);
});
