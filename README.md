# Entrama

Entrama is a free, open-source bilingual typing practice application designed to improve keyboard precision through continuous English-Spanish association. It keeps practice immediate and uninterrupted: type an English word or short phrase, then its Spanish equivalent, with character-level feedback and layout-aware guidance.

> **Current status:** The first runnable application slice is available. It includes the accessible practice shell, framework-neutral grapheme progression, and an installable offline app shell; the broader MVP remains in development.

## How Practice Works

Entrama presents independent reviewed bilingual units in a continuous flow. Both language forms remain visible, English is typed first, and incorrect input blocks progression until corrected. Blocks advance automatically without lessons, timers, result screens, streak pressure, or competitive rankings.

This interaction provides repeated vocabulary **exposure** alongside typing practice. Because users copy visible text, Entrama does not claim to teach, verify, or measure vocabulary recall, retention, mastery, or acquisition.

## Planned MVP

- Desktop-first installable PWA with full guest practice offline
- Exact grapheme feedback for English and Spanish, including composed characters
- Four Windows and macOS keyboard profiles across US International and Latin American QWERTY layouts
- Required layout confirmation, calibration, and a guided first exercise
- Continuous deterministic curriculum selection without machine learning
- Layout-aware virtual keyboard and compact private statistics
- Silent typing-difficulty adaptation with a temporary manual override
- Approximately 90 reviewed, versioned bilingual curriculum units
- English and Spanish interface localization
- Optional Google, GitHub, and email magic-link accounts for recovery and cross-device sync
- Export, deletion, reduced-motion support, and light, dark, and system themes

## Architecture

Entrama is designed as a static Vite, React, and strict TypeScript PWA with framework-neutral domain modules. IndexedDB is the local source of truth, so practice does not depend on an account or backend availability. Optional account sync uses Supabase Auth and PostgreSQL with row-level security, exchanging immutable aggregate practice events rather than raw typed content or per-keystroke streams.

The complete accepted architecture, including data models, synchronization, security, testing, deployment, and operational boundaries, is documented in the [technical RFC](docs/RFC.md).

## Repository Map

| Path                                       | Purpose                                                            |
| ------------------------------------------ | ------------------------------------------------------------------ |
| [`docs/PRD.md`](docs/PRD.md)               | Approved MVP product requirements, scope, and claim boundaries     |
| [`docs/RFC.md`](docs/RFC.md)               | Accepted MVP technical architecture and implementation constraints |
| [`src/typing`](src/typing)                 | Framework-neutral typing progression and correction policy         |
| [`src/app`](src/app)                       | React application shell and practice adapter                       |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)       | Current contribution workflow and review expectations              |
| [`CONTENT_LICENSE.md`](CONTENT_LICENSE.md) | Curriculum and content licensing and provenance rules              |
| [`SECURITY.md`](SECURITY.md)               | Private vulnerability reporting policy                             |

## Development

Entrama requires [Bun](https://bun.sh/) 1.3.10. Install dependencies and start Vite with the Bun runtime:

```sh
bun install
bunx playwright install chromium
bun run dev
```

Run the complete local quality gate before submitting a change:

```sh
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

## Contributing

Contributions should remain focused on small, reviewable outcomes that preserve the approved product and architecture. For substantial changes, open an issue before preparing a pull request so the direction can be aligned without wasted work. See [CONTRIBUTING.md](CONTRIBUTING.md) for the verified workflow.

## Privacy Principle

Entrama is private by default. Raw typed content, clipboard content, and per-keystroke streams must not be persisted or uploaded. Practice history and statistics remain local unless a user explicitly chooses account synchronization, and no public profiles, rankings, session replay, fingerprinting, or behavioral surveillance are planned for the MVP.

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Architecture RFC](docs/RFC.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Content Licensing](CONTENT_LICENSE.md)

## License

Entrama application code is licensed under the [Apache License 2.0](LICENSE). Original curriculum, data, and content identified as Entrama-owned are licensed separately under [CC BY 4.0](CONTENT_LICENSE.md). Third-party material retains its own recorded compatible license and attribution requirements.
