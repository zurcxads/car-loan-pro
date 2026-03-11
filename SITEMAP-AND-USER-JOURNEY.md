# Auto Loan Pro - Sitemap & User Journey Design

**Based on competitor research:** LendingTree, myAutoloan, Capital One Auto Navigator  
**Created:** March 11, 2026

---

## THE CORE PROBLEM YOU IDENTIFIED

**Current issue:**
- `/offers` and `/status` are **public** - anyone can access them
- No session tracking - if someone closes browser, they lose their application
- No proper user journey from application → offers → acceptance

**✅ You're right - these should be private/session-based.**

---

## RECOMMENDED SITEMAP (Lean but Complete)

### PUBLIC PAGES (No Auth Required)
```
/                       → Homepage (marketing)
/apply                  → Application form (START of journey)
/how-it-works          → Educational page
/faq                   → FAQ
/about                 → About company
/contact               → Contact form
/privacy               → Privacy policy
/terms                 → Terms of service
/login                 → Portal login (lenders/dealers/admin only)
```

### PRIVATE PAGES (Require Session/Auth)
```
/dashboard             → Consumer dashboard (after applying)
  ├── /dashboard/offers       → View loan offers (session-based)
  ├── /dashboard/status       → Application status
  └── /dashboard/documents    → Upload required docs

/lender                → Lender portal (role: lender)
/dealer                → Dealer portal (role: dealer)
/admin                 → Admin portal (role: admin)
```

---

## THE USER JOURNEY (How It Should Flow)

### STEP 1: Apply (Public, No Login)
**URL:** `/apply`

**What happens:**
1. User fills out application form (6 steps)
2. **CREDIT PULL HAPPENS HERE** ← This is where Plaid integrates
3. Form submits → creates application in database
4. System generates `application_id` (e.g., APP-042)
5. Creates temporary session token
6. Redirects to → `/dashboard?token={session_token}`

**Why no login required?**
- Reduces friction
- Competitor behavior (LendingTree doesn't require account for first apply)
- We track via session token + email

---

### STEP 2: View Dashboard (Session-Based Auth)
**URL:** `/dashboard?token=xyz123` or `/dashboard` (if returning via email link)

**What it shows:**
- Application status (Pending, Under Review, Offers Ready)
- Quick stats (credit score, requested amount, monthly income)
- Next steps

**Session security:**
- Token expires in 7 days
- Tied to `application_id` + email
- Can be refreshed via "email me a link" button

---

### STEP 3: View Offers (Private)
**URL:** `/dashboard/offers`

**What it shows:**
- List of approved loan offers
- APR, term, monthly payment
- "Select This Offer" button
- Hard pull consent modal (if they select)

**How it works:**
```
User on /dashboard → sees "3 offers ready" badge
  ↓
Clicks "View Offers"
  ↓
Shows offer cards (sorted by lowest APR)
  ↓
User clicks "Select This Offer"
  ↓
Hard pull consent modal pops up
  ↓
User agrees → sends to lender for final approval
```

---

### STEP 4: Upload Documents (If Required)
**URL:** `/dashboard/documents`

**Triggered if:**
- Lender requests more info (pay stubs, proof of address, etc.)
- Conditional approval needs verification

---

### STEP 5: Final Approval & Funding
**Status updates in:** `/dashboard/status`

Timeline view shows:
- ✅ Application submitted
- ✅ Offers received
- ✅ Offer selected
- ⏳ Documents under review
- ✅ Approved!
- ⏳ Funding in progress

---

## HOW CREDIT PULL FITS IN

### During Application Form (Step 3 of 6)
**Page:** `/apply` (Employment & Income section)

**The flow:**
```jsx
// Step 3: Employment & Income
<div>
  <h3>Employment Information</h3>
  <input name="employer" />
  <input name="monthlyIncome" />
  
  {/* CREDIT PULL WIDGET HERE */}
  <div className="credit-pull-section">
    <h4>Verify Your Credit</h4>
    <p>We'll do a soft pull (no impact to your score)</p>
    <PlaidLinkButton
      onSuccess={(creditData) => {
        // Save credit data to application
        setApplication(app => ({
          ...app,
          credit: creditData
        }));
        // Move to next step
        nextStep();
      }}
    />
  </div>
</div>
```

**User experience:**
1. User enters employment/income info
2. Clicks "Continue"
3. Plaid widget pops up
4. User authenticates with credit bureau
5. Widget closes, credit score appears
6. Form auto-advances to next step

**Behind the scenes:**
- Soft pull gets: credit score, DTI calculation data, tradelines
- No hard inquiry = no score impact
- Data saved to `applications.credit` JSONB column

---

## COMPETITOR ANALYSIS

### LendingTree (What They Do)
**Public:**
- Homepage (marketing)
- Education content (lots of SEO blog posts)
- Rate comparison tables
- Calculators

**Application Flow:**
- Multi-step form (no login required)
- Get offers immediately after submit
- They show offers on a results page (not requiring login)
- To accept offer → requires creating account

**Our approach:**
- Similar but we use session tokens instead of forcing account creation
- More privacy-focused (offers not shown without token)

---

### myAutoloan
**Public:**
- Homepage
- "How it works" page
- FAQ

**Application:**
- Super simple 2-minute form
- Immediately show offers
- To proceed → requires phone verification

---

### Capital One Auto Navigator
**Public:**
- Homepage
- Education center

**Application:**
- Requires Capital One login/account
- Much more friction (loses users)

---

## RECOMMENDED PAGE STRUCTURE (NOT BLOATED)

### Homepage (/)
**Sections:**
1. Hero (above fold)
2. Stats bar (trust signals)
3. How it Works (3 steps)
4. Lender Tiers (credit spectrum)
5. Rate Comparison (dealer vs. us)
6. Testimonials
7. FAQ
8. CTA

**Navigation:**
- Apply
- How It Works
- FAQ
- Login (small, top-right)

---

### /how-it-works
Simple educational page:
1. Apply online
2. Get multiple offers
3. Choose the best one
4. Drive your car

Visual diagram + 4 paragraphs. That's it.

---

### /faq
Accordion-style FAQ (you already have this)

Common questions:
- Does it hurt my credit?
- How many lenders?
- Any fees?
- What credit score needed?
- How long does it take?

---

### /about (Optional - can add later)
**Skip for v1.** Add later if needed for trust/SEO.

Could include:
- Company story
- Team
- Mission
- Press mentions

---

### /contact (Optional)
**Skip for v1.** Just put contact info in footer.

If you add it:
- Email
- Phone (if you have support)
- Contact form → goes to your email

---

## TECHNICAL IMPLEMENTATION

### Session Tokens (Instead of Full Auth)
```sql
-- Add to applications table
ALTER TABLE applications ADD COLUMN session_token TEXT UNIQUE;
ALTER TABLE applications ADD COLUMN session_expires_at TIMESTAMPTZ;

-- When user submits application
UPDATE applications 
SET 
  session_token = gen_random_uuid()::text,
  session_expires_at = NOW() + INTERVAL '7 days'
WHERE id = 'APP-042';
```

**API route for dashboard:**
```typescript
// app/api/dashboard/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verify token
  const app = await db.query(
    'SELECT * FROM applications WHERE session_token = $1 AND session_expires_at > NOW()',
    [token]
  );
  
  if (!app.rows[0]) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  
  return Response.json({ application: app.rows[0] });
}
```

---

## FINAL SITEMAP (COMPLETE BUT LEAN)

```
AUTO LOAN PRO SITEMAP
├── Public (No Auth)
│   ├── /                    Homepage
│   ├── /apply               Application form (with Plaid credit pull)
│   ├── /how-it-works       Educational
│   ├── /faq                FAQ
│   ├── /privacy            Privacy policy
│   ├── /terms              Terms of service
│   └── /login              Portal login (B2B partners only)
│
├── Consumer Dashboard (Session Token Auth)
│   ├── /dashboard          Main dashboard
│   ├── /dashboard/offers   View loan offers ← PRIVATE NOW
│   └── /dashboard/status   Application status ← PRIVATE NOW
│
└── Partner Portals (Role-Based Auth)
    ├── /lender             Lender portal
    ├── /dealer             Dealer portal
    └── /admin              Admin portal
```

**Total pages:** 13 (lean, focused, not bloated)

---

## EMAIL NOTIFICATIONS (Critical for UX)

Since we're using session tokens instead of accounts, we need email notifications:

**When to send:**
1. **Application submitted**
   - Subject: "Your auto loan application is being reviewed"
   - Body: "Check your status: [dashboard link with token]"

2. **Offers ready**
   - Subject: "3 lenders want to work with you!"
   - Body: "View offers: [dashboard/offers link]"

3. **Documents requested**
   - Subject: "Action required: Upload documents"
   - Body: "Upload here: [dashboard/documents link]"

4. **Final approval**
   - Subject: "Congratulations! Your loan is approved"
   - Body: "Next steps: [dashboard link]"

---

## NEXT STEPS (In Order)

### Phase 1: Fix Current Structure ✅ (In Progress)
1. ✅ Remove portal links from public nav
2. ⏳ Move `/offers` and `/status` to `/dashboard/*`
3. ⏳ Add session token system

### Phase 2: Credit Pull Integration
1. Sign up for Plaid
2. Integrate Plaid Link in `/apply` (Step 3)
3. Store credit data in DB

### Phase 3: Dashboard Build
1. Create `/dashboard` page (session-protected)
2. Move offers to `/dashboard/offers`
3. Move status to `/dashboard/status`
4. Add email notification system

### Phase 4: Polish
1. Add /how-it-works page
2. Improve /faq
3. Add /privacy and /terms
4. SEO optimization

---

## QUESTIONS FOR YOU

1. **Dashboard approach:** Session tokens (no account needed) vs. full accounts?
   - I recommend: **Session tokens for v1** (less friction)
   - Can add accounts later if needed

2. **Email provider:** Need to send notifications. Options:
   - Resend (easy, cheap)
   - SendGrid (more features)
   - Postmark (transactional focused)

3. **Credit pull timing:** During application OR after submission?
   - I recommend: **During application** (validates credit before wasting lender time)

4. **Returning users:** How do they access their dashboard?
   - I recommend: "Email me a link" button that sends fresh token

Let me know your thoughts and I'll start building!
