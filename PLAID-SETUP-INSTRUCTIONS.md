# Plaid Setup Instructions

## What I've Built (Ready to Go)

✅ Installed Plaid SDK  
✅ Created PlaidCreditPull component  
✅ Created API routes for Plaid  
✅ Prepared integration point in apply flow  

## What YOU Need to Do

### 1. Sign Up for Plaid (5 minutes)

**Go to:** https://dashboard.plaid.com/signup

**Sign up with:**
- Your work email (jose@xads.ai)
- Choose "I'm building a fintech app"
- Select "Auto loans" as use case

### 2. Get Your API Keys

After signup, go to **Team Settings > Keys**

You'll see:
- `client_id` (looks like: `5f8a1b2c3d4e5f6g7h8i9j0k`)
- `sandbox secret` (looks like: `abcdef1234567890abcdef1234567890`)

### 3. Add Keys to Vercel

**Option A: Vercel Dashboard (Easiest)**
1. Go to: https://vercel.com/joses-projects-62efd1f2/car-loan-pro/settings/environment-variables
2. Add these 3 variables:

```
PLAID_CLIENT_ID = your_client_id_here
PLAID_SECRET = your_sandbox_secret_here
PLAID_ENV = sandbox
```

3. Click "Save"
4. Redeploy (I'll do this after you add the keys)

**Option B: Give Me the Keys**
Just paste them here and I'll add them to Vercel via API.

### 4. How It Will Work

**User Journey:**
```
User on /apply → Step 3 (Employment & Income)
  ↓
Sees "Verify Your Credit" box
  ↓
Clicks "Check My Credit"
  ↓
Plaid widget pops up
  ↓
User authenticates with credit bureau (they pick one)
  ↓
Soft pull happens (no score impact)
  ↓
Credit score appears in form
  ↓
User continues to next step
```

**What Gets Saved:**
- Credit score (e.g., 720)
- Identity verification
- Account data (for DTI calculation)

**Cost:**
- Free in Sandbox (unlimited tests)
- Production: ~$1.50 per successful credit pull

### 5. Testing in Sandbox

Plaid provides test credentials:

**Test Login:**
- Username: `user_good`
- Password: `pass_good`
- MFA: `1234`

This will return mock credit data for testing.

### 6. Going to Production

When ready:
1. Request production access in Plaid dashboard
2. They'll review your app (1-2 days)
3. Once approved, swap `PLAID_ENV=sandbox` → `PLAID_ENV=production`
4. Use production secret instead of sandbox secret

---

## Next Steps

**Once you have your Plaid keys:**

1. Add them to Vercel environment variables
2. Ping me here
3. I'll integrate the credit pull into the apply flow
4. Test it together
5. Deploy!

**Questions? Let me know!**
