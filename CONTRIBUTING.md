# Contributing to Entrama

Entrama is currently in a docs-first foundation phase. Contributions should improve the approved product direction, technical architecture, accessibility, privacy, curriculum policy, or repository documentation without implying that a runnable application exists.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Current Workflow

1. Read the [Product Requirements Document](docs/PRD.md) and [Technical Architecture RFC](docs/RFC.md).
2. Search existing issues and discussions before proposing the same change.
3. Open an issue first for substantial product, architecture, licensing, privacy, security, accessibility, or curriculum changes.
4. Keep the proposal focused on one reviewable outcome and explain how it preserves or intentionally revises approved decisions.
5. Submit a pull request that links the relevant issue, describes scope and tradeoffs, and records the verification performed.

Small corrections such as broken links, spelling, and unambiguous formatting fixes may be submitted directly.

## Future Implementation Workflow

Application implementation has not started. There are no supported installation, build, lint, test, or development commands yet. Do not invent commands in issues or pull requests.

An implementation workflow will be documented after the initial scaffold establishes a package manager, reproducible environment, quality gates, and verified commands. Until then, application-code contributions are not ready for review.

## Pull Request Expectations

- Keep scope narrow and avoid unrelated cleanup.
- Explain the problem, outcome, tradeoffs, and intentionally excluded work.
- Link substantial changes to an issue agreed upon before implementation.
- Preserve product vocabulary boundaries: visible guided copying supports exposure, not proven vocabulary learning or mastery.
- Update affected documentation in the same change.
- Add or update tests when an implementation and testing workflow becomes available.
- State exactly what was verified and identify any remaining limitation.
- Confirm accessibility, localization, privacy, security, and offline implications where relevant.
- Respond constructively to review and keep follow-up changes within the agreed scope.

## Curriculum and Content Contributions

Content must be suitable for the approved bilingual typing curriculum and reviewed for English-Spanish sense, locale, spelling, accents, ambiguity, usefulness, age appropriateness, and typing features. Automated translation alone is not sufficient review.

Every contributed item must include item-level provenance: creator or source, source reference when available, exact license and version, required attribution, modifications or translation performed, and reviewer state. Contributors must have the right to submit the material. Do not submit content with unclear ownership, incompatible terms, or an unsupported claim that it has been relicensed.

Original Entrama curriculum is governed by [CONTENT_LICENSE.md](CONTENT_LICENSE.md). Third-party material retains its own compatible license and obligations.

## Privacy and Security

- Never include credentials, access tokens, API keys, private keys, OAuth secrets, session data, or raw/generated secrets in commits, issues, logs, screenshots, fixtures, or examples.
- Never submit real typed private content, clipboard data, email addresses, authentication callbacks, or production user data.
- Use synthetic, non-sensitive examples for documentation and future tests.
- Do not add raw input persistence, per-keystroke uploads, session replay, fingerprinting, or public statistics without an explicit approved architecture and privacy review.
- Report suspected vulnerabilities privately according to [SECURITY.md](SECURITY.md), not in a public issue.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) with a concise outcome-oriented description, for example:

```text
docs: clarify curriculum provenance requirements
```

Common types include `docs`, `feat`, `fix`, `test`, `refactor`, `chore`, and `ci`. Keep each commit as a coherent work unit and keep its verification and documentation with the change.

## Review and Licensing

Maintainers may request changes or decline contributions that conflict with the approved scope, lack evidence or provenance, create privacy risk, or are too broad to review safely. Contributions intentionally submitted for inclusion are governed by the repository's applicable licenses unless explicitly stated otherwise; submitting material does not grant rights the contributor does not own.
