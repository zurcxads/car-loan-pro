# Database And Data Integrity Audit

## Scope

- Code reviewed:
  - [src/lib/db.ts](/home/zurc/Projects/car-loan-pro/src/lib/db.ts)
  - [src/lib/supabase.ts](/home/zurc/Projects/car-loan-pro/src/lib/supabase.ts)
  - [src/lib/supabase/server.ts](/home/zurc/Projects/car-loan-pro/src/lib/supabase/server.ts)
  - [src/lib/supabase/middleware.ts](/home/zurc/Projects/car-loan-pro/src/lib/supabase/middleware.ts)
  - [src/lib/mock-data.ts](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts)
  - [src/lib/types.ts](/home/zurc/Projects/car-loan-pro/src/lib/types.ts)
  - [src/lib/application-events.ts](/home/zurc/Projects/car-loan-pro/src/lib/application-events.ts)
  - [src/lib/magic-link.ts](/home/zurc/Projects/car-loan-pro/src/lib/magic-link.ts)
- Schema reviewed:
  - [scripts/setup-phase-b.sql](/home/zurc/Projects/car-loan-pro/scripts/setup-phase-b.sql)
  - [scripts/setup-database.sql](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql)

## Executive Summary

The current database layer is not internally consistent. The most important issues are:

1. The returned consumer `sessionToken` is not the token stored in the database, so token-based access is broken at creation time ([src/lib/db.ts:28](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L28), [src/app/api/applications/route.ts:162](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L162)).
2. RLS is enabled on core tables without any table policies, while most DB access uses the anon client, so production reads/writes will be denied unless there are missing out-of-band policies ([scripts/setup-database.sql:152](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L152), [src/lib/supabase.ts:31](/home/zurc/Projects/car-loan-pro/src/lib/supabase.ts#L31)).
3. The Phase B `documents` schema does not match the code at all: wrong column names, missing `user_id`, different status values, and nullable behavior mismatch ([scripts/setup-phase-b.sql:22](/home/zurc/Projects/car-loan-pro/scripts/setup-phase-b.sql#L22), [src/app/api/documents/upload/route.ts:75](/home/zurc/Projects/car-loan-pro/src/app/api/documents/upload/route.ts#L75)).
4. The app expects tables not defined in the reviewed SQL, especially `magic_links`, plus `activity_events` and `compliance_alerts` if only Phase B is applied ([src/lib/magic-link.ts:35](/home/zurc/Projects/car-loan-pro/src/lib/magic-link.ts#L35), [src/lib/db.ts:228](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L228)).
5. Foreign keys and indexes are incomplete for the actual access patterns, especially documents, notifications, tokens, and lender references.

## 1. Column And Table Mismatches

### Applications

Compared against [scripts/setup-database.sql:21](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L21) and usage in [src/lib/db.ts:302](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L302):

- Missing column: code reads and writes `has_vehicle`, but the table does not define it ([src/lib/db.ts:314](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L314), [src/lib/db.ts:344](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L344)).
- Nullability mismatch: code supports applications without a vehicle, but schema requires `vehicle JSONB NOT NULL` ([src/app/api/applications/route.ts:35](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L35), [scripts/setup-database.sql:27](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L27)).
- Nullability mismatch: code supports `loanAmount` being undefined for no-vehicle flows, but schema requires `loan_amount NUMERIC NOT NULL` ([src/app/api/applications/route.ts:39](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L39), [scripts/setup-database.sql:29](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L29)).
- Token shape mismatch in app model: DB stores `session_token` and `session_expires_at`, but `MockApplication` does not define `sessionToken` or `sessionExpiresAt`; code mutates them in via casts ([src/lib/db.ts:324](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L324), [src/lib/mock-data.ts:8](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts#L8)).

### Offers

Compared against [scripts/setup-database.sql:47](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L47) and usage in [src/lib/db.ts:356](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L356):

- Missing column: app types support `maxApprovedAmount`, but schema has no `max_approved_amount` and mapper does not persist it ([src/lib/mock-data.ts:87](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts#L87), [src/lib/types.ts:134](/home/zurc/Projects/car-loan-pro/src/lib/types.ts#L134)).
- Missing relationship column: deal submission requires an `offerId`, but `deals` does not persist any offer reference ([src/lib/validations.ts:142](/home/zurc/Projects/car-loan-pro/src/lib/validations.ts#L142), [scripts/setup-database.sql:111](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L111)).

### Lenders

Compared against [scripts/setup-database.sql:63](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L63) and usage in [src/lib/db.ts:391](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L391):

- Missing columns in DB for fields the app model exposes: `appsReceivedMTD`, `approvalRate`, `totalFundedVolume`, `totalReferralFeesOwed`, `lastActivity` ([src/lib/mock-data.ts:114](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts#L114), [src/lib/db.ts:412](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L412)).
- The code silently defaults those missing values to `0` or `now`, which hides the mismatch instead of failing fast ([src/lib/db.ts:412](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L412)).

### Documents

Compared against Phase B schema [scripts/setup-phase-b.sql:22](/home/zurc/Projects/car-loan-pro/scripts/setup-phase-b.sql#L22) and code in [src/app/api/documents/upload/route.ts:75](/home/zurc/Projects/car-loan-pro/src/app/api/documents/upload/route.ts#L75), [src/app/api/documents/route.ts:22](/home/zurc/Projects/car-loan-pro/src/app/api/documents/route.ts#L22):

- Missing column: code writes and filters by `user_id`; schema does not define it.
- Missing column: code writes `file_type`; schema does not define it.
- Column name mismatch: code writes and reads `storage_path`; schema defines `file_path`.
- Nullability mismatch: code allows `application_id` to be null; schema requires `application_id TEXT NOT NULL`.
- Status mismatch: code inserts `status = 'uploaded'`; schema comments only describe `pending|approved|rejected`.
- Document type mismatch: code allows `proof_of_insurance`, `proof_of_income`, `proof_of_address`; schema comment lists only `paystub`, `bank_statement`, `proof_of_residence`, `tax_return`, `drivers_license`, `other`.

### Notifications

Compared against Phase B schema [scripts/setup-phase-b.sql:41](/home/zurc/Projects/car-loan-pro/scripts/setup-phase-b.sql#L41) and code in [src/lib/db.ts:565](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L565):

- Semantic type mismatch: code uses `new_application`, `offer_ready`, `offer_selected`, `document_requested`, `deal_funded`, `system`; schema comments describe a different vocabulary (`application_submitted`, `offers_ready`, `document_approved`, `approval_complete`, `rate_expiring`, etc.).
- Unused schema column: schema has `application_id`, but `dbCreateNotification` never writes it ([src/lib/db.ts:600](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L600)).

### Missing Tables Expected By Code

- `magic_links` is used for token generation and verification but is not defined in either reviewed SQL script ([src/lib/magic-link.ts:35](/home/zurc/Projects/car-loan-pro/src/lib/magic-link.ts#L35)).
- If only `setup-phase-b.sql` is applied, the code will also be missing `applications`, `offers`, `lenders`, `dealers`, `deals`, `activity_events`, and `compliance_alerts` ([src/lib/db.ts:16](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L16), [src/lib/db.ts:228](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L228), [src/lib/db.ts:249](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L249)).

## 2. Mock Data vs Types

### Internal consistency inside `mock-data.ts`

The mock arrays do match the local `Mock*` interfaces in [src/lib/mock-data.ts](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts). I did not find a hard TypeScript shape violation in those exported arrays.

### Mismatch with app-wide types in `src/lib/types.ts`

The mock model is a different schema than the declared app types:

- `MockApplication` uses `borrower`, `employment`, `credit`, `vehicle`, while `Application` expects `personalInfo`, `addressInfo`, `employmentInfo`, `consent`, `userId`, `createdAt` ([src/lib/mock-data.ts:8](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts#L8), [src/lib/types.ts:107](/home/zurc/Projects/car-loan-pro/src/lib/types.ts#L107)).
- Statuses do not match: `MockAppStatus` is `pending_decision|offers_available|conditional|funded|declined`, but `ApplicationStatus` is `draft|submitted|decisioned|expired|funded` ([src/lib/mock-data.ts:4](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts#L4), [src/lib/types.ts:4](/home/zurc/Projects/car-loan-pro/src/lib/types.ts#L4)).
- `MockOffer` lacks the `tier` field required by `LenderOffer`; status unions differ too ([src/lib/mock-data.ts:78](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts#L78), [src/lib/types.ts:126](/home/zurc/Projects/car-loan-pro/src/lib/types.ts#L126)).
- `MockLender` and `Lender` use different field names (`minFico` vs `minFicoScore`, `maxLtv` vs `maxLtvPercent`, etc.) ([src/lib/mock-data.ts:94](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts#L94), [src/lib/types.ts:156](/home/zurc/Projects/car-loan-pro/src/lib/types.ts#L156)).

### Semantic data issue in mocks

- `OFR-007` has `lenderId: 'LND-002'` but `lenderName: 'Bank of America'`, while `LND-002` is `Capital One Auto` ([src/lib/mock-data.ts:292](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts#L292), [src/lib/mock-data.ts:308](/home/zurc/Projects/car-loan-pro/src/lib/mock-data.ts#L308)).

## 3. RLS Policies

### What exists

- Core tables `applications`, `offers`, and `deals` have RLS enabled in [scripts/setup-database.sql:152](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L152).
- Storage policies exist for `storage.objects` in Phase B ([scripts/setup-phase-b.sql:82](/home/zurc/Projects/car-loan-pro/scripts/setup-phase-b.sql#L82)).

### What is missing or broken

- No table policies are defined for `applications`, `offers`, or `deals`. With RLS enabled, anon/authenticated access is denied by default.
- Most app data access uses the anon client from [src/lib/supabase.ts:31](/home/zurc/Projects/car-loan-pro/src/lib/supabase.ts#L31), not the service role client. That means production DB calls in `db.ts` will fail under RLS unless there are external policies not in repo.
- No RLS is enabled or defined for Phase B tables `documents`, `notifications`, `application_events`, or `error_logs`.
- Storage policies are keyed on folder name matching `auth.uid()` ([scripts/setup-phase-b.sql:85](/home/zurc/Projects/car-loan-pro/scripts/setup-phase-b.sql#L85)), but the upload route trusts `userId` from form data and never checks that it equals the authenticated user ([src/app/api/documents/upload/route.ts:21](/home/zurc/Projects/car-loan-pro/src/app/api/documents/upload/route.ts#L21)).

### Do they make sense?

No. The policy set is incomplete and inconsistent with how the server code accesses data.

## 4. Foreign Key Relationships

### Defined

- `applications.user_id -> users.id` ([scripts/setup-database.sql:23](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L23))
- `offers.application_id -> applications.id` ([scripts/setup-database.sql:49](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L49))
- `deals.application_id -> applications.id` ([scripts/setup-database.sql:113](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L113))
- `deals.dealer_id -> dealers.id` ([scripts/setup-database.sql:114](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L114))

### Missing relationships

- `offers.lender_id` should reference `lenders(id)`.
- `documents.application_id` should reference `applications(id)`.
- `documents.user_id` should reference an auth/user identity, but that column is missing entirely from the schema.
- `notifications.application_id` should reference `applications(id)`.
- `application_events.application_id` should reference `applications(id)`.
- `deals` should likely store `offer_id` and reference `offers(id)` since API input requires it.
- `magic_links.application_id` should reference `applications(id)` once the table exists.

### Assessment

Foreign keys are only partially defined. Several important cross-table invariants are currently enforced only by application convention.

## 5. Indexes

### Present

- Core: `applications(status)`, `applications(state)`, `applications(session_token)`, `offers(application_id)`, `deals(dealer_id)`, `deals(application_id)` ([scripts/setup-database.sql:158](/home/zurc/Projects/car-loan-pro/scripts/setup-database.sql#L158))
- Phase B: `application_events(application_id)`, `application_events(created_at desc)`, `documents(application_id)`, `documents(status)`, `notifications(user_id)`, `notifications(read)`, `notifications(created_at desc)`, `error_logs(created_at desc)` ([scripts/setup-phase-b.sql:16](/home/zurc/Projects/car-loan-pro/scripts/setup-phase-b.sql#L16))

### Missing for real query patterns

- `applications(submitted_at)` for ordered application lists ([src/lib/db.ts:16](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L16)).
- `offers(id, status)` is covered by PK for `id`, but there is no index for status-driven admin/lender workflows.
- `notifications(user_id, read)` would be better than two separate single-column indexes for unread counts ([src/lib/db.ts:636](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L636)).
- `documents(user_id, uploaded_at)` is needed for the actual GET path, but the schema lacks `user_id` entirely ([src/app/api/documents/route.ts:22](/home/zurc/Projects/car-loan-pro/src/app/api/documents/route.ts#L22)).
- `magic_links(token)` unique index is needed, but the table does not exist.
- `offers(lender_id)` is missing if lender-specific queues or reporting are added.
- `notifications(application_id)` and `application_events(application_id, created_at)` would improve common history views.

### Assessment

Indexes exist for some basics, but they do not fully cover the implemented access paths.

## 6. Data Validation Before Insert

### Validated in app code

- Application submission uses Zod via [src/lib/validations.ts:101](/home/zurc/Projects/car-loan-pro/src/lib/validations.ts#L101) and [src/app/api/applications/route.ts:27](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L27).
- Deal submission uses Zod via [src/lib/validations.ts:140](/home/zurc/Projects/car-loan-pro/src/lib/validations.ts#L140) and [src/app/api/deals/route.ts:39](/home/zurc/Projects/car-loan-pro/src/app/api/deals/route.ts#L39).
- Document upload does manual checks for required fields, size, MIME type, and type whitelist ([src/app/api/documents/upload/route.ts:24](/home/zurc/Projects/car-loan-pro/src/app/api/documents/upload/route.ts#L24)).

### Not adequately validated

- `dbCreateApplication`, `dbCreateOffer`, `dbCreateDeal`, and `dbCreateNotification` accept partial objects and perform no internal validation ([src/lib/db.ts:28](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L28), [src/lib/db.ts:109](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L109), [src/lib/db.ts:201](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L201), [src/lib/db.ts:597](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L597)).
- Magic link send only checks presence of `email` and `applicationId`; there is no email format validation at the route boundary ([src/app/api/auth/magic-link/send/route.ts:17](/home/zurc/Projects/car-loan-pro/src/app/api/auth/magic-link/send/route.ts#L17)).
- There are almost no DB-level `CHECK` constraints for status enums, document types, positive numbers, or token expiration invariants.

### Assessment

Validation exists on some API routes, but the lower-level DB layer still relies heavily on caller discipline and loose DB schemas.

## 7. Migration Strategy From Mock Data To Production

There is not a clear migration strategy.

- The codebase still treats mock data as a first-class fallback for most core entities ([src/lib/db.ts:14](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L14)).
- `setup-db.ts` only seeds lenders; it does not migrate applications, offers, dealers, deals, events, alerts, or notifications ([src/lib/setup-db.ts:26](/home/zurc/Projects/car-loan-pro/src/lib/setup-db.ts#L26)).
- There is no migration versioning system, no ordered migrations directory, and no backfill script for moving mock records into normalized production tables.
- Phase B is not safely rerunnable as-written for triggers: `CREATE TRIGGER` is used without guarding against existing triggers ([scripts/setup-phase-b.sql:171](/home/zurc/Projects/car-loan-pro/scripts/setup-phase-b.sql#L171), [scripts/setup-phase-b.sql:192](/home/zurc/Projects/car-loan-pro/scripts/setup-phase-b.sql#L192)).

## 8. Session / Token Management

### Supabase / NextAuth session handling

- Supabase SSR sessions are cookie-based through `createServerClient` in [src/lib/supabase/server.ts:7](/home/zurc/Projects/car-loan-pro/src/lib/supabase/server.ts#L7) and refreshed in middleware ([src/lib/supabase/middleware.ts:7](/home/zurc/Projects/car-loan-pro/src/lib/supabase/middleware.ts#L7)).
- NextAuth uses JWT sessions in cookies, not DB-backed sessions ([src/lib/auth.ts:102](/home/zurc/Projects/car-loan-pro/src/lib/auth.ts#L102)).

### Custom application session tokens

- `dbCreateApplication` stores `session_token` and `session_expires_at` in `applications` ([src/lib/db.ts:44](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L44)).
- `dbGetApplicationByToken` validates token equality and expiration, but token is stored in plaintext, not hashed ([src/lib/db.ts:71](/home/zurc/Projects/car-loan-pro/src/lib/db.ts#L71)).
- Critical bug: the API generates and returns a second random `sessionToken` after creation instead of returning the DB-backed one, so the client receives a token that cannot be looked up later ([src/app/api/applications/route.ts:162](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L162)).
- Middleware only checks whether `?token=` or `?magic=` is present on `/dashboard`; it does not validate either token before allowing access ([src/lib/supabase/middleware.ts:60](/home/zurc/Projects/car-loan-pro/src/lib/supabase/middleware.ts#L60)).

### Magic link tokens

- Magic link tokens are also stored in plaintext and marked used after lookup ([src/lib/magic-link.ts:34](/home/zurc/Projects/car-loan-pro/src/lib/magic-link.ts#L34)).
- The `magic_links` table is missing from schema, so this cannot work as deployed from repo SQL alone.
- There is no uniqueness constraint or index shown for `token`.

### Additional auth issue

- [src/app/api/applications/route.ts:134](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L134) uses `supabase.auth.admin.*` on the SSR anon client from [src/lib/supabase/server.ts:7](/home/zurc/Projects/car-loan-pro/src/lib/supabase/server.ts#L7). That requires service-role privileges and is likely to fail in production.

## 9. Overall Assessment By Audit Question

- Columns expected vs schema: multiple hard mismatches, especially `applications.has_vehicle`, the entire `documents` table shape, and missing `magic_links`.
- Mock data vs types: mock data matches local `Mock*` interfaces, but those interfaces do not match the app-wide types in `src/lib/types.ts`.
- RLS policies: partially defined and not coherent with actual client usage.
- Foreign keys: incomplete.
- Indexes: partial coverage only.
- Validation before insert: mixed; some route-level validation, weak DB-layer guarantees.
- Migration strategy: unclear and incomplete.
- Session/token storage and validation: split across Supabase cookies, NextAuth JWTs, plaintext application tokens, and missing magic-link schema; currently unsafe and partly broken.

## Recommended Fix Order

1. Unify the schema source of truth and add real migrations.
2. Fix the `applications` schema/code contract: add `has_vehicle`, relax `vehicle` and `loan_amount` nullability if no-vehicle flows are supported, and return the actual stored session token.
3. Redesign `documents` to match the code or vice versa; right now it will not work.
4. Add the missing `magic_links` table with indexes, expiry handling, and hashed tokens.
5. Define actual RLS policies for every table used by anon/authenticated clients, or move server-only access to the service-role client deliberately.
6. Add missing FKs and composite indexes for real query patterns.
