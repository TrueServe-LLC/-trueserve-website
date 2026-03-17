# E2E Testing (Playwright)

We use Playwright to simulate real user behavior on mobile and desktop.

## Running Tests
Located in the `e2e/` directory.

### Commands
- `pnpm test:e2e`: Runs all tests in headless mode.
- `npx playwright test --ui`: Opens the visual test runner.

## Key Test Areas
- **Mobile Navigation**: Ensures Bottom Nav appears for customers and drivers.
- **Onboarding**: Full flow for new driver signups.
- **Permissions**: Verifying that unauthorized users can't see the Merchant Dashboard.

---
#tags/qa #testing #playwright
