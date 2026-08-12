# Security Policy

Entrama treats authentication, personal progress, typed input, and local-first data handling as security and privacy boundaries.

## Supported Versions

Entrama has not published its first release and no application implementation is currently available. There are therefore no supported release versions or deployed security-update branches yet.

Security reports about repository configuration, documentation that could cause unsafe implementation, exposed credentials, or future pre-release code are still welcome. This policy will be updated with a supported-version table before the first public release.

## Reporting a Vulnerability

Report suspected vulnerabilities privately through [GitHub Security Advisories](https://github.com/Luis-Ant/entrama/security/advisories/new).

Do not open a public issue, discussion, or pull request for an undisclosed vulnerability. Do not include secrets, access tokens, private keys, credentials, authentication links, real user data, private typed content, clipboard contents, or unnecessary personally identifiable information in any public channel. Use minimal synthetic evidence and redact sensitive values in the private report whenever possible.

Include enough information to reproduce and assess the issue safely:

- the affected document, commit, component, or future version;
- impact and realistic attack scenario;
- minimal reproduction steps or proof of concept;
- relevant environment details; and
- suggested mitigation, if known.

Please avoid privacy-invasive testing, service disruption, destructive access, persistence, social engineering, or accessing data beyond what is necessary to demonstrate the issue.

## Response Goals

Maintainers aim to:

- acknowledge a report within 5 business days;
- provide an initial assessment or request for details within 10 business days;
- communicate material status changes while remediation is active; and
- coordinate disclosure after a fix or documented mitigation is available.

These are response goals, not guarantees. Timing depends on severity, maintainer availability, reproduction complexity, and release state.

## Priority Boundaries

Reports receive particular attention when they involve:

- authentication, OAuth or magic-link flows, session handling, identity linking, or account deletion;
- cross-user data access, row-level security, authorization, synchronization ownership, or privilege escalation;
- exposure of local or synchronized progress, account data, exports, credentials, or private caches;
- persistence, logging, telemetry, upload, or disclosure of raw typed input, clipboard content, per-keystroke streams, or authentication fragments;
- unsafe handling of composed input, paste, imports, curriculum data, or other untrusted input;
- cross-site scripting, dependency compromise, service-worker cache leakage, or secret exposure; or
- failures to purge account-specific credentials and private data on sign-out or deletion.

Entrama's intended design does not persist or upload raw typed content or per-keystroke streams. Any implementation that breaks this boundary should be treated as a privacy and security defect.
