# Engineering Agent Toolkit

A small toolkit for building and validating reusable engineering-agent skills.

## Requirements

- Node.js 20 or newer
- npm

## Installation

```bash
npm ci
```

## Usage

Run the complete test suite:

```bash
npm test
```

Validate every skill under `skills/`:

```bash
npm run validate-skills
```

Validate skills from another directory by passing a relative or absolute path
after `--`:

```bash
npm run validate-skills -- ./my-skills
npm run validate-skills -- /absolute/path/to/skills
```

The `--` separator tells npm to forward the remaining argument to the validation
script. Relative paths are resolved from the directory where the command is run.

The validation command exits with status `0` when every skill is valid and status
`1` when a validation error occurs.

## REA integration

The [REA skill](skills/rea/SKILL.md) guides authorized software investigations
through [REA — Reverse Engineer Anything](https://rea.tools/).
REA is an **external MCP integration**, not installed or shipped by this toolkit.
Validating the skill does not establish that its MCP server is connected.

Check the current upstream documentation before installing dependencies.
REA requires Node.js 22.19+, 24.11+, or 26+ (stricter than this toolkit).
On an approved machine, interactive client setup examples are:

```bash
npx rea-agents@latest setup --client claude_code
# or: npx rea-agents@latest setup --client codex
```

Review any proposed agent configuration modifications before approving them,
restart the client, and check the installation:

```bash
npx -y rea-agents@latest doctor --client claude_code --json
# or: use --client codex
```

Native binary analysis may require a separately approved provider.
See the [official getting-started guide](https://rea.tools/get-started/).

## Evaluations

Run all behavioral selection evaluations:

```bash
npm run evals
```

Each skill under evaluation declares a non-empty `triggers` list in its YAML
frontmatter. The deterministic selector activates a skill when the prompt contains
its name or one of its triggers, using case-insensitive matching. Skill names must match complete terms, so `rea` will not activate for `create`.

Evaluation suites live at `evals/<skill-name>/cases.yml`:

```yaml
skill: diagnose-bug
cases:
  - name: runtime error
    prompt: Diagnose this runtime error.
    expected: use

  - name: unrelated question
    prompt: Explain the difference between HashMap and ConcurrentHashMap.
    expected: do-not-use
```

Every case requires a unique descriptive `name`, a non-empty `prompt`, and an
`expected` value of either `use` or `do-not-use`. The command returns status `0`
when all cases pass and status `1` for a failed case, invalid suite, or missing
file. Suites are evaluated concurrently, while their results remain ordered by
skill directory name for stable local and CI output.

## Skill format

Each skill lives in its own directory and must contain a `SKILL.md` file. The
directory name and the `name` field must match:

```text
skills/
└── example-skill/
    └── SKILL.md
```

The file starts with YAML frontmatter containing a non-empty `name` and
`description`:

```markdown
---
name: example-skill
description: Explain what the skill does and when it is useful.
---
```

It must also contain these level-two Markdown sections:

- `Goal`
- `When to Use`
- `When Not to Use`
- `Constraints`
- `Workflow`
- `Output Format`

See [`skills/diagnose-bug/SKILL.md`](skills/diagnose-bug/SKILL.md) for a complete
example.

## Project structure

```text
scripts/   Command-line entry points
skills/    Reusable skills
src/       Validation logic
tests/     Unit and integration tests
evals/     Evaluation cases for skills
```

## Continuous integration

GitHub Actions installs dependencies with `npm ci`, runs all tests, validates the
checked-in skills, and executes all evaluations for every push and pull request.
