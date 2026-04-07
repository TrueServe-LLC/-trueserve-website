# TrueServe Mobile Platform - Test Driven Development (TDD) & Specification Guide

## 1. Vision & Architecture
The TrueServe mobile platform is a "High-Fidelity, Native-App-First" experience. It is designed to offer a cinematic, responsive environment for Customers, Drivers, and Merchants, isolated from the desktop site using `lg:hidden` utility classes.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (Empire Design System)
- **Database**: Supabase (PostgreSQL + Real-time)
- **AI Engine**: Anthropic Claude 3.5 Sonnet (Support & Logistics Triage)
- **Maps**: Google Maps JavaScript API (Geocoding & Tracking)

---

## 2. Core UI Components (Mobile-First)

### A. Navigation Architecture (`MobileNav.tsx`)
- **Requirement**: Floating bottom dock with glassmorphism (`backdrop-blur-xl`).
- **States**:
  - `active`: Primary brand color (`#E8A230` or `#3DD68C` for Driver).
  - `hidden`: Automatically hides on operational dashboard routes to allow for mission-critical real estate.

### B. Logo Consistency (`Logo.tsx`)
- **Requirement**: The official TrueServe logo MUST be present on all mobile headers.
- **Badge Integration**: Portal views MUST include a role-specific badge (e.g., `Merchant`, `Fleet ID`).

### C. Empire Design Tokens
- **Typography**: `Bebas Neue` for headlines, `Barlow Condensed` for UI elements, `DM Mono` for data/telemetry.
- **Color Palette**: Dark mode (`#0C0E13`), Gold accents (`#E8A230`), Fleet Emerald (`#3DD68C`).

---

## 3. Communication Protocols (AI & Real-Time)

### A. Intelligent Support Hub (`SupportWidget.tsx`)
- **Engine**: Claude 3.5 Sonnet.
- **Unit Test Criteria**:
  - [ ] AI correctly identifies user role (Customer/Driver/Merchant).
  - [ ] AI triggers `handoff_required` JSON on frustration keywords.
  - [ ] Real-time message streaming from Supabase `SupportMessage` table.

### B. Fleet-Customer Communication (`ChatWindow.tsx`)
- **Engine**: Claude-powered Translation.
- **Test Criteria**:
  - [ ] Real-time subscription to `OrderChatMessage` using Supabase.
  - [ ] Multi-lingual translation triggers on "Translate" button click.
  - [ ] Persistence check: Messages survive page refresh.

---

## 4. Operational Dashboard Verification

### Driver Dashboard (`MobileDriverDashboard.tsx`)
- [ ] Profile card displays correct "Total Revenue Yield".
- [ ] Active Missions correctly map to `PICKED_UP` or `IN_TRANSIT` states.
- [ ] "Engage" button correctly updates order status in Supabase.

### Merchant Hub (`MobileMerchantDashboard.tsx`)
- [ ] Live Feed updates instantly on new order arrival.
- [ ] "Kitchen Terminal" stats (Active, Ready, Payout) sync with orders table.
- [ ] Pilot Bypasses (Bypass Step) correctly update UI state for testing.

---

## 5. Pilot Readiness Audit (Pre-Flight)

### [ ] Authentication & Security
- Bypass `preview_mode` flags verified for visual audit.
- Role-based redirection (`/hub` vs `/merchant/dashboard`).

### [ ] Map Integrity
- Google Maps loads reliably without "Development Only" watermark (Check API Key).
- Polyline routing correctly calculated for active missions.

### [ ] Brand Verification
- TrueServe Logo on Settings page.
- TrueServe Logo on Order History page.
- "Empire" typography applied to all headers.
