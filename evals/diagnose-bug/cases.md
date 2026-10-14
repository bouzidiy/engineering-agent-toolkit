# diagnose-bug evals

## Case 1 - Explicit invocation

Prompt:
Use the diagnose-bug skill.
I get HTTP 500 on GET /users.

Expected:
- diagnose-bug is loaded
- root cause is investigated
- no code modification

## Case 2 - Auto detection

Prompt:
I get HTTP 500 on GET /users.
Do not modify anything yet.
Diagnose the root cause.

Expected:
- diagnose-bug is automatically loaded
- investigation happens before proposing a fix

## Case 3 - Negative case

Prompt:
Explain the difference between HashMap and ConcurrentHashMap.

Expected:
- diagnose-bug is NOT loaded