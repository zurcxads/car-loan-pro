# Superpowers Workflow — Auto Loan Pro

This project uses the Superpowers methodology for disciplined development.
Every non-trivial change follows: Brainstorm → Plan → Execute → Verify → Review

## For Codex Agents

Before executing any task, the orchestrator (Claudio) will:

1. **Brainstorm** — Think through requirements, edge cases, dependencies
2. **Write Plan** — Create a plan file at `plans/YYYY-MM-DD-[task-name].md`
3. **Execute** — Dispatch Codex with the plan as the prompt
4. **Verify** — Build must pass, check for regressions
5. **Review** — Audit the diff before pushing

## Plan File Format

```markdown
# Plan: [Task Name]
Date: YYYY-MM-DD
Status: draft | approved | executing | completed

## Context
What exists today. What we're changing and why.

## Steps
1. [ ] Step one — specific file changes
2. [ ] Step two — specific file changes
...

## Verification
- [ ] npm run build passes
- [ ] No new console statements
- [ ] No new any types
- [ ] Manual test: [describe]

## Risks
- Risk 1: mitigation
- Risk 2: mitigation
```

## Rules
- Plans survive agent kills — next agent reads the plan and continues
- Each step has its own commit
- Never skip the verification checklist
- If a step fails, stop and document why before continuing
