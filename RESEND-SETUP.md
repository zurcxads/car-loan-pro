# Resend Email Setup — Auto Loan Pro

## Status: Waiting on Jose

The code is **fully wired up**. Once we have the API key + domain verified, magic link emails will work immediately.

## Steps (5 minutes)

### 1. Create Resend Account
- Go to [resend.com](https://resend.com)
- Sign up (free tier = 3,000 emails/month — more than enough for now)

### 2. Verify Domain (autoloanpro.co)
- In Resend dashboard → Domains → Add Domain → `autoloanpro.co`
- Resend will give you DNS records to add (MX, SPF, DKIM)
- Add these in your domain registrar (GoDaddy/Vercel/wherever DNS lives)
- Wait for verification (usually 5-30 minutes)

### 3. Get API Key
- Resend dashboard → API Keys → Create API Key
- Name it "Auto Loan Pro Production"
- Copy the key (starts with `re_`)

### 4. Add to Vercel Environment
```bash
# Add to Vercel project env vars
vercel env add RESEND_API_KEY production
# Paste the re_xxx key

# Or via Vercel dashboard:
# Settings → Environment Variables → Add RESEND_API_KEY
```

### 5. Redeploy
```bash
cd ~/Projects/car-loan-pro
vercel --prod
```

## What It Enables
- ✅ Magic link login emails (passwordless auth)
- ✅ Application confirmation emails
- ✅ Pre-approval notification emails
- ✅ Document request emails
- ✅ Status update emails

## From Address
Currently configured: `Auto Loan Pro <noreply@autoloanpro.co>`

## Code Location
- Email templates: `src/lib/email-templates.ts`
- Send function: `sendEmail()` in same file
- Magic link send: `src/app/api/auth/magic-link/send/route.ts`
- General send: `src/app/api/email/send/route.ts`

## Free Tier Limits
- 3,000 emails/month
- 100 emails/day
- Sufficient for beta/testing phase
