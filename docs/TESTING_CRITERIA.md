
# TrueServe Testing & Quality Assurance Guide

Welcome to the TrueServe Quality Assurance (QA) team. This document outlines the critical "Core Logic" that MUST be verified before every release to ensure our drivers are paid fairly and our logistics engine is stable.

## 🧪 Current Test Suites

We use **Jest** for all business logic testing. Run all tests with `npm test`.

### 1. The Payout Engine (`__tests__/onboarding_tester_examples.test.ts`)
This is the most sensitive part of the app. It calculates:
*   **Base Pay**: $3.00 minimum.
*   **Distance**: Flat $0.70/mi.
*   **Wait Pay**: $0.25/min (protection for driver time).
*   **Surge Multipliers**: Only apply to (Base + Distance), never to Wait Pay (Fairness Rule).

**Key Verification**: The "Golden Ratio" test ensures that a **4.2mi / 12min** order always totals **$14.94** with a $6 tip.

### 2. Order Lifecycle (`__tests__/order_logic.test.ts`)
Defines the "legal" movements of an order. 
*   **Forbidden Paths**: Orders cannot skip states (e.g. going from `PENDING` directly to `DELIVERED` will fail).
*   **Terminal States**: Once an order is `DELIVERED`, it cannot be reverted to `PICKED_UP`.

### 3. Data Integrity (`__tests__/phone_utils.test.ts`)
Ensures data from messy human input is normalized for our automated systems (SMS, Auth).
*   **Phone Rule**: All numbers are stored as **E.164** (+1XXXXXXXXXX).

## 🛠️ Testing via TDD (Test-Driven Development)

When adding a new feature (e.g., "Late Night Bonus"), follow this flow:
1.  **RED**: Add a test case for the bonus in `onboarding_tester_examples.test.ts`. Run it and watch it fail.
2.  **GREEN**: Add the logic to `lib/payEngine.ts`. Run the test and watch it pass.
3.  **REFACTOR**: Clean up the math or documentation.

## 🗺️ Geographical Verification
We use the **Haversine Formula** for straight-line distances. 
*   **Reference Point**: Statue of Liberty to Empire State Building is verified at ~5.1 miles. If the formula ever changes, this test will alert us to inaccurate driver payouts based on geography.

---
*TrueServe - Transparent, Fair, and Fast.*
