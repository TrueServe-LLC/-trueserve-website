# TrueServe Driver-First Mobile App Plan

## Goal

Build the driver experience first because drivers need fast access to applications, documents, approval status, live routes, earnings, and support from a phone.

## Phase 1: Mobile Web / PWA Foundation

- Driver app hub at `/driver/app`.
- Driver signup remains at `/driver/signup`.
- Driver login remains at `/driver/login`.
- Driver dashboard remains at `/driver/dashboard`.
- PWA manifest opens to `/driver/app` so the installed web app starts in the driver flow.

## Phase 2: QA The Driver Flow

- Submit a driver application.
- Upload license, insurance, and registration.
- Confirm admins receive the application notification.
- Confirm admins can view uploaded documents from storage.
- Move the driver through pending documents, ready for review, approved, or rejected.
- Confirm the driver receives email notification when the application is received and approved.

## Phase 3: Native Wrapper

- Use Capacitor to wrap the existing Next.js driver routes for iOS and Android.
- Keep the same backend, auth, Supabase Storage, Stripe payout data, and admin approval flow.
- Add native app permissions only when needed: push notifications, location, and camera/document upload.

## Phase 4: Notifications

- Approval status alerts.
- Missing document alerts.
- New order available alerts.
- Pickup ready alerts.
- Payout and shift summary alerts.

## Phase 5: Store Submission

- Run TestFlight for iOS.
- Run Google Play internal testing.
- Verify privacy policy, terms, app screenshots, app icons, support contact, and driver account deletion flow.
- Do not submit publicly until signup, documents, admin approval, dashboard, and payout flows pass QA end to end.
