# Docker Guide

We use Docker to ensure "It works on my machine" translates to "It works in production."

## The Build Process
Our `Dockerfile` uses a multi-stage approach to keep images under 150MB.

### Build Command
```bash
docker build -t trueserve-app .
```

### Run Locally
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="key" \
  trueserve-app
```

## Security
- Images run as a non-root user (`nextjs`).
- Secrets are **not** baked into the image; they are injected via environment variables.

---
#tags/docker #containers #setup
