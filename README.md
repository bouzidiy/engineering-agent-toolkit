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

The validation command exits with status `0` when every skill is valid and status
`1` when a validation error occurs.

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

GitHub Actions installs dependencies with `npm ci`, runs all tests, and validates
the checked-in skills for every push and pull request.
