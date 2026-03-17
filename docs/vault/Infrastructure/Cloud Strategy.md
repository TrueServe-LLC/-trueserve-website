# Cloud Strategy

This document outlines our hosting and infrastructure evolution.

## Current State: Hybrid Managed
We currently use a "Low-Ops" approach to maximize development speed.
- **Frontend/API**: Next.js (Scalable SSR/Static).
- **Backend/DB/Auth**: [[Supabase]].

## The Roadmap

### Level 1: MVP (Where we are)
- Next.js on a Managed Host.
- Local development via `pnpm dev`.
- Automated QA via [[E2E Testing (Playwright)|Playwright]].

### Level 2: Containerization (Active Phase)
- Build [[Docker Guide|Docker Images]].
- Move to "Serverless Containers" (e.g., Google Cloud Run).
- This removes the "Vercel Lock-in" while keeping maintenance low.

### Level 3: Orchestration (Scalability Goal)
- Full [[Kubernetes Implementation]].
- Dynamic scaling based on request patterns.
- Multi-service architecture.

---
#tags/strategy #cloud #roadmap
