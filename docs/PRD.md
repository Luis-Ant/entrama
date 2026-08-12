# Entrama Product Requirements Document

| Field | Value |
|---|---|
| Product | Entrama |
| Document status | Approved product direction for MVP definition |
| Audience | Product, design, curriculum, engineering, accessibility, and open-source contributors |
| Last updated | 2026-08-11 |

## Executive Summary

Entrama is a free, personal, open-source, desktop-first bilingual typing PWA. It combines exact typing practice with a continuously visible English-Spanish association: the user types an English word or short phrase and then its Spanish equivalent, with immediate character-level guidance and no visible input field.

The product promise is frictionless continuous practice that improves typing precision while repeatedly exposing the relationship between English and Spanish. Entrama may improve perceived word recognition, but the MVP does not test unaided recall and must not claim proven vocabulary learning, retention, mastery, or acquisition.

The primary user is the creator. Broader public use is welcome, but must not distort the product into a social, competitive, lesson-based, or engagement-optimized platform.

## Problem and Opportunity

Typing tools commonly interrupt practice with lessons, timers, result screens, goals, and competition. Vocabulary tools commonly require a separate study workflow and may overstate learning from exposure. The opportunity is a quieter system in which practice begins within seconds, continues without ceremony, and makes English-Spanish associations visible while the user develops keyboard control.

Entrama addresses three connected needs:

- Reduce the activation energy required to practice.
- Improve typing accuracy and pace across realistic bilingual text and keyboard-layout actions.
- Increase repeated exposure to useful English-Spanish associations without misrepresenting guided copying as vocabulary recall.

## Product Principles

1. **Practice before ceremony.** Returning users enter practice immediately and resume their local progress.
2. **Continuous, not sessionized.** Blocks are technical presentation units, not lessons or sessions; completion never produces a result screen.
3. **Precision before speed.** Incorrect input blocks progression until corrected. Speed must not encourage avoidable errors.
4. **Visible association, honest claims.** Both language forms remain visible; the product reports practice and exposure, never verified vocabulary mastery.
5. **Local-first ownership.** Guest practice, preferences, catalog, and progress work offline. Accounts add recovery and sync rather than unlock the product.
6. **Silent adaptation.** Difficulty changes without levels, progress bars, or gamified status.
7. **Layout-aware guidance.** Finger, hand, modifier, and composition guidance reflect the confirmed OS/layout profile.
8. **Private by default.** Statistics are personal, with no public comparison or behavioral surveillance.
9. **Minimal but configurable.** The virtual keyboard and compact live statistics are useful defaults that users may hide.
10. **Accessible fluency.** Fast interaction, reduced-motion support, localization, and assistive-technology compatibility are core requirements.

## Target User

### Primary User

The creator, practicing on a desktop or laptop in short voluntary moments, wants to improve English typing, maintain a low-friction habit, and become more familiar with useful English-Spanish associations.

### Broader Users

Public users with the same practice intent may use Entrama for free. MVP decisions must remain understandable and maintainable by open-source contributors, but public growth is not an MVP success prerequisite.

### Preconditions

- A physical keyboard on Windows or macOS.
- One of four supported OS/layout profiles: Windows US International, Windows Latin American QWERTY, macOS US International, or macOS Latin American QWERTY.
- Basic ability to read either supported interface language.

Mobile and tablet access may remain functional, but physical-keyboard desktop practice is the designed MVP experience.

## Jobs and Outcomes

| Job | Desired outcome | Evidence in MVP |
|---|---|---|
| Start practicing during a free moment | Reach active practice within seconds | Time from launch to first correct committed grapheme |
| Type with fewer errors | Improve accuracy on unseen content | Accuracy trend on held-out reviewed units |
| Type more fluently | Improve pace without sacrificing accuracy | WPM/pace trend paired with accuracy |
| Understand keyboard actions | Use the correct target key, finger, hand, modifier, and composition sequence | Skill-specific error and successful-action trends |
| Reinforce bilingual association | Perceive greater recognition of practiced words and phrases | Self-report plus exposure history; not a mastery claim |
| Preserve progress | Continue locally without an account and optionally recover across devices | Offline continuity and successful account synchronization |

## Experience Model

### Practice Unit and Block

- A unit is one independent reviewed bilingual item: an English word or short phrase paired with its Spanish equivalent.
- English is always typed first, followed by Spanish.
- A block is a continuous visual group of units selected by the curriculum engine.
- Units do not form prose, a story, a lesson, or a semantic sequence.
- Completing a block automatically presents the next block.

### Character Feedback

All target characters are visible in an opaque, uncompleted state. Each correct committed grapheme illuminates in place. The expected position turns red after wrong input, and progression remains blocked until the expected grapheme is correctly committed. There is no visible text field, cursor, or editable buffer. A native visually hidden input or textarea may capture text for composition and accessibility.

## Complete UX Flows

### First Use

1. Entrama asks for interface language independently of practice direction.
2. It presents best-effort OS/layout suggestions and clearly states that browser detection may be inaccurate.
3. The user explicitly confirms one of the four supported profiles.
4. Mandatory calibration validates representative physical keys, modifiers, dead-key/composition behavior, and profile consistency.
5. A short mandatory guided exercise demonstrates illuminated graphemes, blocked errors, English-then-Spanish order, and virtual-keyboard guidance.
6. Posture and finger guidance follows. It may be skipped only after the mandatory exercise and remains accessible later.
7. Continuous practice begins without an account prompt blocking entry.

### Repeat Visit

1. The application restores the active guest or account profile, confirmed layout, preferences, catalog version, and progress locally.
2. Practice opens immediately at an eligible next block.
3. If a safe application update, incompatible catalog, migration, or layout change requires action, Entrama resolves it before typing or at a block boundary, never mid-unit.

### Typing a Unit

1. The current English and Spanish forms are visible.
2. The next expected grapheme and corresponding virtual-keyboard action are emphasized.
3. Correct committed input illuminates that grapheme and advances the expected position.
4. Incorrect input marks the expected position red and records an error without advancing.
5. Correcting the expected grapheme clears the error state and continues.
6. Composition sequences are shown as layout-specific actions while comparison occurs against the final committed grapheme.
7. After English is complete, focus advances directly to Spanish; after Spanish is complete, the next unit begins.

### Completing a Block

1. The completed block leaves the active area with a purposeful, brief transition.
2. Progress is persisted locally in the background.
3. The next block appears automatically without score, confirmation, countdown, or celebration screen.
4. The user may pause simply by stopping, navigating away, closing, or hiding the application.

### Virtual Keyboard and Live Statistics

1. Both are visible by default.
2. The keyboard shows the target key, finger, hand, row/reach, and required modifiers or composition steps for the confirmed profile.
3. Compact statistics show current accuracy, pace, and errors without dominating practice.
4. Preferences can hide either surface and retain that choice locally.

### Difficulty Override

1. Automatic difficulty is the default and no numeric level is exposed.
2. The user may temporarily request easier or harder eligible material.
3. The UI clearly indicates temporary manual mode without exposing internal scores.
4. Returning to automatic mode uses the system estimate from observed performance; the override itself does not rewrite or corrupt that estimate.
5. Entrama shows mastered typing skills minimally, without levels, celebratory interruption, or vocabulary-mastery language.

### Statistics

1. The private statistics screen shows historical accuracy, WPM/pace, errors, practiced typing skills, practiced items, duration, and trends.
2. Filters and labels distinguish all content from unseen/held-out content when used for validation.
3. Vocabulary entries use labels such as `practiced`, `seen`, or `exposed`, never `learned` or `mastered`.
4. No profile, statistic, or comparison is public.

### Account Creation and Guest Merge

1. A guest can choose Google, GitHub, or email magic link without losing local practice.
2. Email magic-link initiation requires connectivity and communicates delivery/expiry state.
3. After authentication, the local guest history is claimed by the account through an idempotent merge.
4. Existing remote progress and local progress are combined without duplicate events or duplicate identities.
5. A failed or interrupted merge leaves local progress intact and can be retried.

### Offline, Reconnection, and Sign-Out

1. Practice, catalog, preferences, statistics, and local persistence continue offline.
2. Authentication initiation and magic-link completion report that a network is required.
3. Account events queue locally and synchronize when connectivity returns.
4. Sign-out detects pending/in-flight account events and, when online, attempts a bounded sync without waiting indefinitely.
5. Remaining events stay durably quarantined by account, inaccessible to the new guest, and resume only after re-authentication as that account; export is offered before destructive local removal.
6. Remote sign-out and credential removal may proceed without retaining usable credentials; unacknowledged events are deleted only after a clear warning and explicit confirmation of irreversible deletion. Account deletion remains a separate flow.

### Layout Change and Recalibration

1. The user can change OS/layout profile from settings.
2. Entrama requires calibration before practice resumes under the new profile.
3. Historical outcomes remain associated with their original layout profile.

### Export and Account Deletion

1. A user can export personal progress, preferences, aggregate events, and relevant version metadata in a documented portable format.
2. Account deletion requires explicit confirmation and removes remote account data.
3. Local signed-in caches are purged after deletion and a fresh guest profile remains usable.
4. Entrama explains separately how to delete or retain local-only guest data.

## Functional Requirements

### Practice

| ID | Requirement | Acceptance criteria |
|---|---|---|
| PR-001 | Resume directly into practice on repeat visits. | With valid local state, launch shows an actionable unit without lessons, goals, result screens, or account gates. |
| PR-002 | Present continuous independent bilingual units. | Every unit contains one reviewed English word/phrase followed by Spanish; blocks auto-advance and never form narrative text. |
| PR-003 | Render direct grapheme feedback without a visible input. | Target text is visible; correct committed graphemes illuminate in place; no editable field is visually exposed. |
| PR-004 | Block incorrect progression. | Wrong input marks the expected position red, increments error data once according to the error policy, and cannot advance until corrected. |
| PR-005 | Handle Unicode composition accurately. | Accented characters, `ñ`, and `ü` are compared as committed grapheme clusters after normalization, not as individual keydown characters. |
| PR-006 | Auto-load the next block. | Completing the final unit transitions to a new block without confirmation, result screen, timer, or interruption. |
| PR-007 | Allow natural pause and exit. | Closing, backgrounding, or navigating away preserves completed local progress without a formal end-session action. |
| PR-008 | Show a configurable virtual keyboard by default. | Guidance reflects confirmed layout, target key/finger/hand, modifiers, and composition; hiding it persists as a preference. |
| PR-009 | Show configurable compact live statistics by default. | Accuracy, pace, and errors update during practice; the surface can be hidden without affecting collection needed for personal progress. |
| PR-010 | Adapt difficulty silently. | Content changes within eligibility constraints without displaying levels or numeric progress bars. |
| PR-011 | Support temporary difficulty override. | Easier/harder mode can be entered and exited; automatic skill estimates exclude override choice as evidence while retaining actual typing outcomes. |
| PR-012 | Show mastered typing skills minimally. | Confirmed typing skills appear as compact, non-interruptive status; they are not presented as levels or vocabulary mastery. |

### Onboarding and Preferences

| ID | Requirement | Acceptance criteria |
|---|---|---|
| ON-001 | Assist OS/layout detection but require confirmation. | A suggestion is labeled best-effort; practice cannot begin until one supported profile is explicitly selected. |
| ON-002 | Require calibration. | Representative keys and composition paths pass before first practice and after every profile change. |
| ON-003 | Require a guided exercise. | The user successfully demonstrates correction and English-to-Spanish progression before ordinary practice. |
| ON-004 | Keep remaining guidance accessible. | Posture/finger education becomes skippable only after the exercise and can be reopened from help/settings. |
| ON-005 | Separate UI language from practice direction. | Spanish and English UI can each be selected while every practice unit remains English then Spanish. |
| ON-006 | Support light, dark, and system themes. | Theme choice applies consistently, persists locally, and maintains accessible contrast. |

### Accounts, Offline, and Data

| ID | Requirement | Acceptance criteria |
|---|---|---|
| DA-001 | Provide full guest practice. | A new user can onboard, practice, view statistics, and persist progress without creating an account. |
| DA-002 | Provide optional passwordless authentication. | Google, GitHub, and email magic link are available; no password registration or reset flow exists. |
| DA-003 | Merge guest progress safely. | Repeating or interrupting account claim never duplicates or loses completed practice events. |
| DA-004 | Work offline after initial installation. | App shell, reviewed catalog, practice, preferences, and local progress remain usable with the network disabled. |
| DA-005 | Synchronize after reconnection. | Pending account data eventually syncs after startup, authentication, online, visibility, or bounded retry triggers. |
| DA-006 | Keep statistics private. | No public profile, leaderboard, comparison endpoint, or share-by-default statistic exists. |
| DA-007 | Support export and deletion. | Authenticated users can request a portable export and delete remote account data; local-only deletion is independently available. |
| DA-008 | Preserve pending events across sign-out. | Sign-out never exposes account data to the guest or silently deletes unacknowledged events; bounded sync, account-scoped quarantine, same-account recovery, export, and explicit warned deletion follow the documented flow. |

### Statistics and Claims

| ID | Requirement | Acceptance criteria |
|---|---|---|
| ST-001 | Preserve meaningful typing history. | The private screen reports accuracy, WPM/pace, errors, skills, practiced items, duration, and trends with clear periods. |
| ST-002 | Avoid unsupported vocabulary claims. | Product copy and schemas never derive `learned` or `mastered` vocabulary from guided copying. |
| ST-003 | Distinguish typing skill from item exposure. | Typing-skill mastery and practiced-item exposure are separately modeled and labeled. |
| ST-004 | Support validation on unseen content. | The product can identify reviewed units reserved from prior practice and report their accuracy/pace without treating them as recall tests. |

## Curriculum and Content Requirements

| ID | Requirement | Acceptance criteria |
|---|---|---|
| CU-001 | Use a deterministic human-curated curriculum. | The same profile, progress state, catalog version, and algorithm version produce the same ranked eligible candidates. No ML is used in MVP. |
| CU-002 | Ship a reviewed pilot catalog. | MVP contains approximately 90 reviewed units distributed across overlapping internal bands; later expansion targets 250-300 units. |
| CU-003 | Enforce hard eligibility on three axes. | Units outside current typing difficulty, vocabulary difficulty, or usefulness bands cannot be selected regardless of rank score. |
| CU-004 | Model typing difficulty comprehensively. | Metadata covers layout actions, introduced/mastered keys, reach, rows, same-finger transitions, alternation, repeats, length, spaces, modifiers, composition, and accents. |
| CU-005 | Model vocabulary suitability comprehensively. | Metadata covers frequency/dispersion, CEFR, communicative utility, concreteness, ambiguity/sense, cognates/false friends, locale, and age appropriateness. |
| CU-006 | Follow the initial skill sequence. | Internal bands begin with lowercase/basic movement, then spaces/phrases, Spanish accents/`ñ`/`ü`, Shift/capitals, punctuation, and finally `¿?¡!` and harder combinations. |
| CU-007 | Preserve correct language. | Spanish is never intentionally misspelled or stripped of accents to reduce typing difficulty. |
| CU-008 | Validate and version content. | Repository content is structured, schema-validated, versioned, and carries source, license, and provenance; no admin panel is required. |
| CU-009 | Separate code and data licensing. | Original curriculum is recommended under CC BY 4.0 and third-party content is admitted only with compatible, recorded terms. |

Internal bands may overlap and are not user-visible levels. Content reviewers approve translations by sense and locale rather than relying on bare word-pair equivalence.

## Accessibility and Localization

- Target WCAG 2.2 AA for product UI and practice feedback.
- Preserve semantic reading order and meaningful labels while visually hiding the native text control.
- Do not use color alone to distinguish current, correct, and incorrect states.
- Provide visible focus, keyboard navigation outside the capture surface, and a reliable escape from practice capture.
- Announce errors and progress without producing excessive screen-reader chatter.
- Support zoom and fluid desktop layouts without clipping target text or keyboard guidance.
- Respect `prefers-reduced-motion`; no essential meaning depends on animation.
- Localize interface strings in professional Spanish and English, including errors, onboarding, settings, statistics, privacy, and account flows.
- Keep English-to-Spanish practice direction fixed regardless of UI locale.
- Test composed characters and grapheme clusters with supported OS/layout profiles and assistive technology.

## User-Facing Non-Functional Requirements

- **Responsiveness:** correct input should appear immediate; engineering latency targets are defined in the RFC.
- **Reliability:** completed progress must survive normal refresh, close, offline use, failed synchronization, and safe application updates.
- **Offline clarity:** users can distinguish offline-ready, offline-with-pending-sync, and network-required auth states.
- **Visual quality:** light/dark/system themes remain minimal, purposeful, and fluid; animations do not delay input.
- **Privacy:** no unnecessary behavioral telemetry, raw typed content, or per-keystroke uploads.
- **Installability:** supported browsers can install the PWA and launch it as a standalone experience.
- **Update safety:** a service-worker update never interrupts active practice.
- **Storage resilience:** the application requests persistent browser storage when appropriate and offers export/import because browser storage may still be evicted.

## MVP Scope

### Included

- Four Windows/macOS and US International/Latin American QWERTY profiles.
- Mandatory detection assistance, confirmation, calibration, and guided exercise.
- Continuous English-then-Spanish practice with exact grapheme feedback.
- Default virtual keyboard and compact live statistics with visibility preferences.
- Silent deterministic adaptation and temporary difficulty override.
- Approximately 90 reviewed, versioned curriculum units.
- Private local history and statistics.
- Guest-first offline operation and installable PWA behavior.
- Optional Google, GitHub, and email magic-link accounts with cross-device synchronization.
- English and Spanish interface localization.
- Export, account deletion, reduced motion, and light/dark/system themes.

### Explicit Non-Goals

- Lessons, daily goals, formal sessions, timers, rankings, streak pressure, social features, public profiles, comparisons, or narrative text.
- Recall tests, hidden translations, pronunciation/audio, timed play, or verified vocabulary mastery.
- Passwords, Apple or other additional identity providers in MVP.
- Numeric levels, visible progress bars, or user-facing curriculum bands.
- Mobile-first touch typing, unsupported keyboard layouts, or automatic layout detection presented as certain.
- Admin panel, machine-learning selection, recommendation model, or adaptive black box.
- SSR, realtime collaboration, or public activity feeds.
- Claims of proven vocabulary retention.

## Success Metrics and Four-Week Validation

The MVP succeeds as a personal product if the creator completes a four-week voluntary pilot and the experience remains useful without external incentives.

| Outcome | Measure | Initial success signal |
|---|---|---|
| Voluntary habit | Distinct practice days | At least 3 days per week in each of 4 weeks |
| Low activation energy | Launch/resume to first correct grapheme | Typically within 5 seconds on a ready repeat visit |
| Typing improvement | Accuracy on unseen reviewed units | Positive change from baseline without a material pace collapse |
| Typing fluency | WPM/pace on unseen reviewed units | Positive change while accuracy is stable or improving |
| Perceived association | Weekly self-report | Increased recognition is perceived; explicitly not verified retention |
| Low friction | Qualitative log and failed-start rate | No significant recurring blocker in onboarding, practice, offline use, or updates |
| Return intent | End-of-pilot interview | Creator wants to continue using Entrama voluntarily |

### Validation Method

1. Establish a baseline using reviewed units excluded from normal practice.
2. Practice voluntarily for four weeks without reminders, goals, or enforced durations.
3. Record product-generated aggregate typing measures and a short weekly friction/recognition reflection.
4. Reassess with unseen or still-held-out reviewed units under comparable conditions.
5. Evaluate accuracy and pace together; do not optimize one by degrading the other.
6. Treat increased word recognition as perception only. Vocabulary retention remains unverified until post-MVP unaided delayed-recall research exists.

These are validation thresholds, not public efficacy claims or guarantees.

## Risks and Mitigations

| Risk | Product impact | Mitigation |
|---|---|---|
| Visible translations are mistaken for learning proof | Misleading claims | Separate typing mastery from exposure; prohibit learned/mastered vocabulary labels. |
| Browser layout detection is wrong | Incorrect guidance and frustration | Require explicit confirmation and calibration; recalibrate after changes. |
| Curated catalog is too small or uneven | Repetition or poor progression | Pilot with ~90 reviewed units across overlapping bands, track coverage, expand to 250-300 after validation. |
| Adaptation overfits practiced items | Inflated improvement | Use held-out reviewed content and report unseen-content trends. |
| Offline browser data is evicted | Lost guest progress | Request persistent storage, make risk visible, support export/import, and offer optional sync. |
| Account merge duplicates or loses data | Trust failure | Use immutable event identity and idempotent claim/sync; never delete local data before acknowledgement. |
| Free managed services pause or lack backups | Recovery or auth interruption | Preserve local-first continuity, maintain logical dumps and restore tests, and use production SMTP. |
| Smooth animations compete with input | Perceived lag or accessibility harm | Isolate the typing path, set budgets, honor reduced motion, and animate only compositor-safe properties. |
| Name collision or legal constraint | Rebrand cost | Treat Entrama as a working product name pending legal, domain, and handle review before public launch. |

## Roadmap After MVP

1. Expand the reviewed catalog toward 250-300 units and additional validated profiles.
2. Evaluate delayed, unaided receptive and productive recall tests as a separate mode.
3. Add optional pronunciation/audio only with accessible controls, licensing, and offline strategy.
4. Explore timed play without changing the default continuous practice model.
5. Add Apple or other identity providers when demand and operational cost justify them.
6. Research vocabulary outcomes before making any retention or mastery claim.
7. Improve advanced self-hosting documentation without promising one-click deployment.

## Assumptions and Open Questions

### Assumptions

- Desktop Chromium, Firefox, and Safari-class browsers can support the core practice model, with capability-specific fallbacks.
- The creator can review the pilot's English-Spanish senses and locale suitability or recruit qualified review.
- A 90-unit pilot is sufficient to validate interaction and initial typing adaptation, not broad vocabulary coverage.
- WPM uses a documented five-character convention and is always contextualized by accuracy.

### Explicit Unresolved Questions

- Which Spanish locale policy should lead the pilot when multiple valid translations exist?
- What exact calibration prompts best distinguish each supported profile without collecting raw text?
- Which units should remain held out during the four-week personal validation?
- What minimum evidence would justify introducing optional post-MVP recall tests?
- Is the Entrama name legally and operationally available in intended jurisdictions, domains, package registries, and social handles?

## Glossary

| Term | Meaning |
|---|---|
| Block | A continuously presented group of independent bilingual units; not a lesson or session. |
| Committed grapheme | User-visible text accepted after browser input/composition processing and compared as a grapheme cluster. |
| Exposure | A vocabulary item was visibly practiced; it does not imply recall or learning. |
| Layout action | A physical key, modifier, dead-key, or composition sequence required by an OS/layout profile. |
| Profile | The confirmed combination of operating system and keyboard layout. |
| Typing skill mastery | A system estimate of reliable execution of typing actions; unrelated to vocabulary mastery. |
| Unit | A reviewed English word or short phrase and its Spanish equivalent, typed in that order. |
| Unseen content | Reviewed validation content not previously included in ordinary practice for that user. |
| WPM | Words per minute computed using the documented five-committed-character convention. |

## Product and Technical Boundary

This PRD defines user outcomes, behavior, scope, claims, and acceptance criteria. Implementation choices such as React, IndexedDB, Supabase, RPCs, service workers, data tables, formulas, and performance budgets belong to [RFC.md](./RFC.md). If implementation constraints threaten a requirement, the product requirement is not silently weakened; the discrepancy must be resolved as a documented decision.
