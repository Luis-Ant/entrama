### E2E Tests: Practice

**Suite ID:** `PRACTICE-E2E`
**Feature:** Accessible bilingual character practice and production offline shell

---

## Test Cases

### `PRACTICE-E2E-001` - Accessible shell and initial focus

**Priority:** `critical`

Verifies the named practice region, guidance landmark, heading, enabled pause control, and initial focus on the labeled typing input.

### `PRACTICE-E2E-002` - Incorrect character recovery

**Priority:** `high`

Types an incorrect character, verifies that progress remains on the expected character and the error count increases, then verifies recovery with the correct character.

### `PRACTICE-E2E-003` - Complete bilingual unit

**Priority:** `critical`

Completes `hello`, verifies the Spanish `hola` phase, completes it, and verifies progression to the English `home` unit.

### `PRACTICE-E2E-004` - Production offline reload

**Priority:** `critical`

Loads the production build online, waits until its service worker controls the page, switches Chromium offline, reloads, and verifies the practice shell remains usable from the precache.

## Preconditions

- Chromium is installed through Playwright.
- The Playwright web server builds and serves the production bundle.

## Expected Result

- Character progression enforces correction and bilingual ordering.
- Core semantics and keyboard focus are available.
- The controlled production app reloads successfully without a network connection.
