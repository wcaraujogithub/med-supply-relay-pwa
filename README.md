# MedSupply Relay PWA

> **MedSupply Relay — Humanitarian Open Source Project**

The public reference deployment is presented as the **MedSupply Relay Community Pilot**.

The Community Pilot is not an official emergency service and is not affiliated with governments, hospitals, international organizations, or emergency response authorities unless expressly stated.

Data in the public pilot is not officially verified.

Do not register patient names, diagnoses, medical histories, personal documents, or sensitive clinical information in free-text fields.

Original author: **Wesley Cordeiro de Araujo**  
License: **GNU AGPL-3.0-or-later**

**Frontend project:** `med-supply-relay-pwa`

---

## Humanitarian purpose

MedSupply Relay was created as a humanitarian emergency MVP for scenarios where medical supplies may be fragmented across hospitals, shelters, donors, warehouses, medical posts, NGOs, mobile units, and support centers.

The initial humanitarian motivation includes emergency support scenarios affecting communities in Venezuela.

The project is designed for environments with:

- unstable 2G/3G connectivity;
- temporary internet outages;
- power interruptions;
- low-end or older mobile devices;
- volunteers working under pressure;
- hospitals and medical teams with urgent medicine demands;
- shelters and support points holding available medicine stock;
- limited infrastructure for centralized coordination.

The application prioritizes a simple operational goal:

> A team should be able to register medicine supply or demand quickly, even without internet, and synchronize the information when connectivity returns.

---

## MVP status

The current MedSupply Relay PWA represents the functional humanitarian MVP.

The MVP includes:

- installable Progressive Web App;
- offline-first data registration;
- IndexedDB local persistence with Dexie;
- local device identification;
- optional operator alias;
- medicine supply registration;
- medicine demand registration;
- Spanish and Portuguese interface;
- manual and automatic synchronization;
- batch synchronization with the MedSupply Relay API;
- sync failure and conflict visibility;
- retry of failed local records;
- local sync logs;
- supply and demand matching visualization;
- recommendation viability score;
- active stock reservation;
- reservation operational workflow;
- contingency TXT/CSV exports;
- static help page;
- humanitarian and operational guidance;
- open source license and authorship notice.

The MVP intentionally avoids unnecessary complexity.

The priority is emergency usability, offline resilience, and rapid coordination.

---

## Main user flows

### 1. Register medicine supply

Use:

**Tengo medicamentos / Tenho medicamentos**

The user can quickly register:

- support location name;
- area or region;
- optional contact phone;
- medicine name;
- available quantity;
- unit.

Optional details can be expanded when there is time:

- location code;
- location type;
- contact alias;
- contact name;
- address;
- latitude;
- longitude;
- medicine code;
- expiration date;
- batch number;
- notes.

Only the essential information is required for emergency registration.

The record is stored locally in IndexedDB and can be created without internet access.

---

### 2. Register medicine demand

Use:

**Necesito medicamentos / Preciso de medicamentos**

The user can register:

- hospital, medical post, shelter, or demand point;
- area or region;
- optional contact phone;
- medicine needed;
- required quantity;
- unit;
- urgency priority.

Supported priority levels are:

- `Critical`
- `High`
- `Medium`
- `Low`

The emergency form prioritizes the minimum required information.

Additional location and demand details remain optional.

The record is stored locally when the device is offline.

---

### 3. Synchronize local records

Use:

**Sincronizar**

The PWA maintains local records while offline.

When the device and API are available, pending records are sent to the backend through the batch synchronization endpoint.

The frontend supports:

- manual synchronization;
- synchronization when network/API becomes available;
- synchronization after local storage changes;
- periodic synchronization attempts;
- prevention of concurrent sync executions.

The synchronization engine sends:

- relief locations;
- supply items;
- demand items.

---

## Sync issue visibility

The application includes a visual synchronization status panel.

Users do not need to open the browser console to understand basic synchronization problems.

The panel can show:

- pending records;
- failed local records;
- API rejections;
- duplicate batches or items;
- synchronization warnings.

Available operational actions include:

- refresh sync status;
- retry all failed records;
- retry a specific failed record;
- synchronize immediately;
- discard a failed local record after confirmation;
- clear local synchronization logs.

The discard action must be used carefully because it removes the local record from IndexedDB.

---

## Offline-first behavior

MedSupply Relay PWA uses IndexedDB through Dexie for local persistence.

Local storage currently includes:

- relief locations;
- supply items;
- demand items;
- sync batches;
- sync logs.

The application can continue registering essential data while the API is unavailable.

Offline registration does not require an active server connection.

When connectivity returns, pending data can be synchronized with the backend.

### Important offline limitation

Real stock reservation requires an active connection to the MedSupply Relay API.

This is intentional.

A reservation changes shared stock availability and therefore must be confirmed by the central backend to reduce double allocation.

---

## Supply and demand matching

The operational page displays compatible matches returned by the MedSupply Relay API.

The backend currently evaluates:

- open demand;
- available supply;
- compatible medicine;
- same unit;
- positive free stock;
- active reservation quantities.

Medicine compatibility can be based on:

- normalized medicine name; or
- compatible medicine code.

The operational page can show:

- demand location;
- supply location;
- required quantity;
- total supply;
- actively reserved quantity;
- quantity currently free;
- suggested quantity;
- priority;
- approximate distance when coordinates are available;
- viability score;
- recommendation reasons;
- highlighted recommended option.

---

## Match recommendation score

Matches may include a viability score.

The score is an operational recommendation aid.

It does not represent clinical validation.

Recommendation factors may include:

- critical demand priority;
- quantity coverage;
- geographic distance;
- expiration information;
- other matching criteria implemented by the backend.

The frontend may highlight one recommended option for a demand.

Operational teams remain responsible for validating real availability, transport, clinical priority, and local conditions.

---

## Reservation workflow

The reservation feature exists to reduce double allocation of the same medicine stock.

Operational flow:

```text
Pending -> Confirmed -> In Transit -> Delivered
```

### Pending

A team has temporarily reserved available stock.

### Confirmed

The reservation has been operationally confirmed.

### In Transit

The medicine is currently being transported.

### Delivered

The medicine reached the demand destination.

Cancellation is available before the reservation enters transit.

The normal operational flow does not allow:

```text
Pending -> Delivered
Confirmed -> Delivered
In Transit -> Cancelled
```

The intended sequence is:

```text
Pending
   |
   v
Confirmed
   |
   v
In Transit
   |
   v
Delivered
```

When a reservation is marked as delivered, the backend reduces:

- supply quantity;
- demand quantity.

Active reservations reduce the quantity shown as free stock.

A fully reserved supply item no longer appears as freely available in matches.

---

## Reservation expiration

Pending or confirmed reservations can expire when their reservation period ends.

The operational interface can show:

- reservation expiration time;
- warning when a reservation is close to expiration;
- expired reservation status.

Expired reservations release the previously reserved quantity for matching again.

---

## Contingency exports

The application provides contingency export access for match information.

Supported formats:

```text
TXT
CSV
```

TXT is intended for simple communication channels and manual coordination.

CSV is intended for spreadsheet-based review.

Exports consider active reservations.

Exported match data can include:

- total supply;
- actively reserved quantity;
- quantity currently free;
- suggested quantity;
- demand location;
- supply location;
- priority;
- recommendation information.

Fully reserved stock is not presented as freely available.

---

## Languages

The frontend currently supports:

```text
Spanish
Portuguese
```

Spanish is the default language for the current humanitarian scenario.

The selected language is stored locally in the browser.

The interface includes an `ES / PT` language selector.

Internal domain values remain stable regardless of the visual language.

For example, unit values used by synchronization and matching are not changed when the interface language changes.

This prevents i18n from breaking backend compatibility.

---

## Emergency form design

Supply and demand forms use progressive disclosure.

Essential fields are shown first.

Optional details remain hidden until the user selects:

```text
Mostrar detalles
Mostrar detalhes
```

This approach is intentional.

In emergency environments, users should register the minimum necessary information first rather than spending time completing non-essential fields.

---

## Help page

The application includes a static help page designed to work without API access.

The help page documents:

- recommended operational flow;
- matching business rules;
- reservation rules;
- emergency usage guidance;
- screen-specific tips;
- application screenshots.

Help screenshots must be stored in:

```text
public/help/
```

Expected files:

```text
home.png
supply.png
demand.png
matches.png
reservations.png
sync.png
```

Do not use real patient, phone, medical, volunteer, or precise private location data in documentation screenshots.

Use fictitious demonstration records.

---

## Business rules represented in the interface

The frontend communicates the current MVP business rules defined by the backend.

### Matching

- Demand must be open.
- Supply must be available.
- Medicine must be compatible.
- Unit must match.
- Supply must have quantity available.
- Active reservations reduce free quantity.
- Fully reserved stock does not appear as freely available.
- Critical demand is prioritized.

### Reservation

- Reservation creation requires API connectivity.
- Reservation quantity cannot exceed free stock.
- Active reserved quantity is deducted from free stock.
- Operational flow is `Pending -> Confirmed -> In Transit -> Delivered`.
- Cancellation is available before transit.
- Delivered reservations reduce supply and demand quantities.
- Expired reservations release stock availability.

### Synchronization

- Offline records remain local until synchronization.
- Client operation identifiers are used to help identify records.
- Batch synchronization can report accepted, rejected, or duplicate information.
- Failed local records can be marked for retry.
- Sync problems are displayed visually.

---

## Technology

### Core

- React
- TypeScript
- Vite

### Offline and PWA

- Progressive Web App
- Service Worker
- IndexedDB
- Dexie
- offline-first storage
- local sync queue
- sync logs

### UI

- lightweight custom CSS;
- no heavy UI framework;
- responsive layout;
- Spanish/Portuguese i18n;
- emergency-oriented forms.

---

## Project requirements

Recommended:

```text
Node.js 20+
npm
```

A modern browser with IndexedDB and Service Worker support is required for the complete PWA/offline experience.

---

## Running locally

Clone the repository:

```bash
git clone https://github.com/wcaraujogithub/MedSupplyRelay.git
```

Navigate to the frontend project directory.

Install dependencies:

```bash
npm install
```

Create the local environment file when required:

```env
VITE_API_BASE_URL=http://localhost:5484
```

Run the development server:

```bash
npm run dev
```

The development script exposes Vite using:

```text
0.0.0.0
```

This can help when testing the frontend from another device on the same local network.

---

## Production build

Run:

```bash
npm run build
```

The current build command executes:

```text
tsc -b && vite build
```

This validates TypeScript before generating the production bundle.

Preview the generated production build:

```bash
npm run preview
```

---

## PWA icons

The project includes an icon generation script.

Run:

```bash
npm run icons
```

The script uses Sharp to generate the required PWA assets.

---

## Environment configuration

The main frontend API environment variable is:

```env
VITE_API_BASE_URL=http://localhost:5484
```

The application normalizes the configured API base URL before creating endpoint URLs.

Do not commit production secrets to frontend environment files.

Frontend environment values are delivered to the browser and must not be treated as confidential credentials.

---

## Backend dependency

The frontend consumes the MedSupply Relay API.

Main MVP API operations include:

```text
GET  /health

POST /api/v1/sync/batch

GET  /api/v1/matches

GET  /api/v1/export/matches.txt
GET  /api/v1/export/matches.csv

POST /api/v1/reservations
GET  /api/v1/reservations
GET  /api/v1/reservations/availability/{supplyId}

POST /api/v1/reservations/{reservationId}/confirm
POST /api/v1/reservations/{reservationId}/in-transit
POST /api/v1/reservations/{reservationId}/delivered
POST /api/v1/reservations/{reservationId}/cancel
POST /api/v1/reservations/expire-old
```

The frontend and backend should use compatible API contracts.

---

## Data responsibility

Offline data can depend on:

- browser IndexedDB behavior;
- available device storage;
- operating system cleanup policies;
- browser permissions;
- device condition;
- cache state;
- later backend synchronization.

MedSupply Relay PWA is not a guaranteed permanent offline backup system.

Users, operators, and deployers are responsible for:

- validating important information;
- avoiding unnecessary sensitive data;
- protecting devices used in humanitarian operations;
- reviewing failed synchronization records;
- following applicable privacy and data protection requirements;
- maintaining appropriate operational backups when necessary.

---

## Medical and humanitarian disclaimer

MedSupply Relay PWA is a humanitarian logistics and information coordination tool.

It is **not**:

- a certified medical device;
- a clinical decision support system;
- a diagnosis system;
- an emergency dispatch system;
- a medicine authenticity verification system;
- an inventory audit system;
- a government coordination platform;
- a regulatory compliance product.

The application does not replace:

- clinical judgment;
- medical validation;
- medicine inspection;
- official emergency coordination;
- authorized transportation;
- local humanitarian leadership;
- legal or regulatory obligations.

Use responsibly in coordination with local emergency, humanitarian, logistics, and medical teams.

---

## Open source license

MedSupply Relay PWA is licensed under:

```text
GNU Affero General Public License v3.0 or later
SPDX-License-Identifier: AGPL-3.0-or-later
```

The complete GNU AGPLv3 license text is distributed in:

```text
LICENSE
```

Additional humanitarian, authorship, attribution, and origin notices are available in:

```text
NOTICE
COPYRIGHT.md
```

Modified versions made available for remote network interaction are subject to the applicable GNU AGPLv3 requirements regarding Corresponding Source.

See the `LICENSE` file for the complete legal terms.

---

## Original authorship

The original MedSupply Relay project was created by:

**Wesley Cordeiro de Araujo**

GitHub:  
https://github.com/wcaraujogithub

LinkedIn:  
https://www.linkedin.com/in/aisentinelx/

Contact:  
analistasistemasnet@gmail.com

The project is open source.

Open source does not mean public domain.

The origin of the original MedSupply Relay material must not be misrepresented.

See the `NOTICE` file for applicable attribution and origin notices.

---

## Third-party software

React, Vite, TypeScript, Dexie, Sharp, browser APIs, development tools, and other third-party dependencies remain governed by their respective licenses.

Third-party copyright and license notices must be preserved when required by their applicable licenses.

---

## No warranty

This software is provided **as is**, without warranty of any kind.

No guarantee is made regarding:

- availability;
- accuracy;
- synchronization success;
- offline data durability;
- data recovery;
- security;
- medicine availability;
- logistics success;
- emergency suitability;
- medical suitability;
- legal or regulatory compliance.

See the `LICENSE` and `NOTICE` files for additional information.

---

## Humanitarian note

MedSupply Relay was created as an emergency-focused open source humanitarian MVP.

The current goal is not to become a large general-purpose hospital management platform.

The goal is deliberately narrower:

> Register medicine supply.  
> Register urgent demand.  
> Synchronize when possible.  
> Find compatible supply.  
> Reserve pickup.  
> Help coordination act faster.

In an emergency, simplicity is a feature.