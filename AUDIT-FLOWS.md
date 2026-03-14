# Auto Loan Pro Functional Flow Audit

Audit date: 2026-03-14
Method: code-path audit only, tracing UI -> route/action -> DB/auth/email/middleware.

## Summary

| Flow | Status | Verdict |
| --- | --- | --- |
| Homepage -> Apply -> Submit | BROKEN | Application can be created, but the returned token is not the stored session token, and the results page also reads the API response incorrectly. |
| Results page -> Offer selection | BROKEN | Initial offers fetch is read with the wrong response shape, so users usually see no offers; selection then leads into a broken dashboard path. |
| Login/auth flows | BROKEN | Consumer magic-link send is mock-only UI, verify redirects with params the dashboard does not use, and portal/API auth is split between Supabase and NextAuth. |
| Calculator page | WORKS | Standalone client-side calculator logic works without backend dependencies. |
| Contact page | MOCK-ONLY | Form never posts anywhere; submit only flips local UI state. |
| Admin portal | BROKEN | No real user-facing admin login path; dashboard can fall back to mock data; some admin pages call missing APIs. |
| Lender portal | BROKEN | No real lender login path; queue uses client-side DB/mock access; decision actions are UI-only and do not persist. |
| Dealer portal | BROKEN | No real dealer login path; dashboard/inbox are mostly direct mock data; real deal flow is not wired from the UI. |

## 1. Homepage -> Apply Form -> Submit

**Status: BROKEN**

### Code path

1. `src/app/page.tsx`
   - Hero form `handleHeroSubmit()` only builds query params and redirects to `/apply`.
   - Params sent: `name`, `creditRange`, `loanAmount`.
2. `src/app/apply/page.tsx`
   - The apply page does not read those homepage query params, so the homepage mini-form does not actually prefill anything.
   - Real submit happens in `submitApplication()`.
   - It posts to `/api/applications` via `apiPost()`.
3. `src/app/api/applications/route.ts`
   - Validates payload.
   - Builds mock/derived credit profile.
   - Calls `dbCreateApplication()`.
   - Kicks off `matchLendersAndGenerateOffers()` in the background.
   - Returns `{ id, sessionToken, userId }`.
4. `src/lib/db.ts`
   - `dbCreateApplication()` already generates and stores the real `session_token` on the application record.
5. `src/app/api/applications/route.ts`
   - Generates a second brand-new `sessionToken` after the DB insert and returns that one instead of the stored token.
6. `src/app/apply/page.tsx`
   - Redirects user to `/results?token=<returned token>`.

### Why it breaks

- The homepage mini-form is cosmetic only; its values are ignored by `/apply`.
- The token returned by `/api/applications` is not the token stored on the application.
- `/api/results` looks up applications by stored `session_token`, so the redirected token is invalid.
- `localStorage` only saves `clp_current_app_id`; the homepage checks `alp_session_token` too, but that key is never written.

### End-to-end verdict

The user can submit an application record, but the user-facing flow from submit -> results is broken.

## 2. Results Page -> Offer Selection

**Status: BROKEN**

### Code path

1. `src/app/results/page.tsx`
   - Reads `token` from query string.
   - Fetches `/api/results?token=...`.
2. `src/app/api/results/route.ts`
   - Looks up application by token via `dbGetApplicationByToken()`.
   - Fetches offers with `dbGetOffersByApplication()`.
   - Returns `apiSuccess({ offers, suggestedDownPayment })`.
3. `src/app/results/page.tsx`
   - Expects the JSON shape to be `{ offers, suggestedDownPayment }`.
   - Actual shape is `{ success: true, data: { offers, suggestedDownPayment } }`.
   - It does `setOffers(data.offers || [])`, so it drops the actual offers.
4. If a user somehow reaches selection anyway:
   - `handleConfirmSelection()` posts to `/api/results/select`.
5. `src/app/api/results/select/route.ts`
   - Validates token and offer.
   - Marks offer `selected`.
   - Marks application `conditional`.
   - Returns `apiSuccess({ lenderName, offerId, selectedTerm, selectedDownPayment })`.
6. `src/app/results/page.tsx`
   - Again expects unwrapped JSON and reads `data.lenderName`, which will be `undefined`.
   - Redirects to `/dashboard?token=<same token>`.
7. `src/app/dashboard/page.tsx`
   - Fetches `/api/dashboard?token=...`.
8. `src/app/api/dashboard/route.ts`
   - Returns `apiSuccess({ application: ... })`.
9. `src/app/dashboard/page.tsx`
   - Again expects unwrapped JSON and reads `data.application`, so it fails to populate the dashboard.

### Why it breaks

- The results page reads the wrapped API response incorrectly.
- Users will usually land on the “No Offers Available” state even if offers exist.
- Selection does persist server-side if reached, but the UI reads the response incorrectly again.
- The dashboard page has the same response-shape bug.
- If the original token came from `/api/applications`, it is already invalid anyway.

### End-to-end verdict

This flow does not work end-to-end for real users.

## 3. Login/Auth Flows

**Status: BROKEN**

### Consumer magic link flow

### Code path

1. `src/app/login/page.tsx`
   - “Send Me a Link” does not call any API.
   - It only waits 1.5 seconds and shows success.
2. Real send endpoint exists at `src/app/api/auth/magic-link/send/route.ts`.
   - It requires both `email` and `applicationId`.
   - The login page only collects `email`, so even if wired up later it still lacks required input.
3. Verification endpoint `src/app/api/auth/magic-link/verify/route.ts`
   - Verifies token from `magic_links`.
   - Redirects to `/dashboard?magic=<uuid>&app_id=<applicationId>`.
4. `src/lib/supabase/middleware.ts`
   - Allows `/dashboard` access if `token` or `magic` exists.
5. `src/app/dashboard/page.tsx`
   - Only reads `token`.
   - Ignores `magic` and `app_id`.

### Why it breaks

- The visible login page is mock-only.
- The real send route is not wired to the page and needs `applicationId` that the page never gathers.
- The verify route redirects with `magic`, but the dashboard page only supports `token`.

### Session token / returning user flow

- `src/app/page.tsx` checks `alp_session_token` and `clp_current_app_id`.
- The app only writes `clp_current_app_id`.
- `alp_session_token` is never stored client-side.

### Portal auth mismatch

- `src/lib/auth-context.tsx` uses Supabase Auth in the browser (`signInWithPassword`, `getUser`).
- Protected APIs use `requireAuth()` in `src/lib/api-helpers.ts`, which checks NextAuth sessions instead.
- There is a NextAuth credentials provider in `src/lib/auth.ts`, but no user-facing login page calls `next-auth` `signIn()`.
- Middleware for `/admin`, `/lender`, `/dealer` checks Supabase user metadata roles and redirects unauthenticated users to `/auth/login`, which just redirects to the magic-link consumer `/login`.

### End-to-end verdict

Consumer login is not actually implemented end-to-end, and staff portal auth is split across incompatible systems.

## 4. Calculator Page

**Status: WORKS**

### Code path

- `src/app/calculator/page.tsx` is fully client-side.
- Payment calculation uses local helper functions only.
- Amortization schedule is generated locally.
- No API call, DB lookup, or auth dependency is required.

### Notes

- The page links to `#` for “Resources”, so that nav item is unfinished.
- The actual calculator behavior works standalone.

### End-to-end verdict

The calculator itself works as a standalone page.

## 5. Contact Page

**Status: MOCK-ONLY**

### Code path

- `src/app/contact/page.tsx`
  - `handleSubmit()` only does `e.preventDefault()` and `setSubmitted(true)`.
  - No fetch, server action, email send, webhook, or DB insert exists.

### End-to-end verdict

The contact form is UI-only and does not submit anywhere.

## 6. Portal Flows

## 6.1 Admin Portal

**Status: BROKEN**

### Login

- Middleware requires a Supabase-authenticated user with `user_metadata.role === 'admin'`.
- Unauthenticated users are sent to `/auth/login`, which redirects to the consumer `/login` page.
- There is no real admin login UI wired to either Supabase or NextAuth.

### Data visibility

- Main admin dashboard components (`PlatformOverview`, `ApplicationManagement`) call `dbGetApplications()`, `dbGetOffers()`, etc directly from the client.
- If Supabase is not configured, they use in-memory mock data.
- If Supabase is configured but browser anon access is blocked by RLS, many `db.ts` helpers fall back to mock data on error anyway.

### Broken subflows

- `src/app/admin/settings/page.tsx` calls `/api/admin/settings`, but that route does not exist.
- `src/app/admin/review/page.tsx` calls `/api/admin/review` and `/api/admin/review/action`, but those routes do not exist.
- `src/app/admin/analytics/page.tsx` calls `/api/admin/analytics`; that route exists, but the page relies on Supabase browser auth while the API requires NextAuth admin auth, so the session systems do not match.

### End-to-end verdict

Admin users do not have a real login path, and the portal mixes missing APIs with mock/fallback data.

## 6.2 Lender Portal

**Status: BROKEN**

### Login

- Same portal login problem as admin: middleware expects Supabase role auth, but the user-facing login path is the consumer magic-link page.

### Data visibility

- `src/components/lender/ApplicationQueue.tsx` loads applications by calling `dbGetApplications()` directly in the client.
- That means it bypasses the lender-scoped API route and can show all applications when data loads.
- If browser access fails, `db.ts` falls back to mock data.

### Actions

- `src/components/lender/DecisionModal.tsx` never calls an API.
- Approve/decline/counter/request-docs actions only show a success state and close.
- No offer, decline, or doc-request is persisted from the visible lender UI.

### End-to-end verdict

The lender portal is not a real operational flow; login is broken and key actions are UI-only.

## 6.3 Dealer Portal

**Status: BROKEN**

### Login

- Same broken staff login path as admin/lender.

### Data visibility

- `src/components/dealer/DealerDashboard.tsx` uses `MOCK_APPLICATIONS` directly.
- `src/components/dealer/BuyerInbox.tsx` uses `MOCK_APPLICATIONS` and `MOCK_OFFERS` directly.
- `src/components/dealer/LeadManagement.tsx` and `DealerSettings.tsx` also use mock data directly.

### Actions

- Dealer UI has a `Start Deal` callback, but on the main dealer page it is passed as a no-op.
- Real dealer API routes exist for buyers and deals, but the visible UI is not wired to them.

### End-to-end verdict

Dealer users cannot follow a real login -> real data -> real deal creation flow from the current UI.

## Final Verdict

The only clearly working standalone user flow is the calculator. The consumer application/results/dashboard path is broken, the contact form is mock-only, and the admin/lender/dealer portals are not operational end-to-end for real users.
