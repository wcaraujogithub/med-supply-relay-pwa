<!--
SPDX-License-Identifier: AGPL-3.0-or-later
Copyright (C) 2026 Wesley Cordeiro de Araujo
See NOTICE for additional attribution and origin notices.
-->

# MedSupply Relay Code of Conduct

## Our commitment

MedSupply Relay is a **Humanitarian Open Source Project**.

We are committed to maintaining a respectful, inclusive, technically serious, and mission-focused community for everyone who participates in the project.

The project welcomes people from different:

- countries;
- cultures;
- languages;
- professional backgrounds;
- levels of technical experience;
- humanitarian organizations;
- healthcare logistics environments;
- emergency response contexts.

Participation in MedSupply Relay must be guided by a simple principle:

> **People are more important than ego, status, technology, or personal recognition.**

The software may be evaluated or used in situations involving unstable connectivity, infrastructure failure, medicine shortages, shelters, hospitals, volunteers, and emergency logistics.

For this reason, technical discussions should remain respectful, responsible, and focused on reducing operational risk.

---

# Expected behavior

Members of the MedSupply Relay community are expected to:

- communicate respectfully;
- assume good intent when reasonable;
- provide constructive technical feedback;
- explain disagreements with evidence and context;
- respect differences in language and technical experience;
- welcome new contributors;
- help contributors understand project decisions;
- focus discussions on code, requirements, risks, and operational needs;
- acknowledge mistakes and correct them;
- respect contributor attribution;
- protect sensitive information;
- follow responsible security disclosure practices;
- consider humanitarian and field impact before proposing complex changes.

Examples of positive participation include:

> "I see a concurrency risk in this implementation. Here is a scenario that may reproduce it."

> "This workflow may be difficult on a small phone during an emergency. Could we simplify it?"

> "I disagree with this architectural choice because it introduces a permanent connectivity dependency."

> "I tested this on an older Android device and found a mobile layout issue."

> "I am new to this codebase. Could someone confirm which file owns this behavior?"

Technical disagreement is welcome.

Personal hostility is not.

---

# Unacceptable behavior

The following behavior is not accepted in the MedSupply Relay community:

- harassment;
- discrimination;
- intimidation;
- threats;
- personal attacks;
- insults;
- humiliation;
- repeated hostile or aggressive communication;
- sexual harassment or unwanted sexual attention;
- publishing private personal information without authorization;
- stalking or targeted surveillance of contributors;
- deliberate disruption of community discussions;
- spam;
- impersonation;
- knowingly false attribution claims;
- plagiarism;
- misrepresentation of another contributor's work;
- retaliation against someone who reports misconduct or a security concern.

It is also unacceptable to attack someone because of:

- nationality;
- ethnicity;
- race;
- religion;
- disability;
- gender;
- gender identity;
- sexual orientation;
- age;
- language;
- economic condition;
- political context;
- level of education;
- technical experience.

The project does not require contributors to agree on personal, political, or philosophical views.

It does require contributors to interact respectfully while participating in project spaces.

---

# Technical disagreement

MedSupply Relay expects strong technical debate.

Contributors may disagree about:

- architecture;
- database design;
- offline behavior;
- API contracts;
- user experience;
- security;
- humanitarian workflows;
- infrastructure;
- dependencies;
- performance;
- testing strategy.

Disagreement must remain focused on the work.

Acceptable:

> "I do not think Redis is justified for this requirement because the current workload does not demonstrate a distributed caching problem."

Unacceptable:

> "Only an incompetent developer would build it this way."

Acceptable:

> "The current matching rule may hide a valid medicine supply. I created a reproduction scenario."

Unacceptable:

> "This code is garbage."

Review the implementation.

Do not attack the person who created it.

---

# Respect for new contributors

People joining MedSupply Relay may:

- be contributing to open source for the first time;
- not speak English fluently;
- have limited Git experience;
- come from humanitarian operations rather than software development;
- be experienced developers unfamiliar with this architecture.

Do not shame contributors for asking basic questions.

Do not use technical knowledge as a tool for humiliation.

Maintainers and experienced contributors are encouraged to explain:

- where a rule is documented;
- why an architectural decision exists;
- how to reproduce an issue;
- what acceptance criteria are expected.

New contributors are also expected to:

- read available documentation;
- search existing Issues;
- make a reasonable effort to understand project guidelines;
- respond respectfully to review feedback.

Respect works in both directions.

---

# Language and international participation

The primary language for technical community documentation is English.

The MedSupply Relay application currently supports Spanish and Portuguese.

Contributors are not required to write perfect English.

Clear intent is more important than perfect grammar.

Do not mock:

- spelling mistakes;
- accents;
- translation mistakes;
- imperfect English;
- imperfect Spanish;
- imperfect Portuguese.

When possible, ask for clarification instead of assuming incompetence or bad intent.

Example:

> "I may be misunderstanding the requirement. Do you mean that the item should remain available offline after the application is closed?"

This is preferable to dismissing a contribution because of language differences.

---

# Humanitarian context

MedSupply Relay is built around humanitarian and emergency logistics scenarios.

Discussions involving:

- disasters;
- hospitals;
- medicine shortages;
- shelters;
- infrastructure collapse;
- emergency operations;

must be treated seriously.

Do not use real humanitarian suffering for:

- jokes targeting victims;
- personal promotion at the expense of affected people;
- fabricated operational claims;
- false affiliation claims;
- sensationalism.

Do not claim that MedSupply Relay is officially used by:

- a government;
- a hospital;
- an NGO;
- an international organization;
- an emergency authority;

unless that relationship is explicitly documented and authorized.

The public MedSupply Relay Community Pilot is not an official emergency service.

---

# Sensitive and medical information

MedSupply Relay is a logistics coordination project.

It is not a patient medical record system.

Community spaces must not be used to publish real:

- patient names;
- diagnoses;
- medical histories;
- identification documents;
- clinical records;
- medical images;
- laboratory results;
- personal phone numbers belonging to vulnerable individuals;
- private location data associated with identifiable patients.

This applies to:

```text
Issues
Pull Requests
Discussions
screenshots
logs
test data
demo videos
documentation
commit messages
```



Use synthetic data when demonstrating a bug.

Good:

```text
Hospital Test Caracas
Operator Demo
Paracetamol
100 cajas
```

Bad:

```text
Real patient name
Real diagnosis
Real document number
Real medical history
```

If sensitive information is accidentally published, notify the maintainers immediately.

Do not redistribute it.

Do not quote it unnecessarily in additional Issues or Pull Requests.

# Security discussions

Security research is welcome.

Responsible disclosure is required.

Do not publicly publish exploit instructions for a vulnerability that may create immediate risk to a running deployment before maintainers have had a reasonable opportunity to investigate.

Examples include:

- unauthorized modification of supply data;
- reservation manipulation;
- credential exposure;
- production database access;
- deployment credential leakage;
- injection vulnerabilities;
- sensitive data exposure;
- authentication or authorization bypass in future protected deployments;
- abuse of the synchronization protocol.

Follow the process documented in:

```text
SECURITY.md
```

Good-faith security research should be treated respectfully.

Security researchers must also avoid unnecessary access, destruction, or exposure of data.

# Attribution and authorship

MedSupply Relay was originally created by:

> **Wesley Cordeiro de Araujo**

The project preserves its original authorship, copyright notices, license, NOTICE, and origin information.

Contributors must not:

- remove required copyright notices;
- remove the AGPL license;
- remove required NOTICE information;
- falsely claim to be the original creator of MedSupply Relay;
- falsely attribute another contributor's work to themselves.

At the same time, maintainers and contributors must not intentionally erase legitimate community contributions.

Contributor recognition is preserved through:

- Git commit history;
- Pull Requests;
- Issues;
- release notes when appropriate;
- project contribution records.

The project values:

```text
ORIGINAL AUTHORSHIP
        +
COMMUNITY CONTRIBUTIONS
```

These principles are compatible.

# Conflicts of interest

Contributors should disclose relevant conflicts of interest when they could materially affect a project decision.

Examples may include:

- proposing a paid service owned by the contributor;
- recommending a commercial product because of a business relationship;
- representing an organization affected by a governance decision;
- proposing infrastructure that creates a direct financial benefit for the contributor.

Having a commercial relationship does not automatically prohibit participation.

Hidden influence is the concern.

A simple disclosure is usually enough.

Example:

> "Disclosure: I work for the company that maintains this service. I still believe it may solve the issue, but the relationship should be considered during review."

# Commercial organizations and vendors

Companies, vendors, consultants, and commercial organizations may participate in the MedSupply Relay community.

They must follow the same conduct rules as individual contributors.

Commercial participation must not include:

- deceptive promotion;
- repeated unsolicited advertising;
- fake community testimonials;
- hidden sponsorship;
- pressure on maintainers to adopt a product;
- false claims of official project partnership.

A vendor may explain a relevant technical solution.

A vendor may not turn project discussions into a sales channel.

# Maintainer responsibilities

Maintainers are expected to:

- apply this Code of Conduct fairly;
- investigate reports in good faith;
- avoid retaliation;
- protect report confidentiality when reasonably possible;
- distinguish technical disagreement from harassment;
- explain major moderation actions when appropriate;
- avoid using project authority to intimidate contributors.

Maintainers may:

- edit or remove inappropriate content;
- close disruptive Issues or Discussions;
- reject Pull Requests;
- issue private or public warnings;
- temporarily restrict participation;
- permanently ban participants from project-managed community spaces.

Maintainer authority must be used to protect the project and community, not to silence reasonable technical criticism.

A contributor may strongly disagree with a maintainer decision.

That disagreement is not automatically misconduct.

# Enforcement principles

Code of Conduct enforcement should consider:

- severity;
- context;
- impact;
- whether the behavior was intentional;
- whether the behavior is repeated;
- whether the participant acknowledges the problem;
- whether immediate safety or privacy risk exists.

Not every mistake requires a ban.

The general enforcement model is:

```text
CLARIFICATION
     |
     v
PRIVATE OR PUBLIC WARNING
     |
     v
TEMPORARY PARTICIPATION RESTRICTION
     |
     v
PERMANENT REMOVAL
```

Serious behavior may skip earlier stages.

Examples that may justify immediate stronger action include:

- credible threats;
- stalking;
- deliberate publication of private information;
- severe harassment;
- malicious credential exposure;
- retaliation against a reporter;
- deliberate attempts to harm humanitarian users or operations.

# Enforcement levels

## Level 1 - Clarification

Used for minor misunderstandings or first-time inappropriate behavior with limited impact.

Possible response:

- explain the relevant rule;
- request a wording change;
- redirect the discussion.

Expected result:

The participant understands the concern and adjusts their behavior.

## Level 2 - Warning

Used when behavior is clearly inappropriate or continues after clarification.

Possible response:

- formal maintainer warning;
- removal or editing of content;
- request to stop specific behavior.

The warning may be private or public depending on the context.

## Level 3 - Temporary restriction

Used for repeated misconduct or behavior that significantly disrupts the community.

Possible response:

- temporary restriction from Issues;
- temporary restriction from Discussions;
- temporary restriction from review participation;
- temporary block from project-managed community spaces.

The participant may be informed of the duration and reason when appropriate.

## Level 4 - Permanent removal

Used for severe misconduct or repeated behavior that demonstrates unwillingness to follow community standards.

Possible response:

- permanent block from project-managed spaces;
- removal from project roles;
- revocation of maintainer or collaborator privileges.

Permanent removal may be appropriate for:

- severe harassment;
- credible threats;
- stalking;
- malicious disclosure of private data;
- repeated retaliation;
- deliberate sabotage;
- serious repeated misconduct after previous enforcement.

# Reporting misconduct

Reports involving Code of Conduct violations should be made privately when the report contains sensitive details.

Contact:

- Wesley Cordeiro de Araujo
- <analistasistemasnet@gmail.com>

Use a clear subject such as:

```text
MedSupply Relay Code of Conduct Report
```

A report should include, when available:

- your name or preferred identifier;
- the project space where the incident occurred;
- a description of what happened;
- relevant dates;
- links to Issues, Pull Requests, Discussions, or comments;
- screenshots when necessary;
- whether you believe there is an immediate safety or privacy risk.

Do not include patient medical data or unrelated sensitive information.

Anonymous or limited-identification reports may still be reviewed, but lack of context can sometimes limit the investigation.

# Confidentiality

Conduct reports will be handled as privately as reasonably possible.

Information may be shared only when needed to:

- investigate the report;
- protect affected participants;
- make an enforcement decision;
- meet applicable legal obligations.

The project will avoid unnecessary public disclosure of:

- reporter identity;
- private communications;
- sensitive personal information.

Absolute confidentiality cannot be guaranteed in every legal or technical circumstance.

However, unnecessary disclosure is not acceptable.

# Anti-retaliation

Retaliation against someone for making a good-faith Code of Conduct report is prohibited.

Examples of retaliation include:

- harassment after a report;
- threats;
- targeted humiliation;
- coordinated attacks;
- deliberate interference with unrelated contributions;
- publishing private information;
- pressuring a reporter to withdraw a complaint.

A report that is not substantiated does not automatically mean that it was made in bad faith.

Bad-faith reporting means knowingly using the reporting process to:

- fabricate allegations;
- harass another person;
- manipulate project governance;
- retaliate against a technical disagreement.

Knowingly false or malicious reports may themselves violate this Code of Conduct.

# Appeals

A participant affected by a significant enforcement action may request reconsideration.

The request should:

- identify the enforcement action;
- explain why reconsideration is requested;
- provide relevant context;
- remain respectful.

An appeal does not guarantee reversal.

The purpose of an appeal is to correct:

- factual mistakes;
- missing context;
- disproportionate enforcement.

Repeated abusive appeals may be treated as disruptive behavior.

# Scope

This Code of Conduct applies to project-managed spaces, including:

- GitHub repositories;
- Issues;
- Pull Requests;
- GitHub Discussions;
- project documentation;
- official project communication channels;
- project-organized meetings or calls;
- project-managed social spaces.

It may also apply to behavior outside project-managed spaces when that behavior directly targets MedSupply Relay participants or creates a serious risk to community safety.

Examples may include:

- targeted harassment of a contributor because of their project participation;
- publishing a contributor's private information;
- threats connected to a project dispute.

The project does not attempt to regulate every aspect of a participant's private life.

Enforcement focuses on behavior that materially affects the MedSupply Relay community.

# Project decisions are not popularity contests

Open source participation does not mean every proposed change must be accepted.

Maintainers may reject a contribution because of:

- humanitarian scope;
- architectural direction;
- offline-first requirements;
- security concerns;
- data protection concerns;
- operational complexity;
- backward compatibility;
- maintenance burden;
- licensing;
- insufficient evidence of need.

A rejected Pull Request is not automatically disrespectful treatment.

A contributor is free to respectfully question the decision.

Maintainers should explain important decisions when reasonably practical.

# A note on emergency pressure

People working around emergencies may communicate under significant stress.

Stress can explain communication difficulties.

It does not authorize abuse.

When a conversation becomes heated:

```text
PAUSE
  |
  v
CLARIFY THE OPERATIONAL PROBLEM
  |
  v
SEPARATE PEOPLE FROM THE TECHNICAL ISSUE
  |
  v
DOCUMENT THE DECISION
```

The goal is not to win an argument.

The goal is to build safer and more useful humanitarian software.

# Our shared standard

In MedSupply Relay, we expect contributors to remember:

- Critique the code.
- Question the architecture.
- Challenge the requirement.
- Identify the risk.
- Respect the person.

# Contact

Project maintainer:

> **Wesley Cordeiro de Araujo**

- GitHub: <https://github.com/wcaraujogithub>
- LinkedIn: <https://www.linkedin.com/in/aisentinelx/>

Conduct reports:

<analistasistemasnet@gmail.com>

# Final statement

MedSupply Relay exists to support a humanitarian objective:

> Know where medicines are available and who urgently needs them.

A healthy open source community is part of that mission.

We build with technical rigor.

We disagree respectfully.

We protect people.

We preserve attribution.

We welcome contributors.

And we remember:

> The connection may fail. Field work does not have to stop.

```text
MedSupply Relay
Humanitarian Open Source Project
Community Pilot

License: AGPL-3.0-or-later

Original author and project maintainer: Wesley Cordeiro de Araujo
```

### Minha aprovacao como PO/Arquiteto

Esse arquivo ja cria uma regra de comunidade adequada ao projeto:

```text
respeito                         OK
debate tecnico forte             OK
protecao a novos contribuidores  OK
comunidade internacional         OK
contexto humanitario             OK
dados medicos/sensiveis          OK
security disclosure              OK
autoria e contribuicoes          OK
conflito de interesse            OK
participacao de empresas         OK
anti-retaliacao                  OK
processo de denuncia             OK
escada de enforcement            OK
direito de reconsideracao        OK
```
