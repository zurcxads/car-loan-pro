# Deployment Environment Setup

## `NEXT_PUBLIC_APP_ENV`

Set `NEXT_PUBLIC_APP_ENV` per deployment target:

- Local development: `development`
- Vercel preview deploys: `staging`
- Production domain `autoloanpro.co`: `production`

## Required environment variables

These variables should be configured for each environment:

- `NEXT_PUBLIC_APP_ENV`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PLAID_CLIENT_ID` and `PLAID_SECRET` when Plaid is enabled
- `PLAID_ENV` when Plaid is enabled

## Vercel notes

- Production environment for `autoloanpro.co`: set `NEXT_PUBLIC_APP_ENV=production`
- Preview environments: set `NEXT_PUBLIC_APP_ENV=staging`
- Do not enable development-only routes or demo credentials outside local development
