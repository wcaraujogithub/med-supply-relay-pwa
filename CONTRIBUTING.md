<!--
SPDX-License-Identifier: AGPL-3.0-or-later
Copyright (C) 2026 Wesley Cordeiro de Araujo
See NOTICE for additional attribution and origin notices.
-->

# Contributing to MedSupply Relay

Thank you for considering contributing to **MedSupply Relay**.

MedSupply Relay is a **Humanitarian Open Source Project** focused on emergency medicine supply and demand coordination in environments with unstable connectivity, power outages, limited infrastructure, and operational pressure.

The public reference deployment is presented as the:

> **MedSupply Relay Community Pilot**

This project is developed in the public interest and welcomes contributions from developers, designers, humanitarian professionals, emergency responders, healthcare logistics specialists, translators, security researchers, documentation writers, and community members.

---

# Table of contents

- [Project purpose](#project-purpose)
- [Humanitarian principles](#humanitarian-principles)
- [Community Pilot status](#community-pilot-status)
- [Before contributing](#before-contributing)
- [Ways to contribute](#ways-to-contribute)
- [Repository structure](#repository-structure)
- [Development environment](#development-environment)
- [Backend development](#backend-development)
- [Frontend development](#frontend-development)
- [Offline-first requirements](#offline-first-requirements)
- [Medicine matching rules](#medicine-matching-rules)
- [Reservation rules](#reservation-rules)
- [Internationalization](#internationalization)
- [Security and sensitive data](#security-and-sensitive-data)
- [Creating an issue](#creating-an-issue)
- [Humanitarian needs](#humanitarian-needs)
- [Good first issues](#good-first-issues)
- [Branch naming](#branch-naming)
- [Commit messages](#commit-messages)
- [Pull request process](#pull-request-process)
- [Code quality](#code-quality)
- [Testing requirements](#testing-requirements)
- [Breaking changes](#breaking-changes)
- [Database changes](#database-changes)
- [Dependencies](#dependencies)
- [License and contribution terms](#license-and-contribution-terms)
- [Authorship and attribution](#authorship-and-attribution)
- [Code of Conduct](#code-of-conduct)
- [Security vulnerabilities](#security-vulnerabilities)
- [Maintainer review](#maintainer-review)

---

# Project purpose

MedSupply Relay exists to answer a simple operational question:

> **Where are medicines available, and who urgently needs them?**

The system connects:

```text
AVAILABLE MEDICINE SUPPLY
            |
            v
       MATCHING ENGINE
            |
            v
  OPEN MEDICINE DEMAND
            |
            v
      RESERVATION FLOW
            |
            v
   COORDINATED DELIVERY
```

The project was designed for scenarios where:

- internet connectivity may be unstable;
- mobile networks may be limited to poor 2G or 3G connections;
- electricity may be unavailable;
- volunteers may use old or low-end devices;
- operators may be working under severe pressure;
- hospitals and medical points may have urgent medicine shortages;
- shelters, warehouses, NGOs, donors, and support points may hold available supplies.

The application must remain:

- lightweight;
- understandable;
- operationally simple;
- offline-first;
- resilient to temporary infrastructure failures.

# Humanitarian principles

Contributions should prioritize the needs of people operating in emergency situations.

When proposing or implementing a change, ask:

- Does this help an operator complete an urgent task faster?
- Does this reduce the chance of losing information?
- Does this continue working with poor connectivity?
- Does this work on a small mobile screen?
- Does this introduce unnecessary complexity?
- Does this create a new dependency on permanent connectivity?
- Could this confuse an exhausted volunteer?
- Could this expose sensitive personal or medical information?

A technically impressive feature is not automatically a good humanitarian feature.

Prefer:

- simple;
- clear;
- resilient;
- small;
- offline-capable.

Over:

- complex;
- heavy;
- decorative;
- infrastructure-dependent.

# Community Pilot status

The public reference deployment is a:

> **Community Pilot**

The Community Pilot is intended to:

- demonstrate the project;
- validate field workflows;
- receive community feedback;
- test offline-first behavior;
- identify operational risks;
- help organizations evaluate the software;
- attract contributors.

The Community Pilot is not an official emergency service.

MedSupply Relay does not represent governments, hospitals, international organizations, NGOs, or emergency response authorities unless an explicit relationship is publicly documented.

Data registered in the public Community Pilot is not officially verified.

Do not describe the public Community Pilot as:

- an official Venezuela emergency platform;
- a government system;
- an official hospital network;
- an official humanitarian organization;
- a guaranteed medical supply system.

# Before contributing

Before opening a Pull Request:

- Read this `CONTRIBUTING.md`.
- Read `README.md`.
- Read `ROADMAP.md`.
- Read `CODE_OF_CONDUCT.md`.
- Read `SECURITY.md`.
- Search existing Issues.
- Check whether a similar Pull Request already exists.

For large changes, open an Issue before implementing the solution.

Examples of large changes:

- authentication;
- authorization;
- patient data;
- new database entities;
- medicine catalog integration;
- geographic maps;
- routing engines;
- external hospital integrations;
- major sync protocol changes;
- replacing IndexedDB;
- changing the matching algorithm;
- changing reservation state transitions;
- new infrastructure dependencies.

Do not spend several days implementing a large feature before discussing it with the maintainers.

# Ways to contribute

You can contribute through:

## Code

- backend improvements;
- frontend improvements;
- offline resilience;
- accessibility;
- mobile UX;
- performance;
- tests;
- security hardening.

## Documentation

- improve installation instructions;
- improve architecture documentation;
- translate technical documentation;
- add operational examples;
- improve emergency workflow explanations.

## Humanitarian requirements

People with field experience can help identify:

- missing operational rules;
- inappropriate terminology;
- unrealistic emergency workflows;
- barriers for volunteers;
- accessibility problems;
- regional requirements.

## Translation

The application currently prioritizes:

- Spanish;
- Portuguese.

Additional languages may be proposed through Issues.

## Testing

Testing on real devices is highly valuable.

Useful environments include:

- old Android devices;
- low-memory smartphones;
- slow networks;
- intermittent Wi-Fi;
- mobile network instability;
- offline mode;
- power-saving mode.

# Repository structure

MedSupply Relay currently uses separate backend and frontend repositories.

## Backend

Repository:

<https://github.com/wcaraujogithub/MedSupplyRelay>

Primary technology:

- .NET 8;
- ASP.NET Core Minimal APIs;
- Entity Framework Core;
- PostgreSQL;
- Npgsql.

Main project:

```text
MedSupplyRelay.Api
```

The backend follows a lightweight Vertical Slice structure.

Example:

```text
Features/
|-- Demands/
|-- Export/
|-- Locations/
|-- Matches/
|-- Reservations/
`-- Sync/
```

The backend intentionally does not use a heavy application framework for the MVP.

Do not introduce MediatR, message brokers, distributed cache, or additional architectural layers without an approved Issue and clear operational justification.

## Frontend

Repository:

<https://github.com/wcaraujogithub/med-supply-relay-pwa>

Primary technology:

- React;
- TypeScript;
- Vite;
- PWA;
- Service Worker;
- IndexedDB;
- Dexie.

Important areas include:

```text
src/
|-- config/
|-- db/
|-- features/
|-- i18n/
|-- shared/
`-- styles.css
```

The frontend is intentionally lightweight.

Avoid introducing large UI frameworks without prior discussion.

# Development environment

Recommended tools:

- Git;
- Node.js;
- npm;
- .NET 8 SDK;
- PostgreSQL-compatible database;
- Visual Studio, Rider, or VS Code.

Clone the appropriate repository.

Example:

```bash
git clone https://github.com/wcaraujogithub/MedSupplyRelay.git
```

Or:

```bash
git clone https://github.com/wcaraujogithub/med-supply-relay-pwa.git
```

Create a branch before making changes.

# Backend development

Navigate to the API project.

Example:

```bash
cd MedSupplyRelay.Api
```

Restore dependencies:

```bash
dotnet restore
```

Build:

```bash
dotnet build
```

Release build:

```bash
dotnet build -c Release
```

Run:

```bash
dotnet run
```

The application requires a PostgreSQL connection string.

Use .NET User Secrets for local development.

Example:

```bash
dotnet user-secrets set \
  "ConnectionStrings:DefaultConnection" \
  "YOUR_POSTGRES_CONNECTION_STRING"
```

Never commit a real connection string.

Never commit:

- database passwords;
- Azure publish profiles;
- Supabase passwords;
- API keys;
- tokens;
- private certificates;
- service credentials.

The health endpoint is:

```http
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "service": "med-supply-relay-api",
  "environment": "Development"
}
```

# Frontend development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

For a clean dependency validation, use:

```bash
npm ci
npm run build
```

The API URL is configured through:

```text
VITE_API_BASE_URL
```

Example:

```env
VITE_API_BASE_URL=http://localhost:5484
```

Do not commit production credentials.

The API base URL is not considered a secret, but environment-specific configuration should remain clearly separated from source code.

# Offline-first requirements

Offline-first behavior is a core project requirement.

A contribution must not assume permanent internet connectivity.

The expected workflow is:

```text
USER CREATES DATA
        |
        v
INDEXEDDB
        |
        v
PENDING
        |
        v
NETWORK AVAILABLE
        |
        v
SYNCING
        |
        v
API
        |
        v
SYNCED
```

When infrastructure is temporarily unavailable:

```text
SYNC ATTEMPT
      |
      v
FAILURE
      |
      v
LOCAL DATA PRESERVED
      |
      v
FAILED
      |
      v
RETRY
      |
      v
PENDING
      |
      v
SYNCING
      |
      v
SYNCED
```

A network or database failure must not silently discard local data.

Infrastructure failure is not the same as a business rejection.

Example:

```text
HTTP 500
database offline
timeout
network error
```

Must be treated as:

```text
SYNC FAILURE
```

Not:

```text
ITEM REJECTION
```

A business rejection occurs when the API processes the request and explicitly rejects an item according to a validation or business rule.

Do not change these semantics without discussing the sync protocol with the maintainers.

# Medicine matching rules

The MVP matching engine currently evaluates available supply and open demand.

Important matching rules include:

- Demand status = Open;
- Supply status = Available;
- Medicine compatible;
- Unit compatible;
- Available quantity > 0;
- Supply location != Demand location;
- Expired supply excluded.

Medicine compatibility currently supports normalized medicine names and compatible medicine codes.

Critical demand has operational priority.

The current recommendation engine may calculate:

- `viabilityScore`;
- `recommended`;
- `recommendationReasons`.

Only the best candidate for a demand should be marked as the primary recommended option according to the current recommendation rules.

Do not modify matching behavior without:

- explaining the operational problem;
- documenting the proposed rule;
- adding or updating tests;
- verifying that the change does not hide valid supply options.

# Reservation rules

Reservations protect available medicine stock from double allocation.

The current normal state flow is:

```text
Pending
   |
   v
Confirmed
   |
   v
InTransit
   |
   v
Delivered
```

Cancellation is allowed before the reservation enters transit:

```text
Pending   -> Cancelled
Confirmed -> Cancelled
```

The normal workflow does not allow:

```text
Pending   -> InTransit
Pending   -> Delivered
Confirmed -> Delivered
InTransit -> Cancelled
```

A delivered reservation reduces:

- Supply quantity;
- Demand quantity.

When demand quantity reaches zero:

```text
DemandStatus = Fulfilled
```

When available supply is exhausted, the supply status must reflect the current business rules.

Reservation creation and state transitions contain concurrency protections.

Do not remove transaction isolation or concurrency protection without a technical design discussion.

# Internationalization

The application currently supports:

- Spanish;
- Portuguese.

Spanish is the default application language.

New user-visible text must not be hardcoded directly into React components unless there is an approved technical reason.

Use the i18n message system.

Example:

```ts
t('matches.title')
```

Add equivalent messages for:

- `es`;
- `pt`.

Internal business values must remain stable across languages.

Example:

```text
Critical
High
Medium
Low
```

Display labels may be translated.

Internal values should not change according to the selected language.

The same principle applies to canonical identifiers used by matching and synchronization.

# Security and sensitive data

MedSupply Relay is a logistics coordination tool.

It is not intended to store patient medical records.

Do not introduce fields for:

- patient names;
- diagnoses;
- medical histories;
- national identification documents;
- clinical records;
- medical images;
- laboratory reports;
- patient contact information.

Free-text fields must not encourage operators to enter sensitive patient or clinical data.

User-facing copy should reinforce:

> Register logistical information only.

Do not log secrets.

Do not log database passwords.

Do not log full connection strings.

Do not expose stack traces to public users.

Do not include sensitive information in:

- README files;
- Issues;
- Pull Requests;
- screenshots;
- test fixtures;
- demo databases;
- commit history.

Use synthetic data for development and screenshots.

Example:

```text
Hospital Test Mobile
Refugio Demo Caracas
Paracetamol
100 caixas
```

Do not use real patient information.

# Creating an issue

Search existing Issues before creating a new Issue.

Choose the appropriate Issue template.

## Bug

Use the Bug template when something is not working according to the documented behavior.

Provide:

- affected component;
- device or operating system;
- browser;
- online or offline state;
- reproduction steps;
- expected result;
- actual result;
- screenshots when appropriate.

Never include credentials or sensitive data.

## Feature

Use the Feature template for technical or product proposals.

Explain:

- the problem;
- who experiences the problem;
- why the current workflow is insufficient;
- the minimum proposed solution.

Avoid proposing technology without explaining the operational problem.

Bad proposal:

```text
Add Kafka.
```

Better proposal:

```text
During a high-volume regional operation, batch processing blocks API responses for field devices. We need to separate ingestion from processing.
```

## Humanitarian need

Use the Humanitarian Need template when the requirement originates from field operations, emergency logistics, hospitals, shelters, NGOs, or humanitarian coordination.

Explain the real operational situation before proposing a software implementation.

# Humanitarian needs

Humanitarian requirements receive special attention.

A Humanitarian Need Issue should describe:

```text
LOCATION OR CONTEXT
        |
        v
FIELD PROBLEM
        |
        v
CURRENT WORKAROUND
        |
        v
RISK
        |
        v
MINIMUM SOFTWARE SUPPORT NEEDED
```

Example:

**Context:**
Medical teams operate between temporary shelters with unstable mobile signal.

**Problem:**
Supply teams cannot confirm whether medicine was already reserved before leaving for pickup.

**Current workaround:**
Teams call each shelter manually.

**Risk:**
Two teams may travel to collect the same medicine.

**Minimum need:**
A reservation state visible to coordination teams.

Do not assume every humanitarian need requires a new feature.

Sometimes the correct solution is:

- documentation;
- clearer copy;
- better UX;
- an export;
- an operational rule.

# Good first issues

Issues labeled:

```text
good first issue
```

Are intended for contributors who are new to the project.

A good first issue should:

- have limited scope;
- identify relevant files;
- explain expected behavior;
- avoid major architectural changes;
- include acceptance criteria.

Examples:

- Improve empty-state copy;
- Add missing i18n message;
- Improve keyboard accessibility;
- Add a unit test for normalization;
- Document a development workflow;
- Improve Help page screenshot descriptions.

New contributors are encouraged to comment on the Issue before starting work.

Example:

```text
I would like to work on this issue.
```

A maintainer may confirm assignment or provide additional context.

# Branch naming

Use lowercase branch names.

Recommended patterns:

```text
feature/<short-description>
fix/<short-description>
docs/<short-description>
security/<short-description>
refactor/<short-description>
test/<short-description>
chore/<short-description>
```

Examples:

```text
feature/add-demand-filter
fix/sync-retry-status
docs/improve-offline-guide
security/sanitize-sync-errors
test/reservation-concurrency
```

Avoid:

```text
my-branch
teste
new
final
final-final
wesley-update
```

# Commit messages

Use clear, imperative, scoped commit messages.

Recommended format:

```text
type: description
```

Examples:

```text
feat: add area filter to matches
fix: prevent sync retry loop
docs: improve humanitarian workflow guide
security: remove technical error details from public response
test: cover reservation concurrency conflict
refactor: centralize client identifier generation
chore: prepare frontend release metadata
```

Recommended types:

- `feat`;
- `fix`;
- `docs`;
- `security`;
- `test`;
- `refactor`;
- `chore`;
- `build`;
- `ci`.

Keep commits focused.

Avoid mixing:

- new feature;
- database migration;
- CSS rewrite;
- README update;
- dependency upgrade.

In the same commit unless the changes are inseparable.

# Pull request process

Before opening a Pull Request:

```bash
git status
```

Confirm that no secret or unrelated file is included.

Run the appropriate build.

Backend:

```bash
dotnet build -c Release
```

Frontend:

```bash
npm ci
npm run build
```

The Pull Request must explain:

- What problem does this solve?
- Why is this change needed?
- What was changed?
- How was it tested?
- Does it affect offline behavior?
- Does it affect synchronization?
- Does it affect matching?
- Does it affect reservations?
- Does it affect personal or sensitive data?
- Are screenshots needed?

Keep Pull Requests small whenever possible.

Prefer:

```text
1 operational problem
        |
        v
1 focused solution
        |
        v
1 reviewable Pull Request
```

Large Pull Requests may be requested to be split.

# Code quality

Code should prioritize readability.

Avoid unnecessary abstractions.

Do not introduce patterns only because they are popular.

For the MVP architecture:

```text
simple code > architectural ceremony
```

But:

```text
unsafe shortcut < correct operational behavior
```

Backend code should:

- use nullable reference types correctly;
- preserve cancellation tokens where applicable;
- avoid unnecessary database queries;
- preserve transaction safety;
- use asynchronous database operations;
- avoid exposing infrastructure exception details publicly.

Frontend code should:

- maintain TypeScript type safety;
- avoid `any` unless technically justified;
- preserve mobile usability;
- preserve offline behavior;
- use the existing i18n system;
- avoid unnecessary dependencies;
- avoid blocking the entire Home because one secondary component is loading.

Do not disable compiler or lint rules simply to make a Pull Request compile.

# Testing requirements

Every contribution must be tested according to its scope.

## Backend minimum

```bash
dotnet build -c Release
```

For business rule changes, test:

- valid case;
- invalid case;
- boundary condition.

For reservation changes, consider:

- concurrency;
- duplicated action;
- invalid state transition;
- available quantity.

For sync changes, consider:

- API online;
- API unavailable;
- database unavailable;
- retry;
- duplicate batch;
- partial acceptance;
- rejection.

## Frontend minimum

```bash
npm ci
npm run build
```

When UI behavior changes, test:

- desktop;
- mobile viewport;
- Spanish;
- Portuguese.

For offline-related changes, test:

```text
ONLINE
  |
  v
LOAD APPLICATION
  |
  v
OFFLINE
  |
  v
CREATE DATA
  |
  v
CLOSE APPLICATION
  |
  v
REOPEN
  |
  v
VERIFY LOCAL DATA
  |
  v
ONLINE
  |
  v
VERIFY SYNCHRONIZATION
```

Testing on a real mobile device is strongly encouraged.

# Breaking changes

Breaking changes require an Issue before implementation.

Examples:

- changing API endpoint paths;
- changing sync payload contracts;
- changing ClientOperationId semantics;
- changing reservation statuses;
- changing canonical unit values;
- renaming database columns;
- removing API response fields;
- changing IndexedDB store names;
- changing local sync status values.

The current offline sync system depends on stable contracts.

A seemingly simple rename can leave offline records unable to synchronize.

Breaking changes must include a migration or backward compatibility strategy.

# Database changes

Database model changes must include an Entity Framework Core migration when applicable.

Do not modify an existing production migration after it has been released.

Create a new migration.

Review generated migration code before committing.

A database Pull Request should explain:

- new table?
- new column?
- nullable?
- default value?
- index?
- unique constraint?
- foreign key?
- impact on existing data?

Never place real production data in migrations or test fixtures.

# Dependencies

MedSupply Relay intentionally keeps dependencies limited.

Before adding a new dependency, explain:

- What problem does it solve?
- Why cannot the existing code solve it reasonably?
- What is the package size impact?
- Does it affect old mobile devices?
- Does it affect offline operation?
- Is the project actively maintained?
- What license does it use?
- Is the license compatible with this project?

Do not add a large UI library to implement a single button, modal, or pagination component.

Do not introduce infrastructure components without an operational requirement.

Examples requiring prior discussion:

- Redis;
- RabbitMQ;
- Kafka;
- Elasticsearch;
- Kubernetes;
- external workflow engines;
- new cloud services.

# License and contribution terms

MedSupply Relay is licensed under:

```text
GNU Affero General Public License v3.0 or later
```

SPDX identifier:

```text
AGPL-3.0-or-later
```

By submitting a contribution to this project, you confirm that:

- you have the right to submit the contribution;
- the contribution may be distributed as part of MedSupply Relay under the project's AGPL-3.0-or-later license;
- you understand that accepted contributions become part of the public project history.

Do not submit code copied from projects with incompatible licenses.

Do not submit proprietary source code without authorization.

Third-party code must retain required license and copyright notices.

When introducing a third-party dependency, verify and document its license.

# Authorship and attribution

MedSupply Relay was originally created by:

> **Wesley Cordeiro de Araujo**

The project copyright, license, NOTICE, and attribution files must be preserved according to the project's license and applicable law.

Contributors retain recognition for their own contributions through the Git history, Pull Requests, and project contribution records.

Contributing to the project does not authorize anyone to:

- remove original copyright notices;
- remove the project license;
- remove required NOTICE information;
- falsely claim to be the original creator of MedSupply Relay;
- misrepresent the origin of the project.

At the same time, contributors must be treated with respect and receive appropriate recognition for their work.

The project values both:

- original project authorship;
- community contribution history.

# Code of Conduct

All contributors must follow:

```text
CODE_OF_CONDUCT.md
```

Harassment, discrimination, personal attacks, intimidation, or abusive behavior are not accepted.

Technical disagreement is normal.

Personal attacks are not.

Discuss:

- code;
- architecture;
- requirements;
- risks;
- evidence.

Do not attack people.

# Security vulnerabilities

Do not publish suspected security vulnerabilities as public Issues when disclosure could create immediate risk.

Read:

```text
SECURITY.md
```

Examples include:

- credential exposure;
- unauthorized data modification;
- injection vulnerabilities;
- sensitive data exposure;
- deployment credential leaks;
- dependency compromise;
- sync protocol abuse;
- reservation manipulation.

Follow the private reporting process documented in `SECURITY.md`.

Never include real credentials in a vulnerability report.

# Maintainer review

The original project maintainer is:

> **Wesley Cordeiro de Araujo**

Project links:

- GitHub: <https://github.com/wcaraujogithub>
- LinkedIn: <https://www.linkedin.com/in/aisentinelx/>

Maintainer review may evaluate:

- humanitarian relevance;
- MVP scope;
- operational simplicity;
- offline compatibility;
- security;
- data protection;
- maintainability;
- licensing;
- backward compatibility.

A Pull Request may be technically correct and still not be accepted if it significantly increases operational complexity without a demonstrated humanitarian need.

Rejection of a Pull Request is not a rejection of the contributor.

Maintainers should explain important architectural decisions whenever practical.

# Thank you

MedSupply Relay exists because emergency logistics should not stop simply because connectivity becomes unstable.

The connection may fail. Field work does not have to stop.

Thank you for helping build technology that may support people working under difficult conditions.

```text
MedSupply Relay
Humanitarian Open Source Project
Community Pilot

License: AGPL-3.0-or-later

Original author: Wesley Cordeiro de Araujo
```

## Minha decisao sobre esse arquivo

Eu considero esse `CONTRIBUTING.md` ja no padrao da comunidade que estamos tentando formar.

Ele deixa claro:

```text
quem pode contribuir
como contribuir
escopo humanitario
Community Pilot
arquitetura atual
offline-first e regra central
matching
reservas
i18n
seguranca
dados sensiveis
padrao de branches
commits
PR
testes
breaking changes
migrations
dependencias
AGPL
autoria original
reconhecimento dos contribuidores
```
