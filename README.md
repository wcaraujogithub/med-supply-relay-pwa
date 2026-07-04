# MedSupply Relay PWA

**MedSupply Relay PWA** is the frontend of MedSupply Relay, a humanitarian,
offline-first emergency coordination tool for matching medicine supply and
demand in unstable connectivity scenarios.

Original author: **Wesley Cordeiro de Araujo**  
License: **GNU AGPL-3.0-or-later**

---

## Humanitarian purpose

MedSupply Relay was created to help emergency teams know:

> where medicines are available and who urgently needs them.

The initial humanitarian motivation includes support for people affected by
the earthquake crisis in Venezuela, where hospitals, shelters, donors and
medical teams may need to coordinate medicines with unstable internet access.

The app was designed for:

- unstable 2G/3G connectivity;
- power outages;
- old or low-end phones;
- volunteers under pressure;
- hospitals and shelters with urgent needs;
- offline-first emergency registration.

---

## MVP scope

The MVP includes:

- PWA frontend built with React, Vite and TypeScript;
- offline local storage with IndexedDB/Dexie;
- supply registration;
- demand registration;
- background/manual sync with the backend;
- sync issue panel for failures/rejections/duplicates;
- match visualization between demand and supply;
- reservation flow to avoid double allocation;
- TXT/CSV contingency exports;
- Portuguese/Spanish i18n;
- static help page;
- license and authorship notice.

---

## Main user flows

### 1. Register supply

Use **Tengo medicamentos / Tenho medicamentos** to register:

- support point or shelter;
- medicine name;
- quantity;
- unit;
- optional contact/location details.

### 2. Register demand

Use **Necesito medicamentos / Preciso de medicamentos** to register:

- hospital or medical point;
- medicine needed;
- required quantity;
- unit;
- urgency.

### 3. Sync when possible

The app stores data locally while offline.

When internet and API are available, the user can click **Sync / Sincronizar**
to send pending records to the backend.

### 4. Review matches

The operational page shows supply and demand matches based on:

- same medicine or medicine code;
- same unit;
- open demand;
- available supply;
- stock not fully reserved.

### 5. Reserve pickup

Reservation flow:

```text
Pending -> Confirmed -> In Transit -> Delivered



Cancellation is available before the reservation enters transit.

When a reservation is delivered, the backend reduces supply stock and demand
quantity.

Offline-first behavior

The frontend can continue working without internet by storing records locally.

Local storage includes:

relief locations;
supply items;
demand items;
sync batches;
sync logs.

The sync issue panel helps users see:

pending records;
failed sync records;
API rejections;
duplicate batches/items;
warnings;
retry options;
local discard option.
Technology
React
Vite
TypeScript
PWA
Service Worker
IndexedDB / Dexie
Manual i18n ES/PT
Offline sync queue
Running locally

Install dependencies:

npm install

Run development server:

npm run dev

Build:

npm run build

Optional .env:

VITE_API_BASE_URL=http://localhost:5484

Help screenshots

Static help screenshots should be placed in:

public/help/

Expected files:

home.png
supply.png
demand.png
matches.png
reservations.png
sync.png

Do not use real personal, medical, patient, phone or location data in
screenshots.

License

This project is licensed under:

GNU Affero General Public License v3.0 or later
SPDX-License-Identifier: AGPL-3.0-or-later

If you modify this frontend and make it available to users over a network, you
must make the corresponding source code of your modified version available
under the same license terms.

You must preserve:

copyright notices;
license notices;
attribution to the original author;
the NOTICE file;
the COPYRIGHT.md file, when present.

Original author:

Wesley Cordeiro de Araujo
GitHub: https://github.com/wcaraujogithub
LinkedIn: https://www.linkedin.com/in/aisentinelx/
No warranty

This software is provided without warranty.

MedSupply Relay PWA does not replace:

official emergency coordination;
medical validation;
clinical decision-making;
transport authorization;
legal or regulatory compliance;
inventory auditing.

Use responsibly in coordination with local emergency and medical teams.


---

# 7. package.json

No front, deixe:

```json
{
  "license": "AGPL-3.0-or-later",
  "author": "Wesley Cordeiro de Araujo"
}