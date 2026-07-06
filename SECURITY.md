<!--
SPDX-License-Identifier: AGPL-3.0-or-later
Copyright (C) 2026 Wesley Cordeiro de Araujo
See NOTICE for additional attribution and origin notices.
-->

# Security Policy

## MedSupply Relay

**MedSupply Relay** is a **Humanitarian Open Source Project**.

The public reference deployment is presented as the:

> **MedSupply Relay Community Pilot**

Security is especially important because the project coordinates medicine supply, demand, matching, synchronization, and reservations in environments where connectivity and infrastructure may be unstable.

A vulnerability that allows unauthorized modification, destruction, duplication, manipulation, or exposure of operational data may create consequences beyond a normal software defect.

We welcome good-faith security reports and responsible vulnerability disclosure.

---

## Table of contents

- [Supported versions](#supported-versions)
- [Community Pilot security status](#community-pilot-security-status)
- [Reporting a vulnerability](#reporting-a-vulnerability)
- [What to include in a report](#what-to-include-in-a-report)
- [Do not report vulnerabilities publicly](#do-not-report-vulnerabilities-publicly)
- [Expected response process](#expected-response-process)
- [Security priorities](#security-priorities)
- [High-impact vulnerability examples](#high-impact-vulnerability-examples)
- [Offline synchronization security](#offline-synchronization-security)
- [Reservation security](#reservation-security)
- [Sensitive and medical data](#sensitive-and-medical-data)
- [Secrets and credentials](#secrets-and-credentials)
- [Public API and abuse](#public-api-and-abuse)
- [Testing guidelines](#testing-guidelines)
- [Production and Community Pilot testing](#production-and-community-pilot-testing)
- [Third-party dependencies](#third-party-dependencies)
- [Deployment responsibility](#deployment-responsibility)
- [Security fixes and releases](#security-fixes-and-releases)
- [Security incident handling](#security-incident-handling)
- [Good-faith research](#good-faith-research)
- [Out of scope behavior](#out-of-scope-behavior)
- [Security acknowledgements](#security-acknowledgements)
- [Contact](#contact)

---

## Supported versions

Security support currently focuses on the latest maintained Community Pilot release line.

| Version | Security support |
| --- | --- |
| `1.0.x` | Supported |
| `< 1.0.0` | Not supported |

Security fixes may be applied directly to the current maintained branch and included in a new patch release.

Example:

```text
v1.0.0
  ↓
security fix
  ↓
v1.0.1
```

Older experimental commits, development snapshots, and pre-release states are not guaranteed to receive security updates.

Organizations maintaining independent deployments should track upstream security changes and evaluate whether their deployed version requires an update.

---

## Community Pilot security status

The public deployment at:

```text
https://medrelay.pages.dev
```

is a:

> **Community Pilot and public reference deployment**

It is not an official government, hospital, NGO, international organization, or emergency authority system unless a relationship is explicitly documented.

The Community Pilot exists to:

- demonstrate the project;
- validate field workflows;
- test offline-first behavior;
- identify operational and security risks;
- receive community feedback;
- help organizations evaluate the software.

Data registered in the public Community Pilot is not officially verified.

The public pilot must not be treated as a guaranteed source of verified emergency or medical information.

---

## Reporting a vulnerability

Please report suspected security vulnerabilities privately.

Contact:

```text
Wesley Cordeiro de Araujo
analistasistemasnet@gmail.com
```

Recommended email subject:

```text
MedSupply Relay Security Report
```

For a particularly urgent vulnerability, use:

```text
URGENT: MedSupply Relay Security Report
```

Do not include passwords, private keys, access tokens, or unrelated sensitive personal information in the email subject.

---

## What to include in a report

A useful report should include, when available:

1. A clear description of the vulnerability.
2. The affected repository.
3. The affected version or commit.
4. The affected component or endpoint.
5. Reproduction steps.
6. Expected behavior.
7. Actual behavior.
8. Security impact.
9. Whether the issue affects the public Community Pilot.
10. Whether data modification, data exposure, or service disruption was observed.
11. A minimal proof of concept, when safe.
12. Suggested mitigation, if known.

Example structure:

```text
Title:
Unauthorized reservation state transition

Affected component:
MedSupplyRelay.Api / Reservations

Affected version:
v1.0.0

Endpoint:
POST /api/v1/reservations/{id}/...

Description:
...

Reproduction:
1. ...
2. ...
3. ...

Expected:
...

Actual:
...

Impact:
...

Public Community Pilot affected:
Yes / No / Unknown
```

Use synthetic identifiers and synthetic operational data whenever possible.

Do not include real patient information.

---

## Do not report vulnerabilities publicly

Do not open a public GitHub Issue for a vulnerability when disclosure could create immediate risk.

Do not publish sensitive vulnerability details in:

- GitHub Issues;
- GitHub Discussions;
- Pull Requests;
- commit messages;
- screenshots;
- social media;
- public videos;
- public chat channels.

Examples that should normally be reported privately include:

- production credential exposure;
- database access;
- unauthorized data modification;
- arbitrary reservation manipulation;
- synchronization protocol abuse;
- injection vulnerabilities;
- sensitive information exposure;
- deployment credential leaks;
- infrastructure configuration that provides unauthorized access.

A public Issue may be appropriate for a general hardening suggestion that does not disclose an exploitable vulnerability.

When uncertain, report privately first.

---

## Expected response process

Security reports are reviewed in good faith.

The target process is:

```text
REPORT RECEIVED
      ↓
INITIAL TRIAGE
      ↓
IMPACT ASSESSMENT
      ↓
REPRODUCTION
      ↓
MITIGATION OR FIX
      ↓
VALIDATION
      ↓
RELEASE
      ↓
COORDINATED DISCLOSURE, WHEN APPROPRIATE
```

The project aims to:

- acknowledge a clear security report within **7 calendar days**;
- perform initial triage as soon as reasonably practical;
- prioritize issues according to impact and exploitability;
- keep the reporter informed when meaningful progress occurs.

These are operational targets, not guaranteed service-level agreements.

MedSupply Relay is currently maintained as a community open source project and does not operate a 24-hour security operations center.

For vulnerabilities with credible immediate risk to the public Community Pilot, mitigation may occur before a complete long-term fix.

Example:

```text
critical exposure
      ↓
temporarily disable affected operation
      ↓
investigate
      ↓
fix
      ↓
validate
      ↓
restore
```

---

## Security priorities

Security work is prioritized according to potential humanitarian and operational impact.

High-priority areas include:

```text
OPERATIONAL DATA INTEGRITY
        ↓
SUPPLY AND DEMAND INTEGRITY
        ↓
RESERVATION INTEGRITY
        ↓
SYNC RELIABILITY
        ↓
SENSITIVE DATA EXPOSURE
        ↓
CREDENTIAL PROTECTION
        ↓
SERVICE AVAILABILITY
```

The project gives special attention to vulnerabilities that could:

- create false medicine supplies;
- create false urgent demands;
- hide valid medicine availability;
- allocate the same supply incorrectly;
- manipulate reservation quantities;
- mark deliveries incorrectly;
- corrupt offline synchronization;
- silently discard field data;
- expose secrets or infrastructure credentials.

---

## High-impact vulnerability examples

Examples of potentially high-impact reports include:

### Unauthorized supply manipulation

A user or automated client can modify another supply record without an intended authorization or business rule.

### Demand manipulation

An attacker can create or alter urgent demand data in a way that significantly changes matching behavior.

### Reservation quantity bypass

A client can reserve more medicine than the currently available quantity.

### Double allocation

Concurrency or race conditions allow the same medicine quantity to be allocated to multiple active reservations.

### Invalid reservation transition

A reservation can bypass required state transitions.

Example:

```text
Pending → Delivered
```

when the current business rules prohibit that transition.

### Delivery replay

Repeating a delivery operation reduces supply or demand quantity more than once.

### Sync data loss

A temporary API, network, or database failure causes local field data to be silently removed.

### Sync status corruption

Failed offline items enter a state from which they can no longer be retried.

### Credential exposure

A database password, deployment profile, cloud token, API key, or other secret is publicly accessible.

### Injection or arbitrary execution

Untrusted input reaches a database, operating system, template engine, or other execution context in an unsafe manner.

---

## Offline synchronization security

Offline synchronization is a core security and reliability boundary.

The expected local status flow is:

```text
pending
   ↓
syncing
   ↓
synced
```

Temporary infrastructure failures may use:

```text
failed
   ↓
retry
   ↓
pending
   ↓
syncing
   ↓
synced
```

Infrastructure failure is not equivalent to a business rejection.

Examples of infrastructure failure:

```text
HTTP 500
timeout
network unavailable
connection reset
database unavailable
temporary provider failure
```

These conditions must not automatically be represented as rejected business items.

Security reports are welcome for issues involving:

- duplicate synchronization;
- replay behavior;
- idempotency failures;
- unauthorized batch modification;
- corrupted queue states;
- failed item loss;
- unsafe automatic retry loops;
- unbounded local log growth;
- inconsistent casing or values that break queue processing.

Do not intentionally flood the public Community Pilot with large synchronization batches to test capacity.

Use a local deployment for destructive or high-volume testing.

---

## Reservation security

Reservation integrity is a core business safety requirement.

The current normal state flow is:

```text
Pending
   ↓
Confirmed
   ↓
InTransit
   ↓
Delivered
```

Cancellation is allowed according to current business rules before transit.

The normal workflow does not allow:

```text
Pending   → InTransit
Pending   → Delivered
Confirmed → Delivered
InTransit → Cancelled
```

Reservation creation and transitions must preserve:

- available quantity;
- active reserved quantity;
- supply quantity;
- demand quantity;
- state transition rules;
- concurrency safety.

Potential reservation vulnerabilities include:

- reserving a negative quantity;
- reserving zero quantity;
- exceeding available stock;
- replaying delivery;
- concurrent double reservation;
- using a supply for an incompatible medicine;
- using an incompatible unit;
- changing a completed reservation unexpectedly;
- bypassing transition validation.

When testing reservation security, use local or isolated test data whenever possible.

---

## Sensitive and medical data

MedSupply Relay is a logistics coordination project.

It is not intended to store patient medical records.

Do not submit real:

- patient names;
- diagnoses;
- medical histories;
- medical images;
- laboratory results;
- identification documents;
- patient contact information;
- clinical records.

This applies to:

```text
security reports
proofs of concept
screenshots
logs
Issues
Pull Requests
test fixtures
demo databases
videos
documentation
```

Use synthetic data.

Example:

```text
Hospital Test Caracas
Operator Demo
Supply Point A
Paracetamol
100 cajas
```

If you discover sensitive information in the public Community Pilot, report it privately.

Do not copy, redistribute, index, or publish the information unnecessarily.

---

## Secrets and credentials

Never commit or publish:

```text
database passwords
connection strings containing passwords
Azure publish profiles
cloud access tokens
GitHub tokens
private keys
service credentials
Supabase passwords
API secrets
certificate private keys
```

Before submitting a Pull Request, consider running:

```bash
git grep -n "Password="
```

and:

```bash
git grep -n "ConnectionStrings"
```

Review the output manually.

The presence of the word `ConnectionStrings` is not automatically a vulnerability.

Example configuration documentation is acceptable:

```text
ConnectionStrings__DefaultConnection
```

A real credential value is not.

If a secret is exposed:

```text
EXPOSURE IDENTIFIED
        ↓
REVOKE OR ROTATE SECRET
        ↓
REMOVE FROM CURRENT SOURCE
        ↓
ASSESS GIT HISTORY
        ↓
REVIEW ACCESS OR LOGS
        ↓
ISSUE NEW CREDENTIAL
```

Deleting a secret from the latest commit does not make an exposed credential trustworthy again.

Rotate or revoke it.

---

## Public API and abuse

The Community Pilot may expose public API operations according to the current MVP architecture.

CORS is not an authorization mechanism.

A client outside the browser may interact directly with publicly reachable endpoints.

Potential abuse reports may include:

- automated creation of false operational data;
- excessive batch submission;
- resource exhaustion;
- reservation spam;
- deliberate matching contamination;
- uncontrolled payload sizes;
- endpoint behavior that enables destructive operations.

The public API status of an endpoint does not mean abuse is accepted.

At the same time, the absence of authentication in the current MVP is a known architectural limitation and should not be reported as a vulnerability by itself without demonstrating additional security impact or bypass of a documented control.

Useful report:

> A single unauthenticated request can permanently modify an existing reservation belonging to another operational record.

Not useful by itself:

> The API has no login.

Authentication, authorization, deployment governance, and instance-specific controls remain roadmap and deployment concerns.

---

## Testing guidelines

Security research should minimize impact.

Prefer this order:

```text
LOCAL ENVIRONMENT
      ↓
ISOLATED TEST DATABASE
      ↓
CONTROLLED TEST DEPLOYMENT
      ↓
PUBLIC COMMUNITY PILOT ONLY WHEN NECESSARY
```

Use the minimum requests required to demonstrate the issue.

Do not:

- destroy unrelated data;
- delete other users' data;
- intentionally create prolonged service interruption;
- perform high-volume denial-of-service testing;
- download large amounts of data;
- access data unrelated to the vulnerability;
- persist unauthorized access;
- install malware;
- attempt lateral movement into unrelated infrastructure;
- use discovered access to target Azure, Cloudflare, Supabase, GitHub, or third-party accounts beyond the minimum necessary to document the issue.

Stop testing when you have enough evidence to report the vulnerability.

---

## Production and Community Pilot testing

Do not perform stress testing, denial-of-service testing, or mass automated write operations against:

```text
https://medrelay.pages.dev
```

or its public production API without prior authorization.

Examples requiring prior authorization:

```text
100,000 sync batches
reservation flooding
connection exhaustion tests
large payload flooding
concurrency storms
automated destructive endpoint enumeration
```

For normal vulnerability validation, use:

```text
small synthetic dataset
minimum number of requests
minimum affected records
```

If the vulnerability can only be reproduced against the Community Pilot, explain this in the private report before performing a high-impact test.

---

## Third-party dependencies

Security reports about project dependencies are welcome when they affect MedSupply Relay.

A useful dependency report should identify:

- package name;
- affected version;
- advisory or CVE, when available;
- whether MedSupply Relay actually uses the vulnerable functionality;
- practical impact;
- recommended upgrade or mitigation.

Do not open a high-severity public alarm based only on a package name appearing in a lock file.

Dependency risk should be evaluated in context.

The frontend uses an npm lock file and clean installation workflows should preserve reproducible dependency resolution.

The backend uses .NET package references and release builds should be validated before publication.

Dependency updates must consider:

- security impact;
- compatibility;
- bundle size;
- old mobile devices;
- offline behavior;
- license compatibility.

---

## Deployment responsibility

MedSupply Relay is open source software.

Organizations may deploy their own instances according to the AGPL-3.0-or-later license and applicable law.

Independent deployers are responsible for evaluating their own:

- authentication requirements;
- authorization rules;
- infrastructure;
- database access;
- secrets management;
- network controls;
- logging;
- monitoring;
- backup strategy;
- retention policies;
- data protection obligations;
- incident response;
- relationships with hospitals, NGOs, shelters, governments, or emergency authorities.

A security configuration appropriate for the public Community Pilot may not be sufficient for an official operational deployment.

For example:

```text
COMMUNITY PILOT
        ≠
NATIONAL EMERGENCY SYSTEM
```

An organization operating MedSupply Relay in a real humanitarian program should perform its own security and governance assessment.

---

## Security fixes and releases

Security fixes may use patch releases.

Example:

```text
v1.0.0
  ↓
security correction
  ↓
v1.0.1
```

A security release may include:

- code fixes;
- configuration guidance;
- migration instructions;
- secret rotation guidance;
- mitigation steps;
- deployment notes.

Public disclosure may be delayed until a reasonable mitigation or fix is available when immediate disclosure would significantly increase risk.

When appropriate, release notes may credit the reporter.

Reporter anonymity will be respected when requested, as reasonably possible.

---

## Security incident handling

A security incident affecting a project-managed deployment may require:

```text
DETECT
  ↓
CONTAIN
  ↓
ASSESS
  ↓
ROTATE CREDENTIALS, WHEN REQUIRED
  ↓
FIX
  ↓
VALIDATE
  ↓
RESTORE
  ↓
DOCUMENT
```

Possible containment actions include:

- disabling an affected endpoint;
- temporarily stopping a deployment;
- rotating credentials;
- revoking deployment access;
- blocking clearly abusive traffic;
- isolating affected infrastructure.

Operational continuity is important.

Data integrity and preventing additional harm may require temporarily limiting a feature.

The Community Pilot does not guarantee uninterrupted availability.

---

## Good-faith research

Good-faith security research is welcome.

The project will distinguish between:

```text
GOOD-FAITH SECURITY RESEARCH
and
MALICIOUS ABUSE
```

Good-faith research generally means:

- attempting to understand or demonstrate a security problem;
- minimizing harm;
- using the minimum data required;
- stopping after sufficient evidence exists;
- reporting the issue privately;
- not using the vulnerability for personal gain or disruption.

This policy is not a legal authorization to access systems, accounts, data, or infrastructure that you do not have permission to access.

Researchers are responsible for complying with applicable law.

When uncertain whether a planned test could create risk, contact the maintainer before testing.

---

## Out of scope behavior

The following are not accepted as security research:

- extortion;
- ransomware;
- credential theft for continued access;
- selling access to project infrastructure;
- deliberate data destruction;
- deliberate service disruption;
- threats to disclose unless paid;
- phishing contributors or maintainers;
- social engineering for credentials;
- attacks against unrelated third-party services;
- publishing real sensitive data;
- intentionally contaminating humanitarian operational data at scale.

A report does not become good-faith research merely because the attacker later describes the activity as a security test.

---

## Security acknowledgements

The MedSupply Relay project values responsible security contributions.

When appropriate and with the reporter's permission, contributors who responsibly disclose valid vulnerabilities may be acknowledged in:

- release notes;
- security advisories;
- project documentation.

Recognition depends on:

- report quality;
- actual security impact;
- responsible disclosure;
- reporter preference.

The project currently does not operate a bug bounty program and does not promise financial rewards for vulnerability reports.

---

## Contact

Project maintainer:

> **Wesley Cordeiro de Araujo**

Security reports:

```text
analistasistemasnet@gmail.com
```

Recommended subject:

```text
MedSupply Relay Security Report
```

GitHub:

```text
https://github.com/wcaraujogithub
```

LinkedIn:

```text
https://www.linkedin.com/in/aisentinelx/
```

---

## Final statement

MedSupply Relay coordinates operational information about medicine supply and demand.

Security failures may affect:

```text
TRUST
DATA INTEGRITY
MATCHING
RESERVATIONS
FIELD COORDINATION
```

Security reports should therefore be treated seriously, responsibly, and with minimum impact.

> **Protect the data.**
>
> **Preserve field work.**
>
> **Report vulnerabilities responsibly.**

**MedSupply Relay**  
**Humanitarian Open Source Project**  
**Community Pilot**

License: `AGPL-3.0-or-later`

Original author and project maintainer: **Wesley Cordeiro de Araujo**
