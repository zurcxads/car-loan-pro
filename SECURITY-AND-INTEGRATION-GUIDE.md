# Auto Loan Pro - Security & Credit Pull Integration Guide

**Created:** March 11, 2026  
**For:** Jose @ La Casa Di Zurc

---

## 1. CURRENT SECURITY STATUS ✅

### What We Just Fixed:
- **Public website is now consumer-only** - removed all portal links from homepage/nav/footer
- **Route protection middleware** - `/lender`, `/dealer`, `/admin` now require authentication
- **Role-based access control** - each portal checks for correct role before allowing access

### How It Works:
```
User tries to access /lender
  ↓
Middleware checks: Do they have a valid session?
  ↓ NO → Redirect to /login
  ↓ YES → Check role
     ↓ role !== "lender" → 403 Forbidden
     ↓ role === "lender" → Allow access
```

---

## 2. SUPABASE USER SETUP (Production-Ready Auth)

### Current Setup (DEMO MODE):
Right now the site uses **NextAuth with hardcoded demo credentials**. This is fine for testing but NOT production.

### Production Setup Checklist:

#### Step 1: Enable Supabase Auth
1. Go to your Supabase project → Authentication → Settings
2. Enable Email provider
3. Turn OFF email confirmation for now (or set up email templates)
4. Copy your Supabase URL and anon key

#### Step 2: Install Supabase Client
```bash
cd /tmp/car-loan-pro
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

#### Step 3: Create `.env.local`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth
NEXTAUTH_URL=https://www.autoloanpro.co
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

#### Step 4: Run the Database Schema
The file `supabase-schema.sql` is ready to go. Run it in Supabase SQL Editor.

It creates:
- `users` table (email, password_hash, name, role, entity_id)
- `applications` table
- `offers` table
- `lenders` table
- `dealers` table

#### Step 5: Create Your First Users

**Via Supabase SQL Editor:**
```sql
-- Create an admin user
INSERT INTO users (email, password_hash, name, role) 
VALUES (
  'jose@autoloanpro.co',
  crypt('your-secure-password', gen_salt('bf')),  -- bcrypt hash
  'Jose',
  'admin'
);

-- Create a lender user
INSERT INTO users (email, password_hash, name, role, entity_id) 
VALUES (
  'lender@example.com',
  crypt('demo123', gen_salt('bf')),
  'First Lender',
  'lender',
  'LND-001'
);

-- Create a dealer user
INSERT INTO users (email, password_hash, name, role, entity_id) 
VALUES (
  'dealer@example.com',
  crypt('demo123', gen_salt('bf')),
  'First Dealer',
  'dealer',
  'DLR-001'
);
```

**Or via the Supabase Dashboard:**
1. Go to Authentication → Users
2. Click "Add user"
3. Add email + password
4. Then manually update the `users` table to set role

---

## 3. CREDIT PULL INTEGRATION - How It All Works

### The Credit Pull Ecosystem

There are **two types** of credit checks in auto lending:

1. **Soft Pull (Soft Inquiry)** - Does NOT impact credit score
2. **Hard Pull (Hard Inquiry)** - DOES impact credit score

### Your Flow:
```
Consumer applies on Auto Loan Pro
  ↓
Soft Pull (pre-qualification)
  ↓
Send app to lenders
  ↓
Lenders make offers
  ↓
Consumer selects offer
  ↓
Hard Pull (final approval)
  ↓
Loan funded
```

---

## 4. CREDIT BUREAUS & DATA PROVIDERS

### The Big 3 Credit Bureaus:
1. **Equifax**
2. **Experian**
3. **TransUnion**

**You don't work with them directly.** You work with **resellers/aggregators**.

---

## 5. CREDIT PULL PROVIDERS (Who You Actually Use)

### Option 1: **Plaid** (Modern API, Easy Integration)
- **What it does:** Soft pull credit data + income verification
- **Cost:** ~$0.50 - $2.00 per report
- **Pros:** Best API, modern docs, fast
- **Cons:** Soft pull only (no hard pulls yet)
- **Best for:** Pre-qualification flow

**Integration:**
```javascript
import { PlaidLink } from 'react-plaid-link';

// User clicks "Check My Rate"
// → Plaid widget opens
// → User authenticates with bureau
// → You get credit report JSON
```

**Plaid Returns:**
```json
{
  "credit_score": 720,
  "credit_report": {
    "accounts": [...],
    "inquiries": [...],
    "public_records": [...]
  }
}
```

---

### Option 2: **eCredable Lift** (Fintech-Focused)
- **What it does:** Soft + hard pulls, alternative data
- **Cost:** ~$1 - $3 per report
- **Pros:** Supports alternative credit (rent, utilities)
- **Cons:** Smaller company, less proven
- **Best for:** Subprime/thin-file borrowers

---

### Option 3: **Experian Connect** (Direct from Experian)
- **What it does:** Soft + hard pulls, full bureau data
- **Cost:** ~$2 - $5 per report
- **Pros:** Direct from bureau, most comprehensive
- **Cons:** Complex integration, enterprise pricing
- **Best for:** High-volume lenders

**Integration Flow:**
1. Apply for Experian Connect API access
2. They review your business
3. Sign contract (usually requires volume commitments)
4. Get API credentials
5. Integrate via REST API

---

### Option 4: **Equifax Credit Report Services**
- Similar to Experian
- Enterprise-grade
- High volume required

---

### Option 5: **Credit Plus** (Aggregator)
- **What it does:** Resells all 3 bureaus (tri-merge reports)
- **Cost:** ~$5 - $10 per tri-merge
- **Pros:** One API, all 3 bureaus
- **Cons:** More expensive
- **Best for:** Lenders who want all 3 scores

---

## 6. RECOMMENDED SETUP FOR AUTO LOAN PRO

### Phase 1: Soft Pull Only (Pre-Qualification)
**Use: Plaid**

```javascript
// When user submits application
const creditReport = await plaid.getCreditReport(user);

// Calculate DTI, PTI, LTV
const metrics = {
  credit_score: creditReport.credit_score,
  dti: calculateDTI(income, debts),
  pti: calculatePTI(income, proposedPayment),
  ltv: (loanAmount / vehicleValue) * 100
};

// Send to lenders
await sendToLenders(application, metrics);
```

**Cost:** ~$1.50 per application

---

### Phase 2: Hard Pull (Final Approval)
**Use: Experian Connect or eCredable**

```javascript
// When consumer selects an offer
const hardPull = await experian.getHardPull({
  ssn: user.ssn,
  dob: user.dob,
  address: user.address
});

// Send to chosen lender
await lender.submitFinalApplication(hardPull);
```

**Cost:** ~$3 per hard pull

---

## 7. COMPLIANCE & LEGAL REQUIREMENTS

### You MUST have:
1. **FCRA-compliant disclosures** (Fair Credit Reporting Act)
2. **User consent** before pulling credit
3. **Permissible purpose** (extending credit)
4. **Adverse action notices** if declined

### The Consent Flow:
```
User applies
  ↓
Show disclosure: "By clicking Submit, you authorize Auto Loan Pro 
to obtain your credit report for the purpose of pre-qualifying 
you for an auto loan."
  ↓
User clicks "I Agree"
  ↓
Store consent timestamp in DB
  ↓
Proceed with credit pull
```

---

## 8. INTEGRATION CODE EXAMPLE (Plaid)

### Install Plaid SDK
```bash
npm install plaid
```

### Backend API Route
```typescript
// app/api/credit-pull/route.ts
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.production,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
);

export async function POST(req: Request) {
  const { userId } = await req.json();

  // Create link token for user
  const linkToken = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Auto Loan Pro',
    products: ['identity', 'assets'], // Credit coming soon
    country_codes: ['US'],
    language: 'en',
  });

  return Response.json({ link_token: linkToken.data.link_token });
}
```

### Frontend Integration
```typescript
// components/CreditPullButton.tsx
'use client';
import { usePlaidLink } from 'react-plaid-link';

export function CreditPullButton({ onSuccess }) {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken) => {
      // Exchange public token for access token
      fetch('/api/credit-pull/exchange', {
        method: 'POST',
        body: JSON.stringify({ publicToken })
      }).then(() => onSuccess());
    },
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Get Pre-Approved
    </button>
  );
}
```

---

## 9. COST BREAKDOWN

### Estimated Monthly Costs (1000 applications/month)

| Item | Provider | Cost per Unit | Monthly Cost |
|------|----------|---------------|--------------|
| Soft Pulls | Plaid | $1.50 | $1,500 |
| Hard Pulls (20% conversion) | Experian | $3.00 | $600 |
| **Total** | | | **$2,100** |

---

## 10. NEXT STEPS

### Immediate (Today/Tomorrow):
1. ✅ Public site is consumer-only
2. ✅ Portals are protected
3. ⏳ Test middleware protection

### This Week:
1. Sign up for **Plaid** account
2. Get API keys (sandbox first)
3. Build credit pull test flow
4. Set up Supabase production users

### This Month:
1. Apply for **Experian Connect** access
2. Implement full credit pull integration
3. Add FCRA compliance disclosures
4. Test end-to-end flow

---

## 11. QUESTIONS TO ANSWER

Before proceeding, decide:

1. **Soft pull provider?** → I recommend **Plaid** (easiest, cheapest)
2. **Hard pull provider?** → **Experian Connect** or **eCredable**
3. **Volume expectations?** → Affects pricing tiers
4. **Risk tolerance?** → Determines approval criteria

---

## 12. GLOSSARY

- **Soft Pull:** Credit check that doesn't affect score (for pre-qual)
- **Hard Pull:** Credit check that impacts score (for final approval)
- **LTV:** Loan-to-Value (loan amount ÷ vehicle value)
- **DTI:** Debt-to-Income (monthly debts ÷ monthly income)
- **PTI:** Payment-to-Income (proposed payment ÷ monthly income)
- **FCRA:** Fair Credit Reporting Act (federal law governing credit reports)
- **Tri-Merge:** Report combining all 3 bureaus (Equifax, Experian, TransUnion)
- **FICO:** Most common credit scoring model (300-850 scale)

---

## SUMMARY

**What's Done:**
✅ Public website is locked down (consumer-only)
✅ Portal routes protected with authentication middleware
✅ Role-based access control in place

**What's Next:**
1. Set up Supabase users for production
2. Choose credit pull provider (recommend Plaid)
3. Integrate credit API
4. Add compliance disclosures
5. Test full flow

**Recommended Stack:**
- **Soft Pulls:** Plaid (~$1.50/pull)
- **Hard Pulls:** Experian Connect (~$3/pull)
- **Auth:** Supabase (already configured)
- **Compliance:** Custom disclosures + consent flow

---

**Questions? Let me know what you need explained further.**
