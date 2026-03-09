# Car Loan Pro — Build Task for Lorenzo

## Context
You're building "Car Loan Pro" — a direct-to-consumer auto lending marketplace. The PRD is at `./PRD.md`. The project is a Next.js 14 app with TypeScript, Tailwind CSS, and Framer Motion already installed. Core types are at `src/lib/types.ts`, constants at `src/lib/constants.ts`.

## Your Task: Build ALL Pages

### Design System
- **Dark theme**: bg-[#09090B], cards bg-zinc-900/50, borders border-white/10
- **Accent**: blue-600 (#2563EB) primary, blue-500 hover
- **Font**: Inter (already configured)
- **Style**: Apple.com-level clean. No emojis. Compact spacing. Mobile-first.
- **Components**: Large touch targets, smooth Framer Motion transitions between steps

### Pages to Build

#### 1. Landing Page (`src/app/page.tsx`)
Marketing homepage for Car Loan Pro. Include:
- Fixed nav with logo "Car Loan Pro" (text only, no icon)
- Hero: "Stop overpaying at the dealer" headline, subtext about lenders competing, CTA "Check Your Rate — Free", "No credit impact" note
- Stats bar: "15,000+ Pre-Approvals", "$2.1B Funded", "4.1% Avg Rate", "< 5 min to Apply"
- How it Works: 3 steps (Apply once, Lenders compete, Get pre-approved)
- Lender tier visualization showing Prime/Near-Prime/Subprime/Specialty
- Rate comparison (Dealer avg 7.9% vs Car Loan Pro avg 4.1%)
- Testimonials (3)
- FAQ section (5 questions about credit impact, how many lenders, fees, credit scores, timeline)
- CTA section
- Footer with links to all pages

#### 2. Consumer Application (`src/app/apply/page.tsx`)
Full 7-step application flow from PRD Section 4. This is the MAIN product.

**Step 1 — Personal Info**: first name, middle (optional), last name, suffix dropdown, SSN (masked ###-##-####), DOB, driver's license number + state, email, phone, preferred language
**Step 2 — Address**: current address (line1, line2, city, state, zip), residence type (own/rent/other), monthly payment, months at address. If < 24 months, show previous address fields.
**Step 3 — Employment & Income**: employment status, employer name/address/phone (conditional), job title, months at employer, gross monthly income, income type, other income (conditional)
**Step 4 — Vehicle Info**: application type (new/used/refi/private party), condition, year, make (from POPULAR_MAKES), model, trim, VIN (optional), mileage (conditional), asking price, private party toggle, dealer name/zip (conditional)
**Step 5 — Deal Structure**: down payment, trade-in toggle + fields (year/make/model/VIN/payoff), desired term (36/48/60/72/84), max monthly payment, GAP interest, warranty interest
**Step 6 — Co-Borrower**: Toggle "Add a co-borrower?" — if yes, repeat Steps 1-3 for co-borrower
**Step 7 — Consent & Submit**: FCRA soft pull consent, TCPA consent, Terms, Privacy, E-Sign. All checkboxes must be checked. Submit button.

UI Requirements:
- Progress bar showing step number and name
- Each step is a clean card with fields
- Back/Continue navigation
- Field validation (show red borders + error messages on invalid)
- After submit: "Analyzing your application..." loading animation (3s), then redirect to /offers
- Store all data in localStorage for the demo
- Use imports from `@/lib/types` and `@/lib/constants`

#### 3. Offer Dashboard (`src/app/offers/page.tsx`)
After application submission, show lender offers.
- Header: "Your Pre-Qualification Results" with FICO score badge (generate random 620-780)
- Credit summary card: FICO, DTI ratio, monthly obligations
- Filter/sort bar: sort by lowest rate, lowest payment, shortest term
- Offer cards (generate 4-6 from SAMPLE_LENDERS): lender name, tier badge, APR, term, monthly payment, approved amount, conditions list, expiration countdown, "Select This Offer" button
- Declined offers shown collapsed with "View Details" expand
- Selected offer triggers confirmation modal with hard pull consent checkbox

#### 4. Application Status (`src/app/status/page.tsx`)
Step tracker showing: Application Received > Credit Reviewed > Offers Available > Offer Selected > Conditions Met > Funded
- Visual pipeline with current step highlighted
- Details card for current status
- Document upload section (mock — file drop zone)
- "Download Approval Letter" button (mock)

#### 5. Lender Portal (`src/app/lender/page.tsx`)
Login: lender@demo.com / demo123
- Dashboard with incoming application queue
- Each application card shows: borrower initials, FICO range, loan amount, vehicle, LTV, DTI
- Accept/Decline/Counter buttons
- Underwriting rules config panel (min FICO, max LTV, max DTI sliders)
- Funded loans tab with revenue

#### 6. Dealer Portal (`src/app/dealer/page.tsx`)
Login: dealer@demo.com / demo123
- Pre-approved buyer inbox
- Each buyer card: approval amount, rate range, vehicle desired, time since approval
- "Invite to Visit" button
- Deal finalization form (VIN, final price, fees)

#### 7. Admin Panel (`src/app/admin/page.tsx`)
Login: admin@clp / admin2026
- Overview: total apps, funded loans, revenue, conversion rates
- Applications table with all data
- Lender management (add/edit lenders, toggle active)
- Compliance log (mock audit trail entries)
- Revenue dashboard: per-lender, per-month

### Shared Store (`src/lib/store.ts`)
Create a localStorage-based store with:
- `saveApplication(data)` — saves full application
- `getApplication()` — retrieves saved application
- `getOffers()` — generates mock offers based on application data
- `getLenders()` — returns SAMPLE_LENDERS
- Sample data pre-loaded (3-4 applications in different stages)

### IMPORTANT
- ALL imports from `@/lib/types` and `@/lib/constants`
- ALL pages must be `"use client"` (localStorage)
- Use Framer Motion for page transitions and step animations
- Every page must compile — run `npm run build` at the end
- Mobile responsive — works on 375px+
- NO emojis in UI
