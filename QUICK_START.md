# Quick Start Guide — Auto Loan Pro MVP

## 🚀 Get Running in 3 Steps

### Step 1: Apply Supabase Schema (2 minutes)

1. Open Supabase: https://supabase.com/dashboard/project/pgvpqaqvrnmcxpeyknrt
2. Go to **SQL Editor**
3. Copy everything from `scripts/setup-database.sql`
4. Paste and click **Run**

You'll see:
- Tables created ✅
- 6 lenders seeded ✅
- Indexes created ✅

### Step 2: Test Locally (3 minutes)

```bash
npm run dev
```

1. Go to http://localhost:3000
2. Fill out the mini form in the hero:
   - Name: "John Smith"
   - Credit Range: "Good (700-749)"
   - Loan Amount: "30000"
3. Click "Check My Rate — Free"
4. Complete the 7-step application form
5. Click "Submit Application"
6. You'll be redirected to dashboard
7. Click "View Offers" → See lender offers!

### Step 3: Deploy (1 minute)

```bash
npm run build  # Verify build passes
git add .
git commit -m "Deploy Auto Loan Pro MVP"
git push
```

Deploy to Vercel as usual.

---

## ✅ What You Get

- **Homepage** with embedded application form (tool-as-hero design)
- **Application flow** that saves to Supabase
- **Lender matching engine** that generates real offers
- **Consumer dashboard** showing offers
- **Lender portal** for managing applications
- **Admin panel** for platform management

---

## 🎯 How It Works

1. Consumer fills out application → Saved to Supabase
2. Lender matching engine runs → Matches with eligible lenders
3. Generates offers based on lender rate tiers → Saved to database
4. Consumer sees offers on dashboard → Can select best one
5. (Future: Pre-approval letter → Go shopping)

---

## 📝 Key Files

- `src/app/page.tsx` — Homepage with mini form
- `src/app/apply/page.tsx` — Full application form
- `src/app/dashboard/page.tsx` — Consumer dashboard
- `src/app/dashboard/offers/page.tsx` — Offers display
- `src/lib/lender-engine.ts` — Lender matching logic
- `scripts/setup-database.sql` — Database schema + seed data

---

## 🐛 Troubleshooting

**No offers showing up?**
- Check Supabase → `lenders` table has 6 records
- Check Supabase → `applications` table has your application
- Check Supabase → `offers` table has records

**Build fails?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Want to add more lenders?**
Edit `scripts/setup-database.sql` and add more INSERT statements, then re-run in Supabase.

---

## 📚 Full Documentation

- **BUILD_SUMMARY.md** — What was built, feature by feature
- **DEPLOYMENT.md** — Detailed deployment guide with troubleshooting

---

**That's it! You're ready to go. 🎉**
