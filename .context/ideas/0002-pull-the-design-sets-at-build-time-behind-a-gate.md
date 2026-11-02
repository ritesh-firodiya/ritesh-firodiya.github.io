---
id: IDEA-0002
status: shipped
last-verified: 2026-11-02
problems: PROB-0003
source: backfill
---
# Pull the design sets at build time behind a gate

## Summary
Clone each product repo at build time, copy its design set into the export, and withhold any set that fails a gate. A credential scan stops the build on a hit. How it works today is in [[nothing-copied]].

## Fit
It costs a live token and a dependency on the product repos at every deploy. That cost was accepted on purpose after [[no-design-sets-on-site]] was tried.

## Evidence
- 2fecaa5: the pull and the guards.
- dac1b41: restored, with the gate.
- 75be487: the gate reads the current design sets.
- fe6349a: gaps closed after an audit.
