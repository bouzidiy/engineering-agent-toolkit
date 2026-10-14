import { readFile } from "node:fs/promises";
import YAML from "yaml";

import { parseFrontmatter } from "../validation/validate-skill.mjs";

const EXPECTED_RESULTS = new Set(["use", "do-not-use"]);

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function parseEvaluationSuite(content) {
  let suite;

  try {
    suite = YAML.parse(content);
  } catch (error) {
    throw new Error(`Invalid evaluation YAML: ${error.message}`);
  }

  if (!suite || typeof suite !== "object" || Array.isArray(suite)) {
    throw new Error("Evaluation suite must be a YAML object");
  }
  if (typeof suite.skill !== "string" || suite.skill.trim() === "") {
    throw new Error('Evaluation suite requires a non-empty "skill"');
  }
  if (!Array.isArray(suite.cases) || suite.cases.length === 0) {
    throw new Error('Evaluation suite requires a non-empty "cases" array');
  }

  const caseNames = new Set();

  for (const [index, evaluationCase] of suite.cases.entries()) {
    if (!evaluationCase || typeof evaluationCase !== "object") {
      throw new Error(`Evaluation case ${index + 1} must be an object`);
    }
    if (typeof evaluationCase.name !== "string" || evaluationCase.name.trim() === "") {
      throw new Error(`Evaluation case ${index + 1} requires a non-empty "name"`);
    }
    if (caseNames.has(evaluationCase.name)) {
      throw new Error(`Evaluation case name "${evaluationCase.name}" must be unique`);
    }
    caseNames.add(evaluationCase.name);
    if (typeof evaluationCase.prompt !== "string" || evaluationCase.prompt.trim() === "") {
      throw new Error(`Evaluation case ${index + 1} requires a non-empty "prompt"`);
    }
    if (!EXPECTED_RESULTS.has(evaluationCase.expected)) {
      throw new Error(
        `Evaluation case ${index + 1} has invalid "expected"; use "use" or "do-not-use"`,
      );
    }
  }

  return suite;
}

export function loadSkillDefinition(content) {
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter || typeof frontmatter !== "object") {
    throw new Error("Skill has missing or malformed frontmatter");
  }
  if (typeof frontmatter.name !== "string" || frontmatter.name.trim() === "") {
    throw new Error('Skill requires a non-empty frontmatter field "name"');
  }
  if (!Array.isArray(frontmatter.triggers) || frontmatter.triggers.length === 0) {
    throw new Error('Skill requires a non-empty frontmatter field "triggers" for evaluations');
  }
  if (frontmatter.triggers.some((trigger) => typeof trigger !== "string" || trigger.trim() === "")) {
    throw new Error('Skill frontmatter field "triggers" must contain non-empty strings');
  }

  return {
    name: frontmatter.name,
    triggers: frontmatter.triggers,
  };
}

export function shouldUseSkill(skill, prompt) {
  const normalizedPrompt = normalize(prompt);
  const explicitName = normalize(skill.name);

  return normalizedPrompt.includes(explicitName)
    || skill.triggers.some((trigger) => normalizedPrompt.includes(normalize(trigger)));
}

export function evaluateSuite(suite, skill) {
  if (suite.skill !== skill.name) {
    throw new Error(
      `Evaluation suite targets "${suite.skill}" but skill frontmatter declares "${skill.name}"`,
    );
  }

  const cases = suite.cases.map((evaluationCase) => {
    const actual = shouldUseSkill(skill, evaluationCase.prompt) ? "use" : "do-not-use";
    return {
      ...evaluationCase,
      actual,
      passed: actual === evaluationCase.expected,
    };
  });

  return {
    skill: suite.skill,
    cases,
    passed: cases.filter((evaluationCase) => evaluationCase.passed).length,
    failed: cases.filter((evaluationCase) => !evaluationCase.passed).length,
  };
}

export async function evaluateFiles({ casesPath, skillPath }) {
  let casesContent;
  let skillContent;

  try {
    [casesContent, skillContent] = await Promise.all([
      readFile(casesPath, "utf8"),
      readFile(skillPath, "utf8"),
    ]);
  } catch (error) {
    throw new Error(`Unable to read evaluation input: ${error.message}`);
  }

  return evaluateSuite(
    parseEvaluationSuite(casesContent),
    loadSkillDefinition(skillContent),
  );
}
