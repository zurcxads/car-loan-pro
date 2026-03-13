# Auto Loan Pro — Master Roadmap & Blockers

> Last updated: March 13, 2026, 8:28 PM CST
> Status: MVP + Phase 2 complete, Phase 3 building now

---

## 🔒 BLOCKERS (Need Jose / External Action)

| # | Blocker | Who | Status | Notes |
|---|---------|-----|--------|-------|
| B1 | **Plaid API keys** | Jose | ⏳ Signed up, keys coming tomorrow | Need Client ID + Sandbox Secret → add to Vercel env vars |
| B2 | **Resend API key** | Jose/Claudio | ⏳ Not started | Sign up at resend.com, verify autoloanpro.co domain, get API key |
| B3 | **Vercel CLI re-auth** | Jose | ✅ Token provided | Token saved, can deploy directly now |
| B4 | **Supabase Storage bucket** | Claudio | ⏳ Need to create | Create 'documents' bucket for consumer file uploads |
| B5 | **Domain email (notifications@autoloanpro.co)** | Jose | ⏳ Not set up | Need email sending domain for transactional emails |
| B6 | **Apple Developer Account** | Jose | 🔮 Future | Required for iOS app (React Native) |
| B7 | **Google Play Console** | Jose | 🔮 Future | Required for Android app |
| B8 | **NMLS Licensing** | Jose/James | 🔮 Future | Required before handling real loans — state-by-state licensing |
| B9 | **Lender partnerships** | James | 🔮 In research | Manolo has 19 private lenders + 24 credit unions researched |

---

## ✅ COMPLETED

### Phase 1 — MVP (March 13, 1:30 AM)
- [x] Homepage redesign (tool-as-hero, mini apply form in hero)
- [x] Supabase backend (schema, tables, seed data, 8 lenders)
- [x] Lender matching engine (FICO/LTV/DTI/state/vehicle filtering)
- [x] Working 7-step apply flow → Supabase → auto-match
- [x] Consumer dashboard (token-based, view/compare offers)
- [x] Plaid integration (sandbox ready, graceful fallback)
- [x] Lender portal (basic)
- [x] Admin panel (basic)
- [x] All API routes Supabase-backed

### Phase 2 — Full Product (March 13, 2:24 AM)
- [x] Blank check / pre-approval letter (select → download/print)
- [x] Full Supabase Auth (login/register/forgot-password)
- [x] Role-based middleware (lender/dealer/admin protected)
- [x] Notification system (bell icon, unread badges, API)
- [x] Lender portal fully connected (app queue, decisions, pipeline kanban)
- [x] Dealer portal fully connected (buyer inbox, deals)
- [x] Admin panel fully connected (CRUD, stats, compliance)
- [x] API documentation page (Stripe-style)
- [x] Consumer status timeline
- [x] Email templates preview (admin)

### Phase 3 — Building Now
- [ ] VIN decoder (NHTSA API) in dealer portal
- [ ] Document upload center (Supabase Storage)
- [ ] Interactive rate calculator (sliders, amortization)
- [ ] Settings & profile pages (consumer/lender/dealer)
- [ ] Application save/resume (localStorage + Supabase draft)
- [ ] Email integration (Resend)
- [ ] Referral system
- [ ] Analytics dashboard (Recharts, real data)
- [ ] Webhook system for lenders
- [ ] Onboarding flows (lender/dealer welcome wizard)
- [ ] Search & filters on all list views

---

## 🧠 CORE PRODUCT VISION (Updated March 13)

**Auto Loan Pro is a pre-approval platform, not a vehicle purchase platform.**
- Consumer applies based on WHO THEY ARE (income, credit, employment) — vehicle is optional
- Pre-approved with a dollar amount + rate range = "blank check"
- Two monetization paths:
  1. **Lender referral fees** — lenders pay us when loans fund
  2. **Dealer lead fees** — pre-approved consumers are premium leads, sold to dealer network
- Vehicle info is optional (moved to end of form, skippable)
- A pre-approved consumer is the product — worth more than raw leads because financing is done

## 📋 UPCOMING (Queued)

- [ ] **Contact field verification** — phone (SMS OTP), email (verification link), SSN format validation, no fake data
- [ ] **Dealer network funnel** — after pre-approval, route consumers to preferred dealers in their area
- [ ] **Lead distribution system** — package pre-approved consumers as leads, sell to dealer network

---

## 🔮 FUTURE PHASES

### Phase 4 — Production Readiness
- [ ] Plaid real credit pull (needs keys — B1)
- [ ] Real email sending (needs Resend — B2)
- [ ] Supabase Storage for document uploads (needs bucket — B4)
- [ ] Rate limiting on API routes
- [ ] Input sanitization / XSS protection audit
- [ ] HTTPS-only, CSP headers
- [ ] Error monitoring (Sentry)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] SEO audit + meta tags for all pages
- [ ] Accessibility (WCAG 2.1 AA)

### Phase 5 — Growth
- [ ] SEO content pages (how auto loans work, credit score guides, state-specific)
- [ ] Landing page A/B variants
- [ ] Google Ads / Meta Ads tracking pixels
- [ ] UTM parameter tracking
- [ ] Retargeting audiences
- [ ] Blog with auto lending content
- [ ] Social proof widgets (live activity feed, review count)

### Phase 6 — Scale
- [ ] Real lender API integrations (RouteOne, DealerTrack connectors)
- [ ] Lender SDK (JavaScript, Python)
- [ ] Webhook delivery with retry logic + delivery logs
- [ ] Multi-tenant lender portals
- [ ] White-label option for lenders
- [ ] React Native mobile app (iOS + Android)
- [ ] Push notifications
- [ ] SMS notifications (Twilio)

### Phase 7 — Revenue
- [ ] Lender subscription tiers (Starter/Pro/Enterprise)
- [ ] Dealer subscription tiers
- [ ] Referral fee tracking + invoicing
- [ ] Stripe billing integration
- [ ] Revenue dashboards
- [ ] Lender bidding system (compete on rates in real-time)

### Phase 8 — Compliance & Legal
- [ ] NMLS state licensing (B8)
- [ ] FCRA compliance automation
- [ ] ECOA adverse action notice generation
- [ ] TILA disclosure automation
- [ ] TCPA consent management
- [ ] SOC 2 audit prep
- [ ] Privacy policy + terms of service (lawyer review)
- [ ] Data encryption at rest + in transit audit

---

## 📊 TECH STACK

| Layer | Tech | Status |
|-------|------|--------|
| Frontend | Next.js 14, React, Tailwind, shadcn-inspired | ✅ |
| Backend | Next.js API routes, TypeScript | ✅ |
| Database | Supabase (PostgreSQL) | ✅ |
| Auth | Supabase Auth | ✅ |
| File Storage | Supabase Storage | ⏳ Phase 3 |
| Credit Pull | Plaid (sandbox) | ⏳ Waiting keys |
| Email | Resend | ⏳ Phase 3 |
| Charts | Recharts | ✅ |
| Deployment | Vercel | ✅ |
| Domain | autoloanpro.co | ✅ |
| Repo | github.com/zurcxads/car-loan-pro | ✅ |

---

## 🔑 CREDENTIALS & ACCESS

| Service | Account | Status |
|---------|---------|--------|
| Vercel | zemat | ✅ Token saved |
| Supabase | pgvpqaqvrnmcxpeyknrt (ezcarloans) | ✅ |
| GitHub | zurcxads/car-loan-pro | ✅ |
| Plaid | Jose's account | ⏳ Keys pending |
| GoDaddy | autoloanpro.co | ✅ Connected to Vercel |

### Demo Logins (Supabase Auth)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@autoloanpro.co | AutoLoanPro2026! |
| Lender | demo@ally.com | AutoLoanPro2026! |
| Dealer | demo@dealer.com | AutoLoanPro2026! |

---

## 📈 KEY METRICS TO TRACK (Once Live)

- Applications started vs completed (drop-off rate)
- Offers per application (avg)
- Offer selection rate
- Pre-approval letter downloads
- Time from apply to first offer
- Lender response time
- Funded deal conversion rate
- Referral program effectiveness
- CAC by channel

---

*This file is the single source of truth for Auto Loan Pro's roadmap. Update it every session.*
