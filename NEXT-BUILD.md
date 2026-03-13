# Next Build — Stipulation Engine + Admin Controls + Doc Workflow

## Launch this IMMEDIATELY after current build finishes

### 1. STIPULATION ENGINE (src/lib/stipulation-engine.ts)
Auto-generate required documents/actions based on application profile:

Rules (configurable from admin):
- FICO 720+ & employment 24+ months → NO stips (auto-approve if income verified via Plaid)
- FICO 660-719 → Require: paystubs (2 recent) OR bank statements (2 months)
- FICO 580-659 → Require: bank statements (3 months) + proof of residence
- FICO below 580 → Require: bank statements (3 months) + proof of residence + co-signer encouraged
- Self-employed → Require: bank statements (3 months) + tax returns (1 year) OR 1099s
- Employment < 6 months → Require: offer letter or employment verification
- Income > $8k/mo claimed → Require: paystubs OR bank statements to verify
- Claimed income doesn't match credit report → flag for manual review
- Any application with red flags → auto-route to manual review queue

Each stip has: type, description, required (bool), status (pending/uploaded/verified/rejected), notes

### 2. DOCUMENT WORKFLOW (Full Pipeline)
- Consumer sees their required stips on dashboard: "To complete your approval, we need:"
- Upload interface per stip (drag & drop, camera capture on mobile)
- Accepted formats: PDF, JPG, PNG, HEIC — max 10MB per file
- Store in Supabase Storage bucket 'documents'
- Each upload linked to: application_id, stip_type, uploaded_at, status
- Status flow: pending_upload → uploaded → under_review → verified → rejected
- If rejected: show reason, allow re-upload
- Admin can view all uploaded docs inline (image preview, PDF viewer)

### 3. REVIEW QUEUE (Admin Portal)
New /admin/review page:
- Queue of applications needing manual review
- Priority sorting: highest risk first, oldest first
- Each application shows: borrower summary, credit tier, stips status, uploaded docs
- Inline document viewer (zoom, rotate for IDs)
- Action buttons: Approve, Request More Info, Adjust Amount, Decline
- "Request More Info" opens a form to type specific questions → sends to consumer
- Decision audit log (who reviewed, when, what action, notes)

### 4. FOLLOW-UP QUESTIONS SYSTEM
- Admin can send questions to consumer from review queue
- Questions appear on consumer dashboard as a banner/notification
- Consumer responds via text fields on their dashboard
- Responses visible in admin review queue
- Create messages/conversation thread per application (like a mini chat)

### 5. CONDITIONAL vs CLEAN APPROVAL
Two approval states:
- **Conditional**: pre-approved but stips outstanding. Letter says "Conditional Pre-Approval — subject to document verification"
- **Clean**: all stips verified. Letter says "Pre-Approved" with no conditions. This is the real blank check.
- Dashboard clearly shows which state they're in with progress bar
- Lender portal shows stip status per application

### 6. ADMIN CONTROLS PANEL (/admin/settings)
Master settings page where admin can configure:

**Stipulation Rules:**
- Edit FICO thresholds for each stip tier
- Toggle stips on/off per rule
- Add custom stip rules
- Set which documents are required vs optional per tier

**Application Settings:**
- Min/max loan amounts
- Supported states (toggle states on/off)
- Min FICO to apply
- Max DTI ratio
- Self-employment rules

**Lender Settings:**
- Global lender match settings
- Default referral fee
- Auto-match toggle (instant vs manual review)

**Platform Settings:**
- Maintenance mode toggle
- Registration open/closed
- Default email templates
- Notification preferences
- Rate display settings (show/hide APR ranges on homepage)

**All settings stored in Supabase** (platform_settings table, key-value JSON)
- Changes take effect immediately
- Audit log of setting changes (who, when, what changed)

### 7. ADMIN DASHBOARD UPGRADES
- Add "Needs Review" count badge on admin nav
- Add stip completion rate metric
- Add avg time from apply to clean approval
- Add document upload stats (pending, verified, rejected)
- Conversion funnel: applied → stips requested → stips uploaded → verified → clean approval

### DESIGN
- Same design language, blue-600, minimal, no emojis
- Document viewer should be clean and functional
- Admin controls should use toggle switches, dropdowns, number inputs
- Mobile responsive

### TECHNICAL
- Individual commits per feature
- Build must pass after each
- All Supabase
- TypeScript strict
