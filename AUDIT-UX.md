# UX And Design Consistency Audit

Date: 2026-03-14

Scope: static audit of `src/app` and `src/components` for 50 routes and 38 shared/page components.

## Executive Summary

Overall verdict: fail.

The app has a usable blue-centered design language in several consumer pages, but it is not consistent across the product. The biggest issues are:

1. Dark mode support is largely missing. Earlier theme infrastructure has been removed, and most routes/components remain light-only.
2. Typography does not match the stated Inter requirement. The app globally loads IBM Plex Sans instead.
3. Navigation contains dead links in shared footer content.
4. Accessibility coverage is thin: very few ARIA hooks, some interactive controls lack labels, and modal semantics/focus management are missing.
5. Mobile layouts are mostly serviceable, but several cards/modals use fixed 2/3-column layouts that will feel cramped below 375px.

## Scorecard

| Area | Verdict | Notes |
|---|---|---|
| Mobile responsiveness | Partial | Several layouts are safe, but some dense grids will compress too hard below 375px. |
| Dark mode | Fail | Only 2 of 50 `page.tsx` files and 3 of 38 components include explicit `dark:` classes. |
| Typography consistency | Fail | Global font is IBM Plex Sans, not Inter. |
| Color consistency | Partial | Blue-600 is common, but multiple user-facing pages introduce purple/green/amber as prominent accents. |
| Spacing/padding | Partial | Mostly okay, but some compact cards and portal tables are dense. |
| Loading states | Partial | Some good skeletons/spinners exist, but coverage is incomplete and inconsistent. |
| Error states | Partial | Consumer flow has some error handling; several admin/portal async views do not. |
| Empty states | Partial | Present in some key flows, missing in several data-driven admin views. |
| Navigation | Fail | Shared footer links to missing routes. |
| Accessibility | Fail | Labels exist in places, but semantics, dialog support, keyboard support, and focus treatment are inconsistent. |
| No emojis in UI code | Pass with caveat | No emoji glyphs found in app UI code, but there are Unicode symbols like `✓`, `✗`, and `→`. |

## Findings By Area

### 1. Mobile responsiveness

Verdict: Partial.

Findings:

- [`src/app/dashboard/offers/page.tsx#L144`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/offers/page.tsx#L144) forces a 3-column stats row on all widths. At 320-375px, monthly payment, approved amount, and term will compress aggressively.
- [`src/components/offers/OfferSelectionModal.tsx#L72`](/home/zurc/Projects/car-loan-pro/src/components/offers/OfferSelectionModal.tsx#L72) and [`src/components/offers/OfferSelectionModal.tsx#L82`](/home/zurc/Projects/car-loan-pro/src/components/offers/OfferSelectionModal.tsx#L82) use fixed 2-column grids inside a narrow modal. This is likely cramped on small phones.
- [`src/app/dashboard/page.tsx#L244`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/page.tsx#L244) uses a 2-column status timeline on mobile. It does not technically break, but the horizontal progress bar metaphor degrades because the bar still spans the full width behind wrapped steps.
- Portal-heavy pages rely on tables with horizontal scrolling. That prevents overflow, but it is not an especially strong mobile experience.

### 2. Dark mode

Verdict: Fail.

Evidence:

- The app no longer includes theme-provider infrastructure, and the UI is still implemented as a light-only system.
- The static sweep found 48 of 50 pages and 35 of 38 components without any `dark:` classes.
- Example pages with hardcoded light-only surfaces/text:
  - [`src/app/contact/page.tsx#L77`](/home/zurc/Projects/car-loan-pro/src/app/contact/page.tsx#L77)
  - [`src/app/dashboard/offers/page.tsx#L73`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/offers/page.tsx#L73)
  - [`src/app/admin/settings/page.tsx#L85`](/home/zurc/Projects/car-loan-pro/src/app/admin/settings/page.tsx#L85)
- Even some shared components are light-only:
  - [`src/components/offers/OfferSelectionModal.tsx#L47`](/home/zurc/Projects/car-loan-pro/src/components/offers/OfferSelectionModal.tsx#L47)
  - [`src/components/documents/DocumentUpload.tsx#L136`](/home/zurc/Projects/car-loan-pro/src/components/documents/DocumentUpload.tsx#L136)
  - [`src/components/shared/CookieConsent.tsx#L31`](/home/zurc/Projects/car-loan-pro/src/components/shared/CookieConsent.tsx#L31)

Impact:

- System dark mode will flip the `body`, but many pages remain white cards, gray text, and light borders, producing inconsistent and sometimes low-contrast dark-mode rendering.

### 3. Typography consistency

Verdict: Fail.

Evidence:

- The root layout imports `IBM_Plex_Sans`, not Inter: [`src/app/layout.tsx#L2`](/home/zurc/Projects/car-loan-pro/src/app/layout.tsx#L2), [`src/app/layout.tsx#L12`](/home/zurc/Projects/car-loan-pro/src/app/layout.tsx#L12).
- Global CSS applies IBM Plex Sans to `body`: [`src/app/globals.css#L31`](/home/zurc/Projects/car-loan-pro/src/app/globals.css#L31).

Conclusion:

- The UI does not satisfy the “Inter everywhere” requirement. There is no sign of Inter being loaded for the app shell.

### 4. Color consistency

Verdict: Partial.

What is good:

- `blue-600` / `#2563EB` is the dominant primary accent in the shell and many CTAs.

Problems:

- Several user-facing pages use off-brand accent colors as primary visual anchors:
  - [`src/app/about/page.tsx#L260`](/home/zurc/Projects/car-loan-pro/src/app/about/page.tsx#L260) and [`src/app/about/page.tsx#L289`](/home/zurc/Projects/car-loan-pro/src/app/about/page.tsx#L289) promote purple as a major accent.
  - [`src/app/contact/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/contact/page.tsx) includes a purple CTA for dealer contact.
  - [`src/app/referral/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/referral/page.tsx) and [`src/app/privacy-summary/page.tsx`](/home/zurc/Projects/car-loan-pro/src/app/privacy-summary/page.tsx) rely on mixed purple/green/amber blocks.
- Results confetti intentionally uses a multicolor palette rather than brand blue.

Conclusion:

- Secondary semantic colors are fine for status, but the current implementation goes beyond status usage and dilutes the brand system.

### 5. Spacing and padding

Verdict: Partial.

Findings:

- Consumer marketing pages generally have comfortable spacing.
- Some portal views are compact enough to feel dense, especially tables and dashboard cards.
- [`src/app/dashboard/offers/page.tsx#L144`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/offers/page.tsx#L144) is tight for mobile.
- [`src/components/documents/DocumentUpload.tsx#L136`](/home/zurc/Projects/car-loan-pro/src/components/documents/DocumentUpload.tsx#L136) uses a large dropzone that feels balanced on desktop but dominates smaller document pages.

### 6. Loading states

Verdict: Partial.

What exists:

- Route-level loading files exist for `admin`, `apply`, `dashboard`, `lender`, and `results`.
- Good skeleton usage exists in places like [`src/app/dashboard/page.tsx#L83`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/page.tsx#L83).

Gaps:

- [`src/app/admin/settings/page.tsx#L83`](/home/zurc/Projects/car-loan-pro/src/app/admin/settings/page.tsx#L83) only shows “Loading settings...” text, not a skeleton/spinner.
- [`src/app/admin/analytics/page.tsx#L220`](/home/zurc/Projects/car-loan-pro/src/app/admin/analytics/page.tsx#L220) shows a spinner, but fetch failure falls through silently and leaves the page without a dedicated error state.
- Several async submit actions rely on button text changes or toast only, rather than visible inline loading states.

### 7. Error states

Verdict: Partial.

What is good:

- The main consumer application page includes inline validation and field-level errors.
- The dashboard has a session-expired fallback.
- Document upload has inline error feedback: [`src/components/documents/DocumentUpload.tsx#L182`](/home/zurc/Projects/car-loan-pro/src/components/documents/DocumentUpload.tsx#L182).

Gaps:

- [`src/app/admin/analytics/page.tsx#L226`](/home/zurc/Projects/car-loan-pro/src/app/admin/analytics/page.tsx#L226) only logs fetch errors to the console.
- Several async pages use toast-only failure feedback with no persistent inline recovery UI.
- [`src/app/contact/page.tsx#L70`](/home/zurc/Projects/car-loan-pro/src/app/contact/page.tsx#L70) is UI-only and always succeeds after submit. There is no actual async/error path for the contact form.

### 8. Empty states

Verdict: Partial.

What is good:

- [`src/app/dashboard/offers/page.tsx#L97`](/home/zurc/Projects/car-loan-pro/src/app/dashboard/offers/page.tsx#L97) has a useful “Reviewing Your Application” empty state.
- Results and dashboard flows include some no-data handling.

Gaps:

- Several admin/portal reporting views depend on fetched datasets but do not present strong page-level empty-state messaging when the fetch fails or returns null.
- The audit found multiple chart/table views that render minimal “No data” placeholders rather than actionable empty states.

### 9. Navigation and dead links

Verdict: Fail.

Confirmed broken links in shared footer:

- [`src/components/shared/Footer.tsx#L49`](/home/zurc/Projects/car-loan-pro/src/components/shared/Footer.tsx#L49) links to `/careers`, but `src/app/careers/page.tsx` does not exist.
- [`src/components/shared/Footer.tsx#L69`](/home/zurc/Projects/car-loan-pro/src/components/shared/Footer.tsx#L69) links to `/lenders/onboard`, but the actual route is `/lender/onboard`.
- [`src/components/shared/Footer.tsx#L70`](/home/zurc/Projects/car-loan-pro/src/components/shared/Footer.tsx#L70) links to `/dealers/onboard`, but the actual route is `/dealer/onboard`.

Additional concern:

- Footer “Blog” points to `/resources`, which works, but the repo also contains an orphaned `src/app/blog/loading.tsx` with no matching `page.tsx`. That suggests route naming drift.

### 10. Accessibility

Verdict: Fail.

Findings:

- ARIA coverage is sparse. The codebase has very few `aria-*` attributes outside the header/menu and cookie close button.
- [`src/components/offers/OfferSelectionModal.tsx#L42`](/home/zurc/Projects/car-loan-pro/src/components/offers/OfferSelectionModal.tsx#L42) renders a modal without `role="dialog"`, `aria-modal="true"`, focus trapping, or an accessible label on the close button.
- [`src/components/documents/DocumentUpload.tsx#L141`](/home/zurc/Projects/car-loan-pro/src/components/documents/DocumentUpload.tsx#L141) exposes a fully transparent file input without a visible label or helper association.
- [`src/app/contact/page.tsx#L92`](/home/zurc/Projects/car-loan-pro/src/app/contact/page.tsx#L92) has a mobile menu button with no `aria-label`, unlike the shared header which does label the menu button correctly in [`src/components/shared/Header.tsx#L86`](/home/zurc/Projects/car-loan-pro/src/components/shared/Header.tsx#L86).
- Many labels are visually present but not associated through `htmlFor`/`id`, which weakens screen-reader usability.
- The UI uses glyph-only check/close indicators in several places:
  - [`src/app/security/page.tsx#L111`](/home/zurc/Projects/car-loan-pro/src/app/security/page.tsx#L111)
  - [`src/app/privacy-summary/page.tsx#L149`](/home/zurc/Projects/car-loan-pro/src/app/privacy-summary/page.tsx#L149)
  These are not inherently inaccessible, but they should not be the only semantic cue.

## Emoji Check

Pass.

I did not find emoji characters in `src/app` or `src/components`.

Note:

- There are still Unicode symbols in UI copy such as `✓`, `✗`, and `→`:
  - [`src/app/security/page.tsx#L111`](/home/zurc/Projects/car-loan-pro/src/app/security/page.tsx#L111)
  - [`src/app/privacy-summary/page.tsx#L149`](/home/zurc/Projects/car-loan-pro/src/app/privacy-summary/page.tsx#L149)
  - [`src/components/shared/Footer.tsx`](/home/zurc/Projects/car-loan-pro/src/components/shared/Footer.tsx)

## Priority Fix Order

1. Replace IBM Plex with Inter at the root and verify font fallback behavior.
2. Fix shared navigation dead links in the footer.
3. Establish a dark-mode baseline for shared primitives and shell components, then sweep all public and portal pages.
4. Add dialog semantics, focus management, and keyboard support to modals/drawers.
5. Normalize mobile card grids so all dense summary sections collapse to 1 column below `sm`.
6. Standardize loading, empty, and error states for every fetch-driven page.
7. Tighten brand color usage so purple/green/amber are semantic only, not alternate accents.

## Bottom Line

Auto Loan Pro is visually coherent in isolated areas, but not yet systematized. The current app does not meet the stated standards for dark mode, typography consistency, navigation completeness, or accessibility, and it needs a design-system pass rather than scattered one-off fixes.
