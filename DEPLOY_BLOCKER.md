# Deploy Blocker

Production deploy could not be triggered in this environment.

## Blockers
- `vercel --prod --yes` could not be run because Vercel CLI is not installed (`vercel: command not found`).
- Dependency installation is currently blocked by DNS/network failures to npm registry:
  - `getaddrinfo EAI_AGAIN registry.npmjs.org`
- Because dependencies cannot be installed, validation cannot be completed successfully in this environment:
  - `pnpm install` failed due to the DNS error above.
  - `pnpm lint` and `pnpm build` now fail locally because `node_modules` cannot be fully restored without registry access.

## Commands attempted
- `CI=true pnpm install`
- `pnpm install --offline --frozen-lockfile`
- `pnpm lint`
- `CI=true pnpm build`
- `vercel --prod --yes`
