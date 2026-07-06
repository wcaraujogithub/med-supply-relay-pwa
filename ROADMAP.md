<!--
SPDX-License-Identifier: AGPL-3.0-or-later
Copyright (C) 2026 Wesley Cordeiro de Araujo
See NOTICE for additional attribution and origin notices.
-->

# MedSupply Relay Roadmap

## Humanitarian Open Source Project

**MedSupply Relay** is a humanitarian open source project focused on medicine supply and demand coordination in environments with unstable connectivity, limited infrastructure, power interruptions, and operational pressure.

The public reference deployment is presented as:

> **MedSupply Relay Community Pilot**

The project follows a deliberate principle:

> **Build only what is required to preserve field work, data integrity, and operational clarity.**

This roadmap is not a promise that every listed idea will be implemented.

Priorities may change according to:

- validated humanitarian needs;
- field feedback;
- security findings;
- operational risk;
- contributor capacity;
- deployment experience;
- maintenance cost.

The project intentionally avoids feature growth without a clear operational reason.

---

## Table of contents

- [Roadmap principles](#roadmap-principles)
- [Current project status](#current-project-status)
- [Version 1.0.0 — Community Pilot](#version-100--community-pilot)
- [Current release policy](#current-release-policy)
- [Immediate community phase](#immediate-community-phase)
- [Priority themes](#priority-themes)
- [Offline-first and synchronization](#offline-first-and-synchronization)
- [Matching and recommendations](#matching-and-recommendations)
- [Reservation safety](#reservation-safety)
- [Security and public deployment hardening](#security-and-public-deployment-hardening)
- [Data protection and privacy](#data-protection-and-privacy)
- [Humanitarian field validation](#humanitarian-field-validation)
- [Accessibility and low-end devices](#accessibility-and-low-end-devices)
- [Internationalization](#internationalization)
- [Observability and operations](#observability-and-operations)
- [Deployment and self-hosting](#deployment-and-self-hosting)
- [Testing and quality](#testing-and-quality)
- [Documentation and community](#documentation-and-community)
- [Potential future capabilities](#potential-future-capabilities)
- [Explicitly deferred capabilities](#explicitly-deferred-capabilities)
- [How roadmap decisions are made](#how-roadmap-decisions-are-made)
- [Issue labels and roadmap flow](#issue-labels-and-roadmap-flow)
- [What is not a roadmap commitment](#what-is-not-a-roadmap-commitment)
- [How to propose roadmap changes](#how-to-propose-roadmap-changes)
- [Maintainer note](#maintainer-note)

---

## Roadmap principles

MedSupply Relay is not guided by the number of features delivered.

It is guided by the operational value of the smallest reliable workflow.

Every roadmap proposal should be evaluated against the following questions:

1. Does this solve a real medicine logistics problem?
2. Does this preserve operation during connectivity failures?
3. Does this reduce field data loss?
4. Does this improve supply, demand, matching, reservation, or delivery coordination?
5. Does this reduce the chance of duplicate allocation?
6. Does this work on a small mobile device?
7. Can an exhausted operator understand the workflow quickly?
8. Does this introduce a permanent dependency on internet connectivity?
9. Does this create new sensitive-data risk?
10. Does this increase maintenance burden without proportional humanitarian value?

The project prefers:

```text
FIELD NEED
   ↓
MINIMUM SAFE CHANGE
   ↓
TEST
   ↓
VALIDATE
   ↓
RELEASE
```

over:

```text
TECHNOLOGY IDEA
   ↓
LARGE FEATURE
   ↓
COMPLEXITY
   ↓
SEARCH FOR A PROBLEM
```

---

## Current project status

The MedSupply Relay Community Pilot reached its first operational MVP.

Current public architecture:

```text
FIELD DEVICE
    ↓
React + TypeScript PWA
    ↓
IndexedDB / Dexie
    ↓
Offline queue
    ↓
Synchronization
    ↓
.NET 8 Minimal API
    ↓
PostgreSQL
```

Current public components include:

```text
Frontend
Cloudflare Pages

Backend
Azure App Service

Database
PostgreSQL-compatible managed database
```

The public Community Pilot is not an official emergency service.

The public deployment exists as a reference environment for:

- testing;
- demonstration;
- community feedback;
- operational validation;
- contributor onboarding.

---

## Version 1.0.0 — Community Pilot

Version `1.0.0` represents the first validated Community Pilot release.

The MVP includes the following completed capability areas.

### Backend foundation

Status:

```text
COMPLETE
```

Includes:

- .NET 8;
- ASP.NET Core Minimal APIs;
- PostgreSQL;
- Entity Framework Core;
- lightweight Vertical Slice organization;
- health endpoint;
- response compression;
- production error handling.

### Core data model

Status:

```text
COMPLETE
```

Core entities include:

```text
ReliefLocation
SupplyItem
DemandItem
SyncBatch
MatchReservation
```

### Offline synchronization

Status:

```text
COMPLETE
```

Includes:

- local IndexedDB storage;
- local supply and demand creation;
- batch synchronization;
- idempotent batch processing;
- local sync states;
- failure persistence;
- transient failure retry;
- synchronization issue visibility;
- failed-item recovery;
- infrastructure failure semantics separated from business rejection.

### Medicine supply flow

Status:

```text
COMPLETE
```

Operators can register available medicine supply.

The application preserves local information before synchronization.

### Medicine demand flow

Status:

```text
COMPLETE
```

Operators can register medicine demand and urgency.

Critical needs participate in matching priority rules.

### Matching engine

Status:

```text
COMPLETE
```

Current matching considers:

```text
Open demand
Available supply
Compatible medicine
Compatible unit
Available quantity
Different locations
Expiration rules
```

Matching may include:

```text
Distance
Viability score
Recommended match
Recommendation reasons
```

### Reservation engine

Status:

```text
COMPLETE
```

The current reservation lifecycle supports:

```text
Pending
   ↓
Confirmed
   ↓
InTransit
   ↓
Delivered
```

Cancellation follows the documented business rules.

Reservation availability considers active reservations.

Concurrency protection exists to reduce double allocation risk.

### Operations experience

Status:

```text
COMPLETE
```

The PWA includes operational views for:

- matches;
- active reservations;
- reservation history;
- exports;
- sync issues.

### Export and contingency

Status:

```text
COMPLETE
```

Operational match data can be exported in:

```text
CSV
TXT
```

Exports are reservation-aware.

### Internationalization

Status:

```text
COMPLETE
```

Current application languages:

```text
Spanish
Portuguese
```

Spanish is the default application language.

### Community Pilot positioning

Status:

```text
COMPLETE
```

The public deployment is clearly presented as:

> **MedSupply Relay Community Pilot**

The public deployment is not presented as:

- an official government system;
- an official hospital network;
- an official NGO platform;
- an official emergency authority system.

The application also warns operators not to register sensitive patient or clinical information.

---

## Current release policy

After the `v1.0.0` Community Pilot release, the project enters a stabilization and community phase.

The default policy is:

```text
NO FEATURE GROWTH BY DEFAULT
```

Changes should prioritize:

```text
REAL BUGS
SECURITY
DATA INTEGRITY
OFFLINE RELIABILITY
OPERATIONAL CLARITY
ACCESSIBILITY
DOCUMENTATION
```

A new feature should normally require:

```text
Issue
  ↓
Operational problem
  ↓
Humanitarian relevance
  ↓
Maintainer/community discussion
  ↓
Acceptance criteria
```

There is no automatic `MSR-21` feature module merely because `MSR-20` is complete.

Version numbers and roadmap stages are not used to force artificial feature expansion.

---

## Immediate community phase

The immediate phase after `v1.0.0` focuses on opening the project to contributors.

### Community health files

Status:

```text
IN PROGRESS
```

Planned files:

```text
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
ROADMAP.md
```

### GitHub Issue Forms

Planned:

```text
.github/ISSUE_TEMPLATE/bug.yml
.github/ISSUE_TEMPLATE/feature.yml
.github/ISSUE_TEMPLATE/humanitarian-need.yml
.github/ISSUE_TEMPLATE/config.yml
```

### Pull Request template

Planned:

```text
.github/pull_request_template.md
```

### Initial contributor labels

Planned labels include:

```text
good first issue
help wanted
humanitarian-priority
offline-first
backend
frontend
documentation
security
bug
accessibility
i18n
```

### GitHub Discussions

The project may use GitHub Discussions for:

- community introductions;
- operational questions;
- field feedback;
- architecture discussions;
- contributor coordination.

Bugs and actionable implementation work should remain in GitHub Issues.

---

## Priority themes

The roadmap is organized by priority themes rather than a fixed list of mandatory features.

Current priority order:

```text
1. Data integrity
2. Offline reliability
3. Reservation safety
4. Security
5. Field usability
6. Accessibility
7. Documentation
8. Community onboarding
9. Self-hosting clarity
10. Validated new capabilities
```

A lower-priority feature may be delayed when a higher-priority reliability or security concern exists.

---

## Offline-first and synchronization

Offline-first behavior remains a permanent project requirement.

The target principle is:

> **A connection failure must not force field work to stop.**

Current stable flow:

```text
CREATE LOCALLY
      ↓
PENDING
      ↓
SYNCING
      ↓
SYNCED
```

Transient failure flow:

```text
SYNC ATTEMPT
      ↓
INFRASTRUCTURE FAILURE
      ↓
FAILED
      ↓
RETRY
      ↓
PENDING
      ↓
SYNCING
      ↓
SYNCED
```

Potential future work in this theme may include:

- additional automated sync integrity tests;
- explicit sync protocol documentation;
- stronger duplicate-item diagnostics;
- queue migration tests;
- controlled local recovery tools;
- improved operational copy for rare sync states;
- compatibility tests for old stored IndexedDB records.

Any sync change must preserve:

- local data;
- retry ability;
- stable status values;
- idempotency semantics;
- distinction between infrastructure failures and business rejections.

### Not currently planned

The project does not currently plan to replace IndexedDB with another local persistence technology without validated evidence of a field problem.

The project does not currently plan to require permanent WebSocket connectivity.

The project does not currently plan to make sync depend on a message broker.

---

## Matching and recommendations

The matching engine currently solves the initial operational problem:

> Find compatible available medicine supply for open medicine demand.

Current matching rules are intentionally understandable.

Potential future work may include:

- stronger normalization tests;
- medicine code compatibility validation;
- better explanation of recommendation scores;
- matching quality test datasets;
- documented edge cases;
- configurable matching policies for independent deployments.

Any matching evolution should avoid creating an opaque system that operators cannot understand.

A recommended future rule should answer:

```text
WHY DID THIS MATCH?
WHY WAS THIS RECOMMENDED?
WHY WAS ANOTHER OPTION NOT RECOMMENDED?
```

### Artificial intelligence

AI is not a current requirement for the matching engine.

The project will not add AI only for marketing value.

An AI-assisted capability would require:

- a validated operational problem;
- explainability;
- failure behavior;
- cost analysis;
- offline impact analysis;
- security and data protection review.

Deterministic rules remain preferable when they solve the problem clearly.

---

## Reservation safety

Reservation integrity remains a permanent priority.

Potential future work may include:

- more automated concurrency tests;
- reservation replay tests;
- transition matrix documentation;
- stronger auditability of operational transitions;
- clearer quantity history;
- deployment-specific reservation permissions.

The project should continue protecting against:

```text
DOUBLE ALLOCATION
INVALID QUANTITY
INVALID TRANSITION
DELIVERY REPLAY
INCOMPATIBLE MEDICINE
INCOMPATIBLE UNIT
```

Any change that reduces transaction or concurrency safety requires strong technical justification.

---

## Security and public deployment hardening

The Community Pilot currently has known architectural limitations appropriate to its pilot stage.

Security work should focus on real impact.

Priority security themes include:

- API abuse resistance;
- payload size limits;
- rate-control strategy;
- write-operation protection;
- secret management;
- deployment credential hygiene;
- security headers;
- public error sanitization;
- dependency monitoring;
- auditability;
- controlled incident response.

### Authentication and authorization

Authentication is not automatically the next feature.

The correct access-control model depends on the deployment context.

Example:

```text
COMMUNITY PILOT
        ↓
public reference deployment

NGO DEPLOYMENT
        ↓
organization operators

HOSPITAL NETWORK
        ↓
institution-specific roles

GOVERNMENT DEPLOYMENT
        ↓
formal identity and governance
```

A future access-control design should not assume that one identity model fits every humanitarian deployment.

Potential future work may include:

- deployment-configurable authentication;
- operator identity;
- organization scopes;
- role or capability policies;
- protected write operations.

These are subject to architectural discussion and field requirements.

### Public API abuse

The Community Pilot should continue evaluating:

- automated false supply creation;
- automated false demand creation;
- reservation spam;
- batch flooding;
- resource exhaustion.

Mitigation should be proportional.

The project should not introduce a large distributed security architecture before the actual threat and traffic model is understood.

---

## Data protection and privacy

MedSupply Relay is a logistics coordination tool.

It is not a patient medical record system.

Current direction:

```text
LOGISTICS DATA
      ✅

PATIENT MEDICAL RECORDS
      ❌
```

Priority work may include:

- improved free-text guidance;
- reducing unnecessary personal-data fields;
- deployment documentation for data retention;
- data classification documentation;
- deletion and retention guidance for independent deployers;
- privacy review of future features.

The project should continue discouraging registration of:

- patient names;
- diagnoses;
- medical histories;
- clinical images;
- laboratory results;
- personal identification documents.

A feature involving patient or clinical data would require a major governance, privacy, security, and legal review.

It is not part of the current roadmap.

---

## Humanitarian field validation

The most valuable future roadmap input is real operational feedback.

The project welcomes feedback from:

- emergency logistics teams;
- hospitals;
- shelters;
- medicine donation networks;
- NGOs;
- humanitarian coordinators;
- pharmacists;
- field volunteers.

Field validation questions include:

1. Is medicine registration fast enough?
2. Are the unit values understandable?
3. Are operators confused by supply and demand terminology?
4. Is the reservation lifecycle realistic?
5. Does the app remain understandable under stress?
6. Are exports useful during connectivity or infrastructure failure?
7. Are there missing operational states?
8. Are the current contact fields appropriate?
9. Are old or low-end devices usable?
10. Are there region-specific medicine logistics requirements?

Field feedback should be documented through the `humanitarian-need` Issue Form.

The project should not claim field validation that has not actually occurred.

---

## Accessibility and low-end devices

Accessibility and old-device compatibility are part of humanitarian usability.

Potential work includes:

- keyboard navigation improvements;
- screen reader labeling;
- focus management;
- contrast review;
- text scaling validation;
- low-memory device testing;
- older Android testing;
- slow CPU testing;
- low-bandwidth build optimization.

The project should avoid:

- large animation frameworks;
- decorative video backgrounds;
- large font packages without justification;
- heavy UI component libraries;
- unnecessary client-side analytics.

Performance work should prioritize field usability rather than benchmark competition.

---

## Internationalization

Current supported application languages:

```text
Spanish
Portuguese
```

Spanish remains the default application language.

Potential future language support may be proposed based on actual deployment or contributor needs.

A new language contribution should include:

- complete required UI messages;
- consistent operational terminology;
- review by a fluent or native speaker when possible.

The project should avoid partial translations that create mixed-language critical workflows.

Internal canonical values must remain stable across languages.

Translation must not change:

- sync status values;
- reservation status values;
- identifiers;
- API contracts;
- canonical unit semantics.

---

## Observability and operations

The Community Pilot should remain observable without becoming operationally heavy.

Potential work includes:

- basic API error visibility;
- dependency failure visibility;
- App Service resource monitoring;
- database connection failure monitoring;
- release smoke-test documentation;
- Community Pilot incident notes.

The project does not currently require:

```text
Kubernetes
distributed tracing platform
centralized event streaming
multi-region active-active architecture
```

These may only be considered when scale or operational requirements justify them.

Monitoring must not encourage logging of sensitive data.

---

## Deployment and self-hosting

Self-hosting is important for the project's open source mission.

Potential documentation work includes:

- local deployment guide;
- Docker-based development example;
- PostgreSQL configuration guide;
- Azure deployment guide;
- Cloudflare Pages deployment guide;
- generic Linux deployment guide;
- environment variable reference;
- production checklist;
- backup and restore guidance.

Independent deployers should understand:

```text
SOURCE CODE
      ≠
OPERATIONAL GOVERNANCE
```

An organization deploying MedSupply Relay is responsible for evaluating its own:

- authentication;
- access control;
- data protection;
- infrastructure;
- backup;
- monitoring;
- incident response;
- legal obligations;
- operational ownership.

The project may provide guidance.

The project does not automatically become the operator of independent deployments.

---

## Testing and quality

The project should grow its automated test coverage according to risk.

Priority test areas include:

```text
SYNC IDEMPOTENCY
RESERVATION CONCURRENCY
RESERVATION TRANSITIONS
MATCHING RULES
QUANTITY BOUNDARIES
DELIVERY REPLAY
NORMALIZATION
OFFLINE QUEUE RECOVERY
```

Frontend quality work may include:

- component tests where valuable;
- service tests;
- IndexedDB migration tests;
- sync-state tests;
- end-to-end critical-path tests.

A full testing framework should not be introduced only to satisfy a coverage percentage target.

Tests should protect real behavior.

Critical-path reference flow:

```text
REGISTER SUPPLY
      ↓
REGISTER DEMAND
      ↓
SYNC
      ↓
MATCH
      ↓
RESERVE
      ↓
CONFIRM
      ↓
IN TRANSIT
      ↓
DELIVER
```

Offline reference flow:

```text
OPEN APPLICATION
      ↓
GO OFFLINE
      ↓
REGISTER DATA
      ↓
CLOSE APPLICATION
      ↓
REOPEN
      ↓
VERIFY LOCAL DATA
      ↓
RESTORE NETWORK
      ↓
SYNC
      ↓
VERIFY SERVER DATA
```

---

## Documentation and community

Community documentation is an active roadmap priority.

Planned or maintained files include:

```text
README.md
LICENSE
NOTICE
COPYRIGHT.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
ROADMAP.md
```

The GitHub community structure should support:

- clear bug reports;
- humanitarian need reports;
- feature proposals;
- pull request review;
- contributor onboarding;
- responsible security reporting.

Potential documentation work includes:

- architecture overview;
- sync protocol documentation;
- matching rules documentation;
- reservation lifecycle documentation;
- self-hosting guide;
- field operator guide;
- contributor glossary.

Good documentation changes are first-class contributions.

---

## Potential future capabilities

The following capabilities may be discussed in the future.

They are not approved commitments.

### Deployment-specific access control

Possible need:

- protected write operations;
- operator identity;
- organization-level access.

Requires deployment and governance requirements.

### Organization or operation scopes

Possible need:

```text
Operation A
Operation B
Organization X
Organization Y
```

Could help independent humanitarian operations isolate records.

Requires data model and offline sync impact review.

### Medicine catalog interoperability

Possible need:

- standardized medicine identifiers;
- regional catalogs;
- controlled aliases.

Requires reliable source data and compatibility strategy.

### Improved geographic coordination

Possible need:

- better distance information;
- route-aware coordination;
- regional filtering.

A map is not automatically required.

Any mapping capability must consider:

- bundle weight;
- offline behavior;
- provider dependency;
- tile availability;
- old devices.

### Deployment-specific governance controls

Possible need:

- local retention policies;
- approval workflows;
- operational audit rules.

These should not force all Community Pilot deployments into one governance model.

### Better audit history

Possible need:

- human-readable reservation event history;
- operational actor information;
- change traceability.

Requires privacy and access-control consideration.

### Additional contingency outputs

Possible need:

- compact print layouts;
- field handoff reports;
- low-bandwidth sharing formats.

Should be driven by field feedback.

---

## Explicitly deferred capabilities

The following are intentionally deferred unless a validated humanitarian requirement changes the decision.

### Patient medical records

```text
DEFERRED
```

MedSupply Relay is not a clinical record system.

### Diagnostic decision support

```text
DEFERRED
```

The project does not diagnose patients or recommend clinical treatment.

### Payment processing

```text
DEFERRED
```

Medicine payment and financial transaction systems are outside the current mission.

### Blockchain

```text
DEFERRED
```

No validated project requirement currently justifies blockchain.

### AI-based matching

```text
DEFERRED
```

Deterministic and explainable matching currently solves the initial requirement.

### Kubernetes

```text
DEFERRED
```

Current scale does not justify the operational burden.

### Event streaming infrastructure

```text
DEFERRED
```

Kafka, RabbitMQ, or equivalent infrastructure is not currently required.

### Permanent real-time connectivity

```text
DEFERRED
```

The system must remain compatible with unstable connectivity.

### Native mobile application

```text
DEFERRED
```

The PWA is currently the primary field client.

A native app would require a demonstrated device or platform limitation.

### Full medicine warehouse ERP

```text
DEFERRED
```

MedSupply Relay is not intended to replace complete warehouse or hospital ERP systems.

### Public social network features

```text
DEFERRED
```

Profiles, feeds, likes, followers, and public social features are outside the current mission.

---

## How roadmap decisions are made

Roadmap decisions should follow evidence.

Preferred decision flow:

```text
FIELD OR TECHNICAL PROBLEM
          ↓
ISSUE
          ↓
CONTEXT AND IMPACT
          ↓
DISCUSSION
          ↓
MINIMUM ACCEPTANCE CRITERIA
          ↓
IMPLEMENTATION
          ↓
TEST
          ↓
REVIEW
          ↓
RELEASE
```

A proposal may be prioritized when it:

- prevents data loss;
- reduces operational risk;
- fixes a security issue;
- protects reservation integrity;
- improves offline reliability;
- has validated humanitarian relevance;
- improves accessibility;
- significantly reduces field confusion.

A proposal may be deferred when it:

- has no demonstrated operational problem;
- introduces major infrastructure;
- creates sensitive-data risk;
- breaks offline compatibility;
- increases complexity significantly;
- duplicates an existing capability;
- is primarily cosmetic;
- creates disproportionate maintenance burden.

---

## Issue labels and roadmap flow

Suggested labels:

```text
bug
security
humanitarian-priority
offline-first
backend
frontend
documentation
accessibility
i18n
good first issue
help wanted
needs-discussion
needs-field-validation
breaking-change
deferred
```

Suggested flow:

```text
NEW ISSUE
    ↓
TRIAGE
    ↓
ONE OF:
    ├── accepted
    ├── needs-discussion
    ├── needs-field-validation
    ├── deferred
    └── closed
```

An accepted Issue is not automatically assigned to the original maintainer.

Community contributors may volunteer for approved work.

---

## What is not a roadmap commitment

The presence of an idea in this document does not mean:

- it has a delivery date;
- it is funded;
- it is assigned;
- it will definitely be implemented;
- the maintainer guarantees support;
- the Community Pilot will operate permanently;
- the project guarantees 24-hour availability.

This roadmap documents direction and evaluation criteria.

It is not a commercial product delivery contract.

The public Community Pilot remains a community reference deployment.

---

## How to propose roadmap changes

Use the appropriate GitHub Issue Form.

For a technical or product proposal, use:

```text
Feature
```

For a real operational humanitarian requirement, use:

```text
Humanitarian Need
```

A roadmap proposal should explain:

```text
WHO HAS THE PROBLEM?
        ↓
WHAT HAPPENS TODAY?
        ↓
WHAT IS THE OPERATIONAL RISK?
        ↓
WHY IS THE CURRENT FLOW INSUFFICIENT?
        ↓
WHAT IS THE MINIMUM CHANGE NEEDED?
```

Do not begin with the technology.

Example of a weak proposal:

> Add Elasticsearch.

Example of a stronger proposal:

> During a regional operation with thousands of active medicine records, operators cannot find a supply record quickly enough using the current filters. We need to define the search latency and dataset problem before choosing a search technology.

Example of a weak proposal:

> Add AI.

Example of a stronger proposal:

> Operators repeatedly fail to identify equivalent medicine names entered with regional spelling differences. We need to measure the normalization failure cases and determine whether deterministic aliases are sufficient.

---

## Maintainer note

MedSupply Relay began with a simple humanitarian question:

> **Where are the medicines, and who needs them?**

The first Community Pilot now demonstrates:

```text
SUPPLY
   ↓
DEMAND
   ↓
MATCH
   ↓
RESERVATION
   ↓
COORDINATION
```

The next phase is not about making the project larger as quickly as possible.

The next phase is about making it:

```text
MORE RELIABLE
MORE UNDERSTANDABLE
MORE TESTED
MORE OPEN TO CONTRIBUTORS
MORE USEFUL TO REAL OPERATIONS
```

The project should grow when the problem demands growth.

Not because a roadmap needs more boxes.

---

## Project

**MedSupply Relay**  
**Humanitarian Open Source Project**  
**Community Pilot**

License: `AGPL-3.0-or-later`

Original author and project maintainer:

> **Wesley Cordeiro de Araujo**

GitHub:

```text
https://github.com/wcaraujogithub
```

LinkedIn:

```text
https://www.linkedin.com/in/aisentinelx/
```

Public Community Pilot:

```text
https://medrelay.pages.dev
```

> **The connection may fail. Field work does not have to stop.**
