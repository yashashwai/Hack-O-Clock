# 🏘️ NeighbourLend
### Hyperlocal Item Lending Platform for Gated Communities
**Product Requirements Document — Without ML Trust Score**
`Version 1.0 | February 2026 | Hackathon Project`

---

## 1. Product Overview

NeighbourLend is a hyperlocal item lending platform designed for gated communities such as hostels and apartment complexes. It enables residents to borrow items from neighbours within their community for an hourly fee, backed by a secure identity verification system, collateral-based financial protection, and a warden-accessible admin layer.

> **Core Philosophy:** Design the UX for borrowers, design the safety systems for lenders.

---

## 2. Problem Statement

Residents of gated communities frequently need items on short notice — a charger, a tool, a book — but have no formal platform to request them. Informal borrowing through WhatsApp or word of mouth lacks accountability, financial protection, and dispute resolution mechanisms. NeighbourLend solves this by creating a structured, trust-based lending ecosystem within closed communities.

---

## 3. Target Users

### 3.1 Primary Users
- **Borrowers** — Residents who need to borrow an item urgently
- **Lenders** — Residents who have items they are willing to lend for a price
- Both roles can be held by the same person simultaneously

### 3.2 Admin Users
- **Community Admin (Warden/Security Guard)** — Has read-only access to transaction history and user identity details for dispute escalation

---

## 4. Core Features

### 4.1 Onboarding & Identity Verification

Every user must complete identity verification during signup to ensure accountability.

- DigiLocker integration for government-backed KYC verification
- Room number, block, and community details collected at signup
- Community selection from a pre-defined list (no geospatial maps needed)
- One account per verified identity

> **Security rationale:** DigiLocker provides a strong deterrent — users know their government identity is on record. Combined with the closed-community physical constraint, running away becomes practically impossible.

---

### 4.2 Borrower Page — Request Flow

The borrower experience is designed to be fast and frictionless, prioritising urgent use cases.

- Borrower selects item category from a predefined list
- System displays suggested hourly price range based on category
- Borrower posts request with item description and their comfortable price range
- All users in the same community receive a push notification
- If no responses, borrower can repost with a higher price range
- On lender acceptance, borrower receives confirmation with lender room details
- Borrower physically goes to lender to collect item
- Borrower confirms receipt in-app to trigger collateral hold

---

### 4.3 Lender Page — Response Flow

The lender experience is designed to be low-effort with strong financial protection.

- Lender receives notification of a nearby borrower request
- Lender can accept or ignore — no obligation
- On accepting, lender photographs the item (mandatory before handover)
- Lender confirms handover in-app
- On return, lender photographs item again and confirms condition
- Lender rates borrower after transaction completion
- Collateral is released automatically upon confirmed return

---

### 4.4 Pricing System

| Item Category | Suggested Hourly Rate (₹) |
|---|---|
| Laptop / Tablet | ₹80 – ₹150 / hour |
| Camera / DSLR | ₹100 – ₹200 / hour |
| Mobile Charger / Cable | ₹20 – ₹50 / hour |
| Sports Equipment | ₹30 – ₹80 / hour |
| Kitchen Appliance | ₹50 – ₹100 / hour |
| Books / Stationery | ₹5 – ₹20 / hour |
| Tools & Hardware | ₹40 – ₹90 / hour |
| Clothing / Accessories | ₹20 – ₹60 / hour |

**Pricing rules:**
- Lender declares item value at time of listing
- Borrower sets their comfortable price range in the request
- Suggested ranges shown as guidance, not enforced — community self-regulates
- Borrowing limit per user based on trust tier (see Trust Score section)

---

### 4.5 Security & Collateral System

NeighbourLend uses a multi-layered security approach:

- 25% of declared item value collected as collateral from borrower before handover
- Collateral held in-platform until lender confirms return in good condition
- If item returned damaged, borrower forfeits all or part of collateral
- If item not returned within agreed time, system auto-flags and notifies admin
- Borrowing time limits enforced — auto-escalation to warden after deadline breach
- New users capped at 2 simultaneous active borrows
- Photo evidence required at both handover and return
- Both parties digitally confirm transaction at each stage
- Emergency contact collected during signup as a secondary point of contact

**Four security layers:**

| Layer | Mechanism |
|---|---|
| Identity | DigiLocker verification — government identity on record |
| Physical | Closed community — user cannot disappear |
| Financial | 25% collateral — immediate financial loss covered |
| Human | Warden has full transaction history and verified identity for escalation |

---

### 4.6 Trust Score System (Formula-Based)

The trust score is calculated using a weighted formula applied to each user's transaction history stored in Firestore. No ML model is used — the formula is transparent, predictable, and works from day one with zero historical data.

**Score formula:**

| Factor | Weight |
|---|---|
| Average rating received | 40% |
| Number of successful transactions | 30% |
| Item return rate (on time, good condition) | 20% |
| Average response time to requests | 10% |

**Trust tiers and borrowing limits:**

| Trust Tier | Score Range | Max Item Value | Max Simultaneous Borrows |
|---|---|---|---|
| New User | 0 – 30 | ₹5,000 | 2 |
| Trusted | 31 – 60 | ₹15,000 | 4 |
| Verified | 61 – 80 | ₹30,000 | 6 |
| Community Star | 81 – 100 | No cap | Unlimited |

**Anti-gaming rules:**
- One review per user pair — a person can only review the same person once, ever
- Gemini API generates a human-readable trust summary from transaction data
- Example output: *"Reliable lender — responds quickly, items always returned in good condition"*

---

### 4.7 Admin Page — Warden/Security

The admin page is a passive oversight tool, not an active responsibility. Wardens are given login credentials and the platform is pitched to them as something that reduces their dispute workload — when residents bring complaints, documented evidence is already ready.

- View all active and completed transactions in their community
- Access user identity details (DigiLocker-verified) for serious disputes
- View photo evidence for disputed transactions
- Mark disputes as resolved
- Receive automatic escalation notifications for overdue borrows

> **Warden adoption strategy:** The warden does not need to check the platform daily. They just need to know it exists and have credentials for when something serious occurs. The platform reduces their workload by eliminating he-said-she-said disputes.

---

### 4.8 Proof / Image Gallery Page

A dedicated page showing all transaction-related photo evidence, accessible to both parties and to the admin.

- Pre-handover photo uploaded by lender (mandatory)
- Post-return photo uploaded by lender (mandatory)
- Timestamp and transaction ID attached to every photo
- Photos stored in Firebase Storage, linked to transaction records in Firestore
- Admin can view all photos for any transaction in their community

---

### 4.9 Community Chat Page

A general community space for informal communication, item discovery, and community building.

- Real-time community-wide chat powered by Firestore listeners
- Users can ask informal questions — "does anyone have X?"
- Chat is **not** used for transaction negotiations — all lending goes through the structured request flow
- Moderated by community admin

---

## 5. Tech Stack (Google-Centric)

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Database | Firebase Firestore — real-time updates for notifications and chat |
| Authentication | Firebase Auth + DigiLocker API for KYC |
| Image Storage | Firebase Storage — proof photos |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Hosting | Firebase Hosting |
| AI / Pricing & Trust Summaries | Gemini API |
| Trust Score Engine | Weighted formula computed on Firestore data |

---

## 6. Five Pages — Summary

| Page | Purpose |
|---|---|
| 1. Borrower Page | Post requests with price range, receive lender notifications, confirm handover and return, rate lender |
| 2. Lender Page | Receive borrower notifications, accept requests, upload photos, confirm handover and return, rate borrower |
| 3. Admin Page | View transactions, access user identity, view photo evidence, resolve disputes, receive escalation alerts |
| 4. Community Chat | Real-time community-wide messaging, informal queries, moderated by admin |
| 5. Proof Gallery | Timestamped pre/post photos for all transactions, linked by transaction ID |

---

## 7. Out of Scope (This Version)

- Geospatial maps or GPS-based proximity — community membership is the boundary
- DM / chat-based negotiations — price range in the request handles this
- Payment gateway integration — collateral tracking is in-platform only for hackathon
- Multi-community support — single community per deployment

---

## 8. Success Metrics (Hackathon Demo)

- End-to-end borrower request to lender acceptance flow demonstrated
- Photo upload and proof gallery working
- Trust score calculated and displayed per user
- Admin page showing live transaction data
- Community chat sending and receiving messages in real time
- Gemini API generating trust summaries and price suggestions

---

> This PRD covers the version **without** an ML-based trust score. The trust score is computed using a transparent weighted formula. For the ML-based version, see PRD v1.0-ML.
