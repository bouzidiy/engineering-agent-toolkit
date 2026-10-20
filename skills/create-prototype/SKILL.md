---
name: create-prototype
description: Generate a runnable, interactive UI prototype from a user story, feature request, acceptance criteria, or natural-language app idea. Use it to explore UX and validate business rules using deterministic mock data and realistic success, validation, empty, and failure scenarios, without connecting to production services.
triggers:
  - create-prototype
  - prototype interactif
  - prototype fonctionnel
  - prototypage
  - faire un prototype
  - créer un prototype
  - générer un prototype
  - generate a prototype
  - maquette interactive
  - données bouchonnées
  - mock data
  - mocked data
  - interactive prototype
  - runnable prototype
---

# Create Prototype

## Goal

Turn a user story (US), feature description, or acceptance criteria into an isolated, runnable browser prototype that lets stakeholders see the interface, perform meaningful actions, and validate business rules against reproducible fake data.

The deliverable is an interactive business simulation, not a screenshot, a static wireframe, or a production implementation.

## When to Use

Use this skill when the user wants to:

- visualize a new application or feature before implementation;
- convert a user story, Jira ticket, or free-text description into clickable screens;
- explore and discuss a user journey with a PO, designer, or business stakeholder;
- validate acceptance criteria and rules with simulated data;
- test success, rejection, validation, empty-state, and failure behaviors without a backend.

## When Not to Use

Do not use this skill when the user only wants to:

- fix a bug or diagnose a regression;
- implement production-grade frontend or backend code;
- generate a static image or presentation;
- write a specification without a runnable prototype;
- connect the prototype to real systems or production data.

## Constraints

- Create and modify files **only in a dedicated prototype output directory** (default: `prototypes/<feature-slug>/`), unless the user explicitly approves another location.
- Never modify an existing application's dependencies, lockfiles, build pipeline, design system, or application code as a side effect of prototyping.
- Respect the host repository's framework/version restrictions and project instructions. Reuse its existing frontend technology and design-system components only when doing so is possible within the isolated output directory and without upgrading packages.
- For a stand-alone prototype without an existing suitable stack, prefer a small Vite + vanilla TypeScript implementation with local state. Do not introduce a backend, database, cloud resources, extra services, or heavy abstractions for the first iteration.
- Inspect any available design system, tokens, component library, or user-provided visual references. If none exists, use a clean, accessible default and explicitly flag the chosen visual assumptions. A URL can be a visual reference, not permission to copy proprietary assets.
- Use explicitly fictional mock data; never copy secrets or customer/personal data from real environments. Never call production APIs.
- Keep mock data, business rules, and visual components separated so behavior is understandable and editable.
- Each visible interactive control must have meaningful behavior. Do not show inert buttons as if the workflow were implemented.
- Label all simulated behaviors clearly. A prototype is not proof that a real backend integration or business process works.
- Preserve business rules explicitly provided by the user. Record inferred or missing rules as assumptions; do not silently invent critical authorization, financial, or compliance decisions.
- Ask only for information whose absence makes a meaningful prototype impossible. Otherwise choose reversible defaults, document them, and proceed.
- Do not install packages, start services, publish the prototype, or make external network requests if the environment or user has disallowed them.

## Workflow

1. **Understand the request.** Read the US, description, and acceptance criteria. If available, inspect the target project, existing UI, design tokens, mock conventions, and architectural restrictions.
2. **Extract business behavior.** Identify actors, user goals, screens, entities, fields, business rules, validations, states, transitions, and expected outcomes. Keep a distinction between explicit requirements, assumptions, and open questions.
3. **Define a small scope.** Select the minimum screens and interactions that demonstrate the requested feature. Do not build unrelated flows.
4. **Choose the isolated implementation.** Use the existing approved frontend stack when safe and practical; otherwise use Vite + vanilla TypeScript. Create all generated files inside the prototype directory only.
5. **Prepare deterministic scenarios.** Create a fixture collection with at least:
   - a normal success case;
   - an invalid or rejected action showing the applicable rule;
   - an empty, boundary, or service-failure case relevant to the story.
   Add permission/role scenarios only if relevant. All scenario data must be fake, coherent, and easy to edit.
6. **Implement actual behavior.** Render navigable screens, real form inputs and validation messages, status changes, and local simulated action results. Keep domain rules in small named functions, separate from display components. Use in-memory state; optionally provide a local reset action.
7. **Make scenarios inspectable.** Provide a clearly labeled demo/scenario switcher or an equivalent repeatable way to load each fixture, with reset available. Switching scenarios must reset the relevant UI state.
8. **Trace business rules.** Create a concise rule-to-interaction matrix linking each explicit acceptance criterion to the corresponding screen/action/scenario. Identify unimplemented, ambiguous, and assumed behavior.
9. **Verify the result.** When execution is allowed, run the available build/checks and exercise the main happy path and one invalid path. If tools or dependencies are unavailable, explain exactly what was not verified. Do not claim a working browser preview without having run it.
10. **Present for validation.** Provide the directory path, exact local startup command, screens and scenarios, implemented rules, key assumptions, and a short list of decisions to confirm. Invite user feedback for the next iteration, without broadening scope automatically.

## Output Format

### Prototype

- Prototype directory and frontend stack.
- Exact startup command and localhost URL when known and verified.
- Screens and meaningful user interactions delivered.

### Demo Scenarios

List each fixture/scenario and the behavior to try. State that all data and service responses are simulated.

### Business Rule Coverage

Provide a table with: rule/acceptance criterion, UI interaction, scenario, result, and coverage status.

### Assumptions and Open Questions

Separate confirmed requirements from assumptions. Highlight only decisions that materially affect the next iteration.

### Verification and Limitations

Report checks actually executed and their results. Mention any skipped verification, missing design-system integration, or intentionally unimplemented backend behavior.
