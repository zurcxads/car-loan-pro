# Auto Loan Pro Security and Data Audit

Date: 2026-03-14

## Findings

### CRITICAL - Supabase service-role key is committed to the repository
- Files:
  - [run-schema.js](/home/zurc/Projects/car-loan-pro/run-schema.js#L4)
  - [run-schema.js](/home/zurc/Projects/car-loan-pro/run-schema.js#L5)
  - [setup-db.mjs](/home/zurc/Projects/car-loan-pro/setup-db.mjs#L4)
  - [setup-db.mjs](/home/zurc/Projects/car-loan-pro/setup-db.mjs#L5)
- Impact: Anyone with repo access can use the service-role JWT to bypass RLS, read/modify all database rows, and access storage/admin APIs.
- Notes: This also violates the env-var requirement; these values should only come from `process.env`.

### CRITICAL - Hardcoded demo credentials can still authenticate in the live auth flow
- Files:
  - [src/lib/auth.ts](/home/zurc/Projects/car-loan-pro/src/lib/auth.ts#L8)
  - [src/lib/auth.ts](/home/zurc/Projects/car-loan-pro/src/lib/auth.ts#L14)
  - [src/lib/auth.ts](/home/zurc/Projects/car-loan-pro/src/lib/auth.ts#L22)
  - [src/lib/auth.ts](/home/zurc/Projects/car-loan-pro/src/lib/auth.ts#L30)
  - [src/lib/auth.ts](/home/zurc/Projects/car-loan-pro/src/lib/auth.ts#L38)
  - [src/lib/auth.ts](/home/zurc/Projects/car-loan-pro/src/lib/auth.ts#L78)
  - [src/lib/test-data.ts](/home/zurc/Projects/car-loan-pro/src/lib/test-data.ts#L153)
  - [src/lib/test-data.ts](/home/zurc/Projects/car-loan-pro/src/lib/test-data.ts#L169)
- Impact: `authorize()` always falls back to `DEMO_USERS`, so known credentials like `admin@autoloanpro.co / admin2026` and `dealer@demo.com / demo123` can produce privileged sessions whenever the email is not found in the DB.
- Notes: This is an auth bypass, not just a test-data issue.

### CRITICAL - Public `/api/applications` exposes full application inventory and borrower PII without authentication
- Files:
  - [src/app/api/applications/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L11)
  - [src/app/api/applications/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L15)
  - [src/app/api/applications/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L56)
  - [src/app/api/applications/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L89)
- Impact: An unauthenticated caller can enumerate applications and receive borrower names, emails, phones, DOB, masked SSN, addresses, employment, credit profile, and vehicle data.
- Notes: Even in mock mode this leaks realistic sample PII; with Supabase configured it can leak real records.

### CRITICAL - RLS policies effectively grant unrestricted access instead of service-role-only access
- Files:
  - [supabase/schema.sql](/home/zurc/Projects/car-loan-pro/supabase/schema.sql#L170)
  - [supabase/schema.sql](/home/zurc/Projects/car-loan-pro/supabase/schema.sql#L180)
  - [supabase/migrations/005_add_stipulations_and_docs.sql](/home/zurc/Projects/car-loan-pro/supabase/migrations/005_add_stipulations_and_docs.sql#L90)
  - [supabase/migrations/005_add_stipulations_and_docs.sql](/home/zurc/Projects/car-loan-pro/supabase/migrations/005_add_stipulations_and_docs.sql#L98)
- Impact: Policies such as `USING (true) WITH CHECK (true)` do not restrict access to the Supabase service role; they broadly allow reads/writes on applications, offers, deals, users, notifications, documents, settings, and messages if the role has table privileges.
- Notes: This negates tenant isolation and amplifies every route bug that uses the anon/authenticated client.

### HIGH - Session/access tokens are placed in URLs and browser storage, then used to return borrower data
- Files:
  - [src/app/api/dashboard/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/dashboard/route.ts#L7)
  - [src/app/api/dashboard/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/dashboard/route.ts#L49)
  - [src/app/apply/page.tsx](/home/zurc/Projects/car-loan-pro/src/app/apply/page.tsx#L346)
  - [src/app/apply-v2/page.tsx](/home/zurc/Projects/car-loan-pro/src/app/apply-v2/page.tsx#L372)
  - [src/lib/lender-engine.ts](/home/zurc/Projects/car-loan-pro/src/lib/lender-engine.ts#L88)
  - [src/app/api/offers/[id]/select/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/offers/[id]/select/route.ts#L69)
  - [src/app/page.tsx](/home/zurc/Projects/car-loan-pro/src/app/page.tsx#L194)
  - [src/app/api/auth/magic-link/verify/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/auth/magic-link/verify/route.ts#L31)
- Impact: Tokens can leak via browser history, logs, referers, screenshots, and shared links. Those tokens unlock dashboard/results data including borrower profile fields.
- Notes: Consumer access should move to short-lived server sessions in `httpOnly` cookies.

### HIGH - Broken object-level authorization across authenticated routes allows cross-tenant data access and mutation
- Files:
  - [src/app/api/applications/[id]/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/applications/[id]/route.ts#L22)
  - [src/app/api/applications/[id]/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/applications/[id]/route.ts#L45)
  - [src/app/api/documents/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/documents/route.ts#L12)
  - [src/app/api/documents/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/documents/route.ts#L69)
  - [src/app/api/documents/upload/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/documents/upload/route.ts#L21)
  - [src/app/api/documents/download/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/documents/download/route.ts#L23)
  - [src/app/api/deals/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/deals/route.ts#L24)
  - [src/app/api/deals/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/deals/route.ts#L48)
  - [src/app/api/deals/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/deals/route.ts#L99)
  - [src/app/api/referrals/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/referrals/route.ts#L14)
  - [src/app/api/notifications/[id]/read/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/notifications/[id]/read/route.ts#L16)
  - [src/app/api/notifications/unread-count/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/notifications/unread-count/route.ts#L14)
  - [src/app/api/lenders/[lenderId]/applications/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/lenders/[lenderId]/applications/route.ts#L13)
  - [src/app/api/webhooks/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/webhooks/route.ts#L13)
  - [src/app/api/webhooks/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/webhooks/route.ts#L53)
  - [src/app/api/webhooks/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/webhooks/route.ts#L101)
  - [src/app/api/webhooks/test/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/webhooks/test/route.ts#L13)
- Impact: Any authenticated user, and in some cases any authenticated lender/dealer, can query or mutate other users' applications, documents, notifications, referrals, deals, webhook configs, or lender pipelines by supplying another ID.
- Notes: Several files already acknowledge this with `TODO: Add ownership check`, confirming the missing authorization boundary.

### HIGH - `/api/plaid/exchange-token` is unauthenticated and uses server-side Plaid credentials to return identity/account data
- Files:
  - [src/app/api/plaid/exchange-token/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/plaid/exchange-token/route.ts#L4)
  - [src/app/api/plaid/exchange-token/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/plaid/exchange-token/route.ts#L16)
  - [src/app/api/plaid/exchange-token/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/plaid/exchange-token/route.ts#L35)
  - [src/app/api/plaid/exchange-token/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/plaid/exchange-token/route.ts#L45)
- Impact: Anyone can use the platform's Plaid credentials as a proxy, exchange arbitrary public tokens, and retrieve account/owner identity data at the app's expense.

### MEDIUM - Email and phone verification endpoints are placeholders that accept any 6-digit code
- Files:
  - [src/app/api/verify/email/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/verify/email/route.ts#L24)
  - [src/app/api/verify/email/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/verify/email/route.ts#L55)
  - [src/app/api/verify/email/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/verify/email/route.ts#L62)
  - [src/app/api/verify/phone/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/verify/phone/route.ts#L24)
  - [src/app/api/verify/phone/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/verify/phone/route.ts#L55)
  - [src/app/api/verify/phone/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/verify/phone/route.ts#L62)
- Impact: If these endpoints are wired into onboarding or recovery flows, verification can be bypassed trivially.

### MEDIUM - Sensitive document handling is not backed by encryption/masking guarantees in code
- Files:
  - [src/app/api/documents/upload/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/documents/upload/route.ts#L52)
  - [src/app/api/documents/upload/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/documents/upload/route.ts#L75)
  - [src/lib/email-templates.ts](/home/zurc/Projects/car-loan-pro/src/lib/email-templates.ts#L180)
- Impact: The code stores raw uploaded files and document metadata in Supabase storage/DB, while the product copy claims documents are "encrypted and securely stored". I found no application-level encryption, envelope encryption, or key management for SSN-bearing uploads.
- Notes: SSNs entered during application submission are masked before persistence, which is good, but uploaded bank statements/paystubs/IDs remain sensitive.

## Rate Limiting Coverage

### Present
- [src/middleware.ts](/home/zurc/Projects/car-loan-pro/src/middleware.ts#L9): `POST /api/applications` has a dedicated limit of 10/hour/IP.
- [src/middleware.ts](/home/zurc/Projects/car-loan-pro/src/middleware.ts#L23): Most `/api/*` routes get a generic 100/min/IP limit.
- [src/lib/error-tracking.ts](/home/zurc/Projects/car-loan-pro/src/lib/error-tracking.ts#L18): Client-side error logging is rate limited, but this is not request protection.

### Missing or Weak
- `/api/auth/*` is excluded from the middleware limiter, so magic-link send/verify have no request throttling.
  - [src/middleware.ts](/home/zurc/Projects/car-loan-pro/src/middleware.ts#L24)
  - [src/app/api/auth/magic-link/send/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/auth/magic-link/send/route.ts#L12)
  - [src/app/api/auth/magic-link/verify/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/auth/magic-link/verify/route.ts#L12)
- Email and phone verification flows explicitly note missing per-user throttles.
  - [src/app/api/verify/email/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/verify/email/route.ts#L24)
  - [src/app/api/verify/phone/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/verify/phone/route.ts#L24)
- Plaid exchange has only the generic global limiter, no endpoint-specific protection despite third-party cost/abuse potential.
  - [src/app/api/plaid/exchange-token/route.ts](/home/zurc/Projects/car-loan-pro/src/app/api/plaid/exchange-token/route.ts#L16)
- Document upload/download, webhook test, referrals, and notification enumeration rely only on the generic limiter.

## SQL Injection Review

### No confirmed SQL injection vector found in request-handling code
- I did not find user-controlled raw SQL in `src/app/api` or `src/lib`.
- The live data paths use Supabase query-builder methods (`.eq`, `.insert`, `.update`, `.delete`) rather than string-built SQL.
- Raw SQL exists in setup/migration scripts, but I found no path where request data is interpolated into those scripts at runtime.

## XSS Review

### No confirmed direct browser XSS sink from user-controlled data
- `dangerouslySetInnerHTML` usage in the app is limited and sanitized with DOMPurify where rich HTML is rendered.
  - [src/app/admin/email-templates/page.tsx](/home/zurc/Projects/car-loan-pro/src/app/admin/email-templates/page.tsx#L162)
  - [src/app/resources/[slug]/page.tsx](/home/zurc/Projects/car-loan-pro/src/app/resources/[slug]/page.tsx#L169)
  - [src/app/resources/[slug]/page.tsx](/home/zurc/Projects/car-loan-pro/src/app/resources/[slug]/page.tsx#L182)
- Residual risk: outbound HTML emails interpolate unescaped names/URLs, which is more of an email-content injection issue than a browser XSS sink.

## CORS / Redirect / CSRF Review

### CORS
- I found no permissive `Access-Control-Allow-Origin: *` handling in app routes.
- The app appears to rely on browser same-origin defaults rather than custom CORS logic.

### Redirects
- I found no confirmed open redirect driven by attacker-controlled URL parameters.
- External redirects I found are to Supabase signed URLs for document download, not arbitrary user input.

### CSRF
- I found no explicit CSRF token validation on application mutation routes.
- Risk is partly reduced because the app relies on same-origin defaults and auth cookies, but there is no dedicated anti-CSRF layer for sensitive POST/PATCH/DELETE actions.

## Recommended Order of Remediation
1. Revoke and rotate the exposed Supabase service-role key immediately.
2. Remove demo credentials from the auth path and disable all prod fallback accounts.
3. Lock down `/api/applications` and fix RLS policies before any further deployment.
4. Replace query-string consumer tokens with server-managed `httpOnly` sessions.
5. Add object-level authorization checks to every route that accepts `id`, `userId`, `dealerId`, `lenderId`, or `documentId`.
6. Require auth and stricter throttling on Plaid and magic-link endpoints.
