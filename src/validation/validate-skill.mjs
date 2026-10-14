import { readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import YAML from "yaml";

export const REQUIRED_FIELDS = ["name", "description"];

export const REQUIRED_SECTIONS = ["Goal", "When to Use", "When Not to Use", "Constraints", "Workflow", "Output Format"];

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) {
    return null;
  }

  try {
    return YAML.parse(match[1]);
  } catch (error) {
    return null;
  }
}

export function validateSkillContent(directoryName, content) {
  const errors = [];
  const frontmatter = parseFrontmatter(content);
  if (!frontmatter || typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
    errors.push("missing or malformed frontmatter");
  } else {
    for (const field of REQUIRED_FIELDS) {
      if (typeof frontmatter[field] !== "string" || frontmatter[field].trim() === "") {
        errors.push(`missing frontmatter field "${field}"`);
      }
    }

    if (typeof frontmatter.name === "string" && frontmatter.name.trim() !== "" && frontmatter.name !== directoryName) {
      errors.push(`frontmatter name "${frontmatter.name}" does not match directory "${directoryName}"`);
    }
  }

  for (const section of REQUIRED_SECTIONS) {
    const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    const heading = new RegExp(String.raw`^## ${escaped}\s*$`, "m");

    if (!heading.test(content)) {
      errors.push(`missing section "${section}"`);
    }
  }

  return {
    name: directoryName,
    valid: errors.length === 0,
    errors,
  };
}

export async function validateSkillPath(skillPath) {
  if (!skillPath) {
    throw new Error("Skill path is required");
  }

  try {
    const files = await readdir(skillPath, { withFileTypes: true });
    const skillName = basename(skillPath);
    const hasSkillFile = files.some((file) => file.isFile() && file.name === "SKILL.md");

    if (!hasSkillFile) {
      return {
        name: skillName,
        valid: false,
        errors: ["SKILL.md file is missing"],
      };
    }

    const content = await readFile(join(skillPath, "SKILL.md"), "utf8");
    return validateSkillContent(skillName, content);
  } catch (error) {
    throw new Error(`Failed to read skill directory: ${error.message}`);
  }
}
