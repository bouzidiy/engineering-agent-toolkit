---
name: diagnose-bug
description: Diagnose runtime failures, exceptions, failing tests, regressions, performance problems, and unexpected software behavior by gathering evidence and identifying the root cause before changing code.
triggers:
  - diagnose
  - root cause
  - error
  - exception
  - failing test
  - regression
  - performance problem
  - unexpected behavior
  - http 5
---


# Diagnose Bug

## Goal

Identify and explain the root cause of a software problem using reproducible evidence before proposing any change.

## When to Use

Use this skill when:

- an application produces an error or exception;
- a test fails unexpectedly;
- the software behaves differently from its specification;
- a regression has appeared;
- a performance problem has an unknown cause;
- the user explicitly requests a diagnosis or root-cause analysis.

## When Not to Use

Do not use this skill when:

- answering a theoretical or general programming question;
- implementing a new feature;
- performing routine refactoring;
- applying a known fix whose cause has already been demonstrated;
- reviewing code without a reported symptom.

## Constraints

- Do not modify code, configuration, dependencies, or data.
- Do not run destructive commands.
- Do not expand the investigation beyond the reported problem without a clear reason.
- Do not present an assumption as a fact.
- Do not claim a root cause without evidence connecting it to the symptom.
- Clearly identify missing information and remaining uncertainty.

## Workflow

1. Describe the observed symptom and expected behavior.
2. Determine the affected component and investigation scope.
3. Identify or reconstruct the reproduction steps.
4. Reproduce the problem when safely possible.
5. Collect relevant evidence, such as:
   - error messages and stack traces;
   - failing test output;
   - logs;
   - relevant code and configuration;
   - recent changes;
   - environment and dependency versions.
6. Form hypotheses based on the available evidence.
7. For each plausible hypothesis:
   - state the supporting evidence;
   - define a check that can confirm or reject it;
   - perform the check when safe;
   - record the observed result;
   - mark the hypothesis as confirmed, rejected, or unresolved.
8. Identify the root cause only when the evidence explains the symptom.
9. Propose the smallest corrective action without applying it.
10. Report confidence and any remaining uncertainty.

## Output Format

Use the following structure:

### Symptom

Describe the observed behavior, expected behavior, and affected scope.

### Reproduction

List the reproduction steps and state whether the problem was reproduced.

### Evidence

Present the relevant observations, logs, errors, code paths, and recent changes.

### Hypotheses Tested

For each hypothesis, include:

- hypothesis;
- supporting evidence;
- verification performed;
- observed result;
- status: confirmed, rejected, or unresolved.

### Root Cause

Explain the causal chain between the defect and the observed symptom.

If the evidence is insufficient, explicitly state that the root cause has not been confirmed.

### Proposed Fix

Describe the smallest corrective action. Do not apply it.

### Confidence and Remaining Uncertainties

State the confidence level and identify any missing evidence or unresolved questions.
