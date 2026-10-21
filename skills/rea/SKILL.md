---
name: rea
description: Investigate authorized applications using REA (Reverse Engineer Anything) through its MCP integration, explaining behavior with verifiable evidence.
triggers:
  - reverse engineer
  - reverse engineering
  - analyze electron application
  - analyze javascript bundle
  - inspect native binary
  - reconstruct application behavior
  - inspect app internals
---

# REA — Reverse Engineer Anything

## Goal

Use the official REA MCP server to understand existing application behavior with verifiable evidence. This file is an integration workflow, not a copy or installation of the external REA package.

## When to Use

- Investigate a feature in software the user owns or is authorized to inspect.
- Trace JavaScript or Electron modules, IPC flows, websites, or native binary behavior.
- Explain an implementation when normal source-level inspection is insufficient.
- Propose an independent reimplementation based on verified observations.
- Respond to explicit requests for REA or reverse engineering.

## When Not to Use

- Routine bug diagnosis in accessible source code (prefer diagnose-bug).
- Ordinary programming questions, feature development, refactoring, or code review.
- Targets without the user's authorization.
- Secret extraction, access-control bypass, or unapproved probing.
- Pretending an investigation ran when REA MCP is unavailable.

## Constraints

- Only analyze targets that the user has permission to investigate.
- Start read-only; do not modify targets, run unknown binaries, or perform active probes without approval.
- Do not install packages, enable MCP connections, change agent settings, or upload files without user approval.
- Use only tools actually available in the current agent; never invent calls or findings.
- Native decompilation may require an additional, separately configured provider (Ghidra, Hopper, or IDA).
- Clearly separate evidence from hypotheses; report limitations and preserve sensitive data.

## Workflow

1. Identify target path or URL, the feature or question, and authorization and scope.
2. Check whether official REA MCP tools and the associated investigation skill are available.
3. If unavailable, request approval before local setup. Official setup examples:
   - Claude Code: `npx rea-agents@latest setup --client claude_code`
   - Codex: `npx rea-agents@latest setup --client codex`
   - REA requires Node.js 22.19+, 24.11+, or 26+. Review setup changes and restart the client.
   - Check connection with `npx -y rea-agents@latest doctor --client claude_code --json` (or substitute codex).
4. Choose the smallest applicable analysis technique. Static JavaScript/Electron inspection does not require a native analysis provider.
5. Collect concrete observations, tool outputs, module names, paths, symbols, and relevant code paths.
6. Explain the feature's input, processing, and output, distinguishing facts from inferred mechanisms.
7. If requested, recommend a bounded independent implementation; do not copy proprietary code or apply unapproved edits.
8. Report confidence, gaps, and the safest next verification step.

Official documentation: https://rea.tools/get-started/

## Output Format

### Scope and Authorization

Target, question, authorized boundaries, environment, and read-only status.

### REA Availability

Connected MCP/client and provider, or exact setup blocker.

### Evidence

Reproduction or inspection steps and verifiable observations.

### Behavior and Findings

Confirmed behavior and clearly labeled hypotheses.

### Limitations and Next Step

Confidence, uncertainties, and the smallest safe follow-up.
