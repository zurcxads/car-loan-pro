# Auto Loan Pro: Code Quality and Architecture Audit

Audit date: 2026-03-14

## Scope and method

- Reviewed the full `src/` tree, `package.json`, route structure under `src/app/api`, and shared libs.
- Ran `npx tsc --noEmit`: passed.
- Ran ESLint focused on unused symbols: failed with 28 findings, mostly dead params/vars.
- Searched for `any`, `@ts-ignore`, `@ts-expect-error`, `console.log`, repeated route patterns, and package usage.

## Executive summary

The codebase is generally shippable, but it has clear architectural drift:

- Dead code has accumulated in shared libs, hooks, and components.
- API routes are only partially standardized; many handlers bypass the shared helper layer or duplicate nearly identical logic.
- TypeScript is configured with `strict: true`, but enforcement is softened by compiler options and missing unused-symbol checks.
- Client-side bundle weight is higher than it needs to be because global layout hydration and `framer-motion` are used very broadly.
- Dependency hygiene is weak: several packages appear unused, and the framework baseline is behind current major releases.

## 1. Dead code

### Confirmed unused files / modules

- [`src/components/documents/DocumentUpload.tsx`](/home/zurc/Projects/car-loan-pro/src/components/documents/DocumentUpload.tsx#L1) is never imported. The dashboard uses its own inline upload UI instead in [`src/app/dashboard/documents/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/documents/page.tsx#L26).
- [`src/lib/hooks.ts`](/home/zurc/Projects/car-loan-pro/src/lib/hooks.ts#L26) exports SWR hooks and `apiPost`/`apiPatch`, but repo search shows no consumer outside the file itself.
- [`src/lib/toast.tsx`](/home/zurc/Projects/car-loan-pro/src/lib/toast.tsx#L1) is never imported.
- [`src/lib/generate-approval-letter.ts`](/home/zurc/Projects/car-loan-pro/src/lib/generate-approval-letter.ts#L1) is never imported; the active PDF path uses [`src/lib/pdf-template.tsx`](/home/zurc/Projects/car-loan-pro/src/lib/pdf-template.tsx#L176) instead.
- [`src/lib/onboarding-steps.tsx`](/home/zurc/Projects/car-loan-pro/src/lib/onboarding-steps.tsx#L1) appears unused.
- [`src/lib/auth-types.ts`](/home/zurc/Projects/car-loan-pro/src/lib/auth-types.ts#L1) appears unused.

### Dead symbols caught by lint

- Unused state/vars and params exist in multiple files, including:
  - [`src/app/dashboard/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/page.tsx#L128) `statusColors`
  - [`src/components/offers/OfferCard.tsx`](/home/zurc/Projects/car-loan-pro/src/components/offers/OfferCard.tsx)
  - [`src/components/shared/PortalLayout.tsx`](/home/zurc/Projects/car-loan-pro/src/components/shared/PortalLayout.tsx)
  - [`src/lib/email-templates.ts`](/home/zurc/Projects/car-loan-pro/src/lib/email-templates.ts#L16) `BASE_URL`

### Assessment

- Dead code level: moderate.
- Main cause: parallel feature experiments left in place after replacement implementations landed.

## 2. TypeScript strictness

### What is good

- `strict: true` is enabled in [`tsconfig.json`](/home/zurc/Projects/car-loan-pro/tsconfig.json).
- `npx tsc --noEmit` passes.
- No `@ts-ignore`, `@ts-expect-error`, or explicit `any` usages were found in `src/`.

### Where strictness is weaker than it looks

- [`tsconfig.json`](/home/zurc/Projects/car-loan-pro/tsconfig.json) still has `allowJs: true` and `skipLibCheck: true`, which reduce enforcement.
- `noUnusedLocals` and `noUnusedParameters` are not enabled, so TypeScript is not catching the dead-symbol issues that ESLint found.
- [`src/app/dashboard/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/page.tsx#L1) disables `@typescript-eslint/no-unused-vars` for the file.
- [`src/lib/auth-context.tsx`](/home/zurc/Projects/car-loan-pro/src/lib/auth-context.tsx#L72) has a `react-hooks/exhaustive-deps` warning because the effect reads `user` but has an empty dependency array.

### Assessment

- Type safety is decent.
- Strictness discipline is only partial because lint/compiler rules do not aggressively block dead code or stale effects.

## 3. `console.log` in production code

### Confirmed findings

- [`src/lib/email-templates.ts`](/home/zurc/Projects/car-loan-pro/src/lib/email-templates.ts#L318) contains four `console.log` calls in the dev-mode email fallback path.

### Notes

- I did not find `console.log` elsewhere in `src/`.
- Root-level scripts such as `setup-db.mjs` and `run-schema.js` also log extensively, but those are operational scripts rather than app runtime code.

## 4. Duplicate code

### API route duplication

- Dealer admin and general routes duplicate the same read/update flow with slightly different schema and response shapes:
  - [`src/app/api/dealers/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/dealers/route.ts#L14)
  - [`src/app/api/admin/dealers/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/admin/dealers/route.ts#L6)
- Same problem for lender routes:
  - [`src/app/api/lenders/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/lenders/route.ts)
  - [`src/app/api/admin/lenders/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/admin/lenders/route.ts)
- Email and phone verification routes are near copies with only schema/message differences:
  - [`src/app/api/verify/email/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/verify/email/route.ts#L14)
  - [`src/app/api/verify/phone/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/verify/phone/route.ts#L14)

### UI duplication

- Document upload logic exists twice:
  - Unused generic component in [`src/components/documents/DocumentUpload.tsx`](/home/zurc/Projects/car-loan-pro/src/components/documents/DocumentUpload.tsx#L40)
  - Inline implementation in [`src/app/dashboard/documents/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/documents/page.tsx#L66)
- Dashboard-token pages repeatedly read `token` from query params and issue their own fetches instead of sharing a session/data layer:
  - [`src/app/dashboard/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/page.tsx#L31)
  - [`src/app/dashboard/documents/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/documents/page.tsx#L29)
  - [`src/app/dashboard/offers/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/offers/page.tsx)
  - [`src/app/dashboard/referrals/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/referrals/page.tsx)

### Assessment

- Duplicate code is a top-three maintainability issue in this repo.
- The duplication is not harmless; response shapes and auth requirements already diverge between otherwise similar handlers.

## 5. Bundle size concerns

### Broad `framer-motion` usage

- `framer-motion` is imported in 41 files across app pages and components, including static/legal pages.
- Examples:
  - [`src/app/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/page.tsx#L6)
  - [`src/app/privacy/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/privacy/page.tsx#L4)
  - [`src/app/terms/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/terms/page.tsx#L4)

This is likely the single biggest avoidable client-bundle cost.

### Global layout hydration

- [`src/app/layout.tsx`](/home/zurc/Projects/car-loan-pro/src/app/layout.tsx#L64) wraps the entire app in client-only layers: `ErrorBoundary`, `DevModeProvider`, `Header`, `Providers`, and `CookieConsent`.
- [`src/components/providers/SessionProvider.tsx`](/home/zurc/Projects/car-loan-pro/src/components/providers/SessionProvider.tsx#L7) adds viewport resize listeners and `react-hot-toast` globally.

Result: even simple static pages pay for client hydration and global listeners.

### Dead dependencies inflating install/build footprint

- `jspdf` is only used by dead code in [`src/lib/generate-approval-letter.ts`](/home/zurc/Projects/car-loan-pro/src/lib/generate-approval-letter.ts#L1).
- Unused dependency candidates in [`package.json`](/home/zurc/Projects/car-loan-pro/package.json#L11):
  - `@auth/core`
  - `@dnd-kit/core`
  - `@dnd-kit/sortable`
  - `@tanstack/react-table`
  - `dompurify`
  - `react-plaid-link`

## 6. API route organization

### Positives

- [`src/lib/api-helpers.ts`](/home/zurc/Projects/car-loan-pro/src/lib/api-helpers.ts#L1) provides a usable standard for success/error/validation/auth.
- Several routes do use it consistently.

### Problems

- Route style is inconsistent. Some return `{ success, data }`, others return raw objects, others wrap arrays in `{ dealers }`/`{ lenders }`.
- Example mismatch:
  - [`src/app/api/dealers/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/dealers/route.ts#L20) returns `apiSuccess(dealers)`
  - [`src/app/api/admin/dealers/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/admin/dealers/route.ts#L12) returns `apiSuccess({ dealers })`
- [`src/app/api/applications/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/applications/route.ts#L11) bypasses `requireAuth()` entirely for listing all applications.
- [`src/app/api/notifications/[id]/read/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/notifications/[id]/read/route.ts#L16) has a documented ownership-check TODO; any authenticated user can mark any notification read by ID.
- Verification routes are placeholder implementations that accept any 6-digit code:
  - [`src/app/api/verify/email/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/verify/email/route.ts#L62)
  - [`src/app/api/verify/phone/route.ts`](/home/zurc/Projects/car-loan-pro/src/app/api/verify/phone/route.ts#L62)

### Assessment

- Organization is serviceable but immature.
- The helper layer exists, but the app has not standardized on it.

## 7. State management

### Current pattern

- There is an auth context in [`src/lib/auth-context.tsx`](/home/zurc/Projects/car-loan-pro/src/lib/auth-context.tsx#L17) and a dev-mode context in [`src/contexts/DevModeContext.tsx`](/home/zurc/Projects/car-loan-pro/src/contexts/DevModeContext.tsx#L5).
- Beyond that, most page data is fetched ad hoc per page.

### Findings

- The unused SWR layer in [`src/lib/hooks.ts`](/home/zurc/Projects/car-loan-pro/src/lib/hooks.ts#L26) shows the repo started a shared data-fetching abstraction and then stopped using it.
- Dashboard pages repeatedly derive session state from `?token=` and fetch their own data separately instead of sharing a consumer-session provider.
- This is not severe prop drilling, but it is duplicated page-local state that should be centralized.

### Assessment

- Main issue is missing shared data/session context, not classic prop drilling.

## 8. Performance and unnecessary re-renders

### Confirmed hotspots

- [`src/app/results/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/results/page.tsx#L32) generates 50 animated confetti items using `Math.random()` and `window.innerWidth/innerHeight` during render. That work reruns on each render while the component is mounted.
- [`src/components/providers/SessionProvider.tsx`](/home/zurc/Projects/car-loan-pro/src/components/providers/SessionProvider.tsx#L10) attaches a global resize listener only to move toaster position; this is minor individually but unnecessary globally.
- [`src/app/dashboard/documents/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/documents/page.tsx#L113) filters documents by type inside render for each section instead of pre-grouping once.

### Missing optimization opportunities

- Many heavy client pages rely on large local arrays/derived calculations without shared memoized selectors.
- The repo rarely uses modern React escape hatches (`useDeferredValue`, `startTransition`, `useEffectEvent`), despite multiple interactive screens that would benefit.

### Important caveat

- This repo does use `useMemo`/`useCallback` selectively in a few hotspots, so performance hygiene is not absent; it is just inconsistent.

## 9. Dependencies

### Likely unused packages

Based on repo-wide source search, these are strong removal candidates from [`package.json`](/home/zurc/Projects/car-loan-pro/package.json#L11):

- `@auth/core`
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@tanstack/react-table`
- `dompurify`
- `react-plaid-link`

### Packages tied only to dead or weakly used code

- `jspdf` is tied to dead code.
- `swr` is tied to an unused shared hooks file.

### Outdated critical deps

- [`package.json`](/home/zurc/Projects/car-loan-pro/package.json#L28) is pinned to `next` `14.2.35` and React 18.
- Official release notes show Next.js 16 was released on 2025-10-21 and React 19.2 on 2025-10-01, so the app is behind current major releases.
- That does not automatically mean “upgrade now,” but it does mean:
  - You are missing framework/runtime improvements.
  - You are staying on older API conventions like `middleware.ts` and `next lint`.
  - Upgrade planning should be on the roadmap, especially because Next.js has published multiple 2025 security advisories affecting active major lines.

### Assessment

- Dependency hygiene is below standard.
- A cleanup pass could reduce install size and make future upgrades easier.

## 10. File organization and naming

### Inconsistencies

- `src/lib` contains non-lib React/UI concerns:
  - [`src/lib/auth-context.tsx`](/home/zurc/Projects/car-loan-pro/src/lib/auth-context.tsx#L1)
  - [`src/lib/toast.tsx`](/home/zurc/Projects/car-loan-pro/src/lib/toast.tsx#L1)
  - [`src/lib/onboarding-steps.tsx`](/home/zurc/Projects/car-loan-pro/src/lib/onboarding-steps.tsx#L1)
- Hooks are split inconsistently between:
  - [`src/lib/hooks.ts`](/home/zurc/Projects/car-loan-pro/src/lib/hooks.ts#L1)
  - [`src/hooks/useQRCode.ts`](/home/zurc/Projects/car-loan-pro/src/hooks/useQRCode.ts#L1)
- [`src/components/providers/SessionProvider.tsx`](/home/zurc/Projects/car-loan-pro/src/components/providers/SessionProvider.tsx#L7) exports `Providers`, not `SessionProvider`, which makes the filename misleading.
- API routes are split between generic and admin-prefixed versions with overlapping responsibilities.

### Assessment

- Organization is understandable for a solo prototype, but it is drifting away from predictable conventions.

## Priority recommendations

### P1

- Remove or wire up dead files: `DocumentUpload`, `hooks.ts`, `toast.tsx`, `generate-approval-letter.ts`, `onboarding-steps.tsx`, `auth-types.ts`.
- Fix insecure route behavior:
  - add ownership checks to notification read
  - lock down `GET /api/applications`
  - replace “accept any 6-digit code” verification placeholders
- Standardize API responses and auth/error handling around `api-helpers`.

### P2

- Delete unused packages and re-run install/build.
- Consolidate duplicate dealer/lender/admin routes or move shared CRUD logic into service functions.
- Introduce a shared consumer session/dashboard data provider instead of repeating `?token=` fetch logic per page.

### P3

- Reduce `framer-motion` usage on static content pages.
- Move global client wrappers out of root layout where possible.
- Tighten TypeScript/lint rules:
  - enable `noUnusedLocals`
  - enable `noUnusedParameters`
  - remove file-level lint suppressions

## Bottom line

The project’s main quality problem is not broken TypeScript; it is architectural inconsistency. Dead code, duplicate route logic, and broad client-side hydration are the main maintainability and performance costs. A focused cleanup pass would materially improve the codebase without requiring a full rewrite.
