Car Loan Pro
Portal Buildout PRD — Phase 2
Lender Portal  •  Dealer Portal  •  Admin Panel  •  Consumer Offer & Status Pages
For Claude Code / Cursor AI — Ready to Execute
Table of Contents
0. Claude Code — Skills & MCP Setup
Before writing any code, Claude Code should install the following skills and MCP servers. These provide best-practice templates that will significantly improve output quality.
0.1 Essential MCP Servers to Install
Run these commands inside the project directory before starting work:
0.1.1 Filesystem MCP (read/write project files)
npx @anthropic-ai/claude-code mcp add @modelcontextprotocol/server-filesystem
Purpose: Allows Claude Code to read, create, and edit files across the entire project tree without manual copy-paste.
0.1.2 GitHub MCP (repo access)
npx @anthropic-ai/claude-code mcp add @modelcontextprotocol/server-github
Purpose: Lets Claude Code read the existing repo at github.com/zurcxads/car-loan-pro, inspect existing component patterns, and match the current code style before adding new files.
0.1.3 Supabase MCP (database operations)
npx @anthropic-ai/claude-code mcp add @supabase/mcp-server-supabase
Purpose: Allows Claude Code to run migrations, create tables, insert seed data, and query the database directly without switching to the Supabase dashboard.
0.1.4 Browsertools MCP (live page inspection)
npx @anthropic-ai/claude-code mcp add @agentdeskai/browser-tools-mcp
Purpose: Lets Claude Code open the live Vercel deployment (car-loan-pro.vercel.app) and inspect actual rendered components — critical for matching existing styles on the portal pages.
0.2 Skills Claude Code Should Search & Apply
At the start of each major portal build, instruct Claude Code to search for and apply these skill patterns:
Skill to Search For
Search Command
When to Apply
shadcn/ui data tables with sorting/filtering
Search: 'shadcn ui data table tanstack'
Every portal table (applications queue, funded loans, dealer list)
Tab navigation layout pattern
Search: 'shadcn ui tabs authenticated dashboard layout'
Outer shell of all three portals
Slide-in drawer / sheet component
Search: 'shadcn ui sheet drawer detail panel'
Application detail view, deal finalization panel
Form with react-hook-form + zod validation
Search: 'react hook form zod shadcn ui form'
Underwriting rules editor, deal finalization form, lender onboarding
Recharts dashboard charts
Search: 'recharts bar line area chart next.js'
All reporting/analytics tabs
Kanban board React
Search: 'react kanban board drag drop dnd-kit'
Dealer deal pipeline, lender offer pipeline
PDF generation client-side
Search: 'react pdf jspdf approval letter generation'
Approval letter download on status page
File upload drag-and-drop
Search: 'react dropzone shadcn ui file upload'
Document upload center on status page
0.3 Pre-Build Instructions for Claude Code
Give Claude Code these instructions before starting any portal:
Read the existing /app directory structure first to understand the current routing pattern (App Router vs Pages Router)
Read an existing page file (e.g. /app/apply/page.tsx) to match TypeScript patterns, import style, and component conventions
Read /components/ui/ to understand which shadcn components are already installed
Check package.json for installed dependencies before installing duplicates
All new portal pages must use the same Tailwind config and color tokens already in tailwind.config.ts
Use Supabase client already configured in the project — do not create a second Supabase client
All mock/seed data must be defined in a single file: /lib/mock-data.ts
Do not modify the landing page, /apply flow, or navigation — build portals as isolated authenticated routes
⚠ IMPORTANT: All three portals should function fully with seeded mock data (no live DB required for demo). The mock data layer must be swappable with real Supabase queries by changing a single flag: USE_MOCK_DATA = true in /lib/config.ts
1. Current State Assessment
The following is what exists today on car-loan-pro.vercel.app. Claude Code must not break or alter any of these existing pages.
Page / Route
Current State
What Must Be Preserved
/ (Landing)
Fully built — hero, how-it-works, lender tiers, savings comparison, testimonials, FAQ
Do not touch. Landing page is complete.
/apply
7-step form (personal info → address → employment → vehicle → deal structure → co-borrower → consent)
Do not touch. Apply flow is complete.
/offers
Renders but shows empty state ('No offers yet')
Keep route. Replace empty state with offer card UI.
/status
Renders static step tracker. Doc upload UI shell exists but no logic.
Keep route. Wire up real state + doc upload + PDF letter.
/lender
Login screen only. No post-login view.
Keep login screen. Build authenticated dashboard behind it.
/dealer
Login screen only. No post-login view.
Keep login screen. Build authenticated dashboard behind it.
/admin
Login screen only. No post-login view.
Keep login screen. Build authenticated dashboard behind it.
1.1 Auth Pattern
All three portals currently have a login form that sets localStorage state on successful credential match. The pattern to follow is:
On successful login → set isAuthenticated = true in localStorage with role key
Portal page checks for auth on mount — if not authenticated, render login screen
If authenticated, render the full dashboard
Logout clears localStorage and re-renders login screen
For mock auth: lender@demo.com / demo123 → role: lender | dealer@demo.com / demo123 → role: dealer | admin@clp / admin2026 → role: admin
⚠ Do not implement real JWT auth in this phase. The localStorage mock auth pattern already in place is sufficient for demo. Real Supabase auth will be wired in Phase 3.
2. Mock Data Specification (/lib/mock-data.ts)
All portals pull from this single mock data file. Build it first before building any portal UI. Every data object must match the database schema from the Phase 1 PRD.
2.1 Mock Applications (10 records)
ID
Borrower
FICO
Loan Amt
Vehicle
Status
LTV%
DTI%
PTI%
State
APP-001
Marcus Johnson
742
$28,500
2022 Toyota Camry
offers_available
98%
32%
14%
TX
APP-002
Diana Cruz
681
$19,200
2020 Honda Civic
pending_decision
105%
41%
17%
FL
APP-003
Kevin Park
598
$15,800
2018 Ford F-150
conditional
112%
44%
18%
GA
APP-004
Aaliyah Thompson
724
$34,000
2023 Chevrolet Equinox
funded
96%
29%
13%
OH
APP-005
Roberto Vasquez
612
$22,100
2019 Nissan Altima
pending_decision
109%
43%
19%
CA
APP-006
Jennifer Wu
758
$41,500
2023 BMW 3 Series
offers_available
94%
27%
12%
NY
APP-007
Darnell Foster
555
$11,900
2016 Hyundai Elantra
declined
118%
52%
22%
TX
APP-008
Priya Sharma
693
$26,700
2021 Subaru Outback
conditional
103%
38%
16%
WA
APP-009
Miguel Santos
N/A (ITIN)
$17,400
2019 Toyota RAV4
pending_decision
107%
40%
17%
TX
APP-010
Tamika Williams
637
$20,800
2020 Kia Sorento
funded
104%
36%
15%
NC
2.2 Mock Lender Offers (per application)
APP-001 has 3 offers. APP-002 has 2 offers. APP-006 has 4 offers. All others have 0–1 offers. Use this data for the offers page and lender portal queue.
Offer ID
App ID
Lender
APR
Term
Monthly Pmt
Approved Amt
Status
Conditions
OFR-001
APP-001
Ally Financial
4.49%
60 mo
$529/mo
$28,500
approved
Proof of income
OFR-002
APP-001
Capital One Auto
4.89%
60 mo
$536/mo
$28,500
approved
None
OFR-003
APP-001
TD Auto Finance
5.19%
60 mo
$543/mo
$27,000
approved
Full coverage ins.
OFR-004
APP-002
Westlake Financial
7.99%
60 mo
$388/mo
$19,200
approved
Proof of income, insurance
OFR-005
APP-002
Prestige Financial
8.49%
60 mo
$396/mo
$18,500
conditional
2 recent paystubs
OFR-006
APP-006
Chase Auto
3.89%
60 mo
$761/mo
$41,500
approved
None
OFR-007
APP-006
Bank of America
3.99%
60 mo
$763/mo
$41,500
approved
Proof of insurance
OFR-008
APP-006
Capital One Auto
4.29%
60 mo
$769/mo
$40,000
approved
None
OFR-009
APP-006
Ally Financial
4.49%
72 mo
$664/mo
$41,500
approved
None
2.3 Mock Lenders (6 records in lender network)
ID
Name
Tier
Min FICO
Max LTV
Max DTI
Active States
Referral Fee
LND-001
Ally Financial
near_prime
620
120%
48%
All 50
$300
LND-002
Capital One Auto
prime
660
110%
42%
All 50
$250
LND-003
Chase Auto
prime
680
108%
40%
All 50
$275
LND-004
Westlake Financial
subprime
520
130%
52%
All 50
$400
LND-005
Prestige Financial
subprime
500
128%
50%
48 states
$380
LND-006
TD Auto Finance
near_prime
630
118%
46%
All 50
$290
2.4 Mock Dealers (4 records)
ID
Name
City
State
Contact
Buyers Sent MTD
Deals Funded MTD
Plan
DLR-001
AutoMax Houston
Houston
TX
sales@automaxhou.com
14
8
Pro $499/mo
DLR-002
Premier Ford Dallas
Dallas
TX
finance@premierford.com
9
5
Starter $299/mo
DLR-003
Sunshine Nissan
Miami
FL
internet@sunshinenissan.com
7
3
Pro $499/mo
DLR-004
Pacific Toyota
Los Angeles
CA
fleet@pacifictoyota.com
11
6
Enterprise $999/mo
3. /offers Page — Full Rebuild Spec
3.1 Overview
Replace the empty state with a fully populated offer comparison experience. Must work with seeded mock data from /lib/mock-data.ts. Load APP-001's 3 offers by default for demo purposes.
3.2 Page Layout
Header row: 'Your Pre-Qualification Results' (h1) | Sub-text: 'Showing results for 2022 Toyota Camry — $28,500' | Badge: '3 Offers Available' (green)
Sort bar below header: 3 toggle buttons — 'Lowest Rate' | 'Lowest Payment' | 'Shortest Term' — active state highlighted in blue
Main content: vertical stack of offer cards (see 3.3)
Below cards: comparison table (see 3.4)
Bottom sticky CTA bar on mobile: 'Compare All Offers'
3.3 Offer Card Component — Exact Spec
File to create: /components/offers/OfferCard.tsx
Card container: white background, rounded-xl, border border-gray-200, shadow-sm, hover:shadow-md transition
Left accent bar (4px wide, full height): green (#16A34A) for lowest rate offer, blue for others
Top section (flex row): [Lender logo placeholder — colored square with lender initials] | [Lender name bold, tier badge pill (Prime/Near-Prime/Subprime in matching colors)] | [RIGHT SIDE: 'Best Rate' badge in green if lowest APR offer]
Center section (3-column grid): APR (large 32px bold blue), Term (e.g. '60 months'), Monthly Payment (large 28px bold)
Below center: Approved Amount row — 'Approved up to $28,500' in gray
Conditions section: if conditions.length > 0 → show yellow info box with list of conditions. If empty → show green checkmark 'No conditions — ready to fund'
Expiration row: small gray text — 'Offer expires in 29 days' with clock icon
Bottom action row: [See Full Details — ghost button] | [Select This Offer — solid blue button, full width on mobile]
'Select This Offer' onClick → opens HardPullConsentModal (see 3.5)
⚠ The lowest APR offer must always render first regardless of sort order. Apply sort on top of pre-sorted list.
3.4 Comparison Table Component
File to create: /components/offers/ComparisonTable.tsx
Sticky header row with lender names as columns
Row 1: APR — highlight lowest in green bold
Row 2: Monthly Payment — highlight lowest in green bold
Row 3: Total Cost of Loan (monthly × term) — highlight lowest in green bold
Row 4: Term — show in months
Row 5: Approved Amount
Row 6: Conditions — comma-separated or 'None'
Row 7: Expires — date string
3.5 HardPullConsentModal Component
File to create: /components/offers/HardPullConsentModal.tsx
Triggered by clicking 'Select This Offer' on any card
Modal title: 'One More Step — Authorize Credit Check'
Body: 'Selecting this offer will authorize [Lender Name] to perform a hard credit inquiry. This may affect your credit score by 2-5 points. You are not obligated to accept the loan.'
Checkbox: 'I authorize [Lender Name] to obtain my full credit report' — must be checked to proceed
Two buttons: 'Cancel' (ghost) | 'Confirm & Select Offer' (solid blue, disabled until checkbox checked)
On confirm: update selected offer in localStorage → redirect to /status
4. /status Page — Full Enhancement Spec
4.1 Stage Tracker Enhancement
Tracker must read application state from localStorage (set during /apply and /offers flows)
6 stages: Application Received → Credit Reviewed → Offers Available → Offer Selected → Conditions Met → Funded
Active stage: blue filled circle with white checkmark. Completed: green circle. Pending: gray circle
Stage connector lines: green if stage completed, gray if pending
Below each active/completed stage: timestamp of when that stage was reached (read from localStorage)
If no application in localStorage → show empty state with 'Start your application' CTA
4.2 Selected Offer Summary Card
Appears below stage tracker once an offer is selected
Shows: Lender name + logo | APR | Term | Monthly Payment | Approved Amount | Offer expiration countdown
'View All Offers' link to go back to /offers
4.3 Document Upload Center
File to create: /components/status/DocumentUploadCenter.tsx
Title: 'Upload Required Documents'
For each required condition from the selected offer (read from localStorage), render one upload slot
Each upload slot shows: document type label | status (Not Uploaded / Uploaded / Verified) | upload button
Upload button opens native file picker — accept: .pdf,.jpg,.jpeg,.png — max 10MB
On file select: show file preview (thumbnail for images, PDF icon for PDFs) | filename | file size | remove button
Store file as base64 in localStorage under key: doc_[appId]_[docType]
'Submit Documents' button at bottom — activates when all required docs uploaded — updates stage to 'Conditions Met'
⚠ Do NOT upload to S3 in this phase. Base64 in localStorage is sufficient for demo. Swap in S3 upload in Phase 3.
4.4 Approval Letter Download
When offer is selected, generate a real downloadable PDF approval letter.
Use jsPDF library: npm install jspdf
File to create: /lib/generate-approval-letter.ts
Letter content (see spec below)
Approval Letter Content Spec:
Header: 'Car Loan Pro' logo text (blue, 24pt) | 'Pre-Approval Letter' subtitle
Date: today's date top right
Borrower block: 'Prepared for: [First Name Last Name]'
Body paragraph: 'This letter confirms that [First Name Last Name] has been pre-approved for auto financing through Car Loan Pro's lender network. The following terms have been conditionally approved pending final vehicle selection and verification of information provided.'
Terms table: Lending Institution | [Lender Name]
Terms table: Pre-Approved Amount | Up to $[approved_amount]
Terms table: Annual Percentage Rate | [APR]%
Terms table: Loan Term | [term] months
Terms table: Est. Monthly Payment | $[monthly_payment]
Terms table: Valid Through | [expires_at formatted date]
Conditions section: lists all conditions if any
Footer: 'This pre-approval is not a guarantee of final loan terms. Final approval subject to lender underwriting. Car Loan Pro NMLS #000000'
Download as: CarLoanPro_Approval_[LastName]_[Date].pdf
5. /lender Portal — Full Build Spec
5.1 Layout Shell
File to create: /app/lender/dashboard/layout.tsx (or handle within /app/lender/page.tsx using conditional render)
After successful login: render authenticated dashboard layout
Left sidebar (fixed, 240px wide): Car Loan Pro logo | 'Lender Portal' subtitle | Nav links for 5 tabs | Logged-in user info bottom | Logout button
Top bar: Page title (changes per tab) | Notification bell icon with badge | Current date
Main content area: right of sidebar, full height, scrollable
Sidebar nav items: Applications | Decision Builder | Underwriting Rules | Pipeline | Reporting
Active nav item: blue background, white text, left border accent
⚠ Use shadcn Sheet component for mobile — sidebar collapses to hamburger menu on screens < 1024px
5.2 Tab 1: Application Queue
Component file: /components/lender/ApplicationQueue.tsx
5.2.1 KPI Cards Row (top of page)
4 cards in a row: New Today (count) | Pending Review (count) | Approved This Week (count) | Avg Decision Time
Cards: white bg, rounded-lg, shadow-sm, colored icon top-left per card
5.2.2 Filter Bar
Status filter: All | Pending | Approved | Conditional | Declined (pill buttons, multi-select)
FICO range: slider component — min 300, max 850, dual-handle
Loan amount range: two number inputs (From / To)
Date range: date picker (from / to)
Search input: searches by App ID or borrower name
'Clear All Filters' link
5.2.3 Applications Table
Use TanStack Table (react-table) for sortable, paginated data table. Columns:
Column
Data Source
Sortable
Notes
App ID
application.id
No
Monospace font, link to detail drawer
Borrower
borrower_profile.full_name
Yes
First name + last initial for privacy (admin sees full name)
FICO
credit_pull.fico_score
Yes
Color coded: 720+ green, 660-719 yellow, <660 red
Loan Amount
deal_structure.total_amount_financed
Yes
Formatted as currency
Vehicle
vehicle_info.year + make + model
No
Truncate to 25 chars
LTV %
computed
Yes
Color: <110% green, 110-120% yellow, >120% red
DTI %
computed
Yes
Color: <40% green, 40-48% yellow, >48% red
PTI %
computed
Yes
Color: <15% green, 15-20% yellow, >20% red
Submitted
application.submitted_at
Yes
Relative time (e.g. '2 hours ago')
Status
application.status
Yes
Pill badge with color per status
Actions
—
No
Three-dot menu: Review | Approve | Decline | Request Docs
Pagination: 10 rows per page, prev/next buttons, 'Showing X of Y applications'
Row click → opens ApplicationDetailDrawer (see 5.2.4)
Bulk select: checkboxes on each row | Select All | Bulk action: 'Request Documents from Selected'
5.2.4 Application Detail Drawer
Component file: /components/lender/ApplicationDetailDrawer.tsx
Uses shadcn Sheet component — slides in from right, 560px wide, scrollable
Drawer header: App ID | Status badge | Close button (X)
Section 1 — Borrower: Full name, DOB (masked YYYY), SSN last 4, Phone, Email, Current address, Months at address, Residence type, Monthly housing payment
Section 2 — Employment & Income: Employer name, Job title, Employment status, Months at employer, Gross monthly income, Income type, Verification method + verified badge if verified
Section 3 — Vehicle: Year/Make/Model/Trim, VIN (if provided), Mileage, Condition, Asking price, Book value, Dealer name
Section 4 — Deal Structure: Sale price, Down payment, Trade-in details (if any), Doc fee, Tax/fees, Amount financed, Requested term
Section 5 — Computed Underwriting: LTV% (with lender max reference), PTI%, DTI%, Score vs. lender minimum — each shown as pass/fail/warning
Section 6 — Credit Summary: Score, Score tier, Total monthly obligations, Open auto tradelines, Derogatory marks, Repo flag, Bankruptcy flag
Section 7 — Documents: List of uploaded docs with view button (opens in new tab/modal)
Drawer footer (sticky): [Decline — red outline] [Request Docs — gray] [Counter Offer — outline] [Approve — solid green]
Each action button opens the DecisionModal (see 5.3)
5.3 Tab 2: Decision Builder (Modal)
Component file: /components/lender/DecisionModal.tsx
Triggered from drawer footer buttons and table action menu. Modal, centered, 520px wide.
5.3.1 Approve Flow
Modal title: 'Build Offer — APP-001'
Field: APR (%) — number input, 2 decimal places, required
Field: Approved Amount ($) — pre-filled with requested amount, editable
Field: Term — select (36 / 48 / 60 / 72 / 84 months)
Auto-compute and display: Est. Monthly Payment (updates live as fields change)
Field: Conditions — multi-select checkboxes (Proof of Income / Proof of Insurance / 2 Recent Paystubs / Clear Title / Proof of Residence / Other) + free text 'Add custom condition'
Field: Offer Valid Until — date picker, default 30 days from today
Submit button: 'Send Offer to Borrower' — updates offer status in mock data + shows success toast
5.3.2 Counter Offer Flow
Same form as Approve but with pre-filled fields showing the original requested terms
Label at top: 'Counter — Original request was $[amount] at [term] months'
5.3.3 Decline Flow
Modal title: 'Decline Application — APP-001'
Field: Decline Reason — required select: Score below minimum | LTV exceeds maximum | Insufficient income | DTI too high | Employment too short | Policy exclusion | Vehicle too old | Vehicle mileage too high | Other
Field: Internal Notes — textarea, optional, not shown to borrower
Auto-generate adverse action notice checkbox: 'Generate ECOA Adverse Action Notice and queue for delivery' — checked by default
Submit button: 'Confirm Decline' — red — updates status + triggers adverse action notice generation
5.3.4 Request Documents Flow
Checkbox list of document types: Paystub (last 2) | Bank Statement (last 2 months) | Tax Return (most recent) | Driver License | Proof of Insurance | Proof of Residence | Other
Message to borrower — pre-filled editable textarea
Submit: sends in-app notification + email to borrower listing requested docs
5.4 Tab 3: Underwriting Rules
Component file: /components/lender/UnderwritingRules.tsx
Page title: 'Your Underwriting Parameters' | sub: 'Changes take effect on the next routing cycle'
Form section — Score & Ratios: Min FICO Score (slider 300–850), Max LTV% (slider 100–140), Max DTI% (slider 30–60), Max PTI% (slider 10–30)
Form section — Loan Amounts: Min Loan Amount ($), Max Loan Amount ($)
Form section — Vehicle Rules: Max Vehicle Age (years old), Max Mileage (miles), Accept Certified Pre-Owned (toggle), Accept Private Party transactions (toggle), Accept ITIN borrowers (toggle)
Form section — Geographic: States Active — multi-select state checklist with 'Select All' / 'Clear All' shortcuts
Form section — Rate Tiers table: Add rows for FICO ranges and corresponding rate ranges your lender offers (e.g. 720+ → 3.5–4.5%, 660–719 → 5–6.5%)
'Save Changes' button (blue, full width) | 'Reset to Defaults' link
Below form: Change History table — columns: Changed By | Date | Field Changed | Old Value | New Value
⚠ In mock mode, save updates localStorage. Wire to Supabase lenders table in Phase 3.
5.5 Tab 4: Pipeline
Component file: /components/lender/Pipeline.tsx
View toggle: 'Kanban' | 'Table' — default Kanban
Kanban View
5 columns: Pending Review | Approved/Offered | Conditions Pending | Funded | Declined
Each card shows: App ID | Borrower first name | Loan amount | FICO score | Days in stage
Drag-and-drop between columns updates status in mock data (use @dnd-kit/core)
Column header shows count badge
Table View
All applications in a standard table — same columns as Application Queue but with 'Days in Stage' and 'Referral Fee' columns added
Funded tab specifically shows: App ID | Borrower | Vehicle | Funded Date | Loan Amount | Rate | Term | Referral Fee Owed to Car Loan Pro
Export CSV button on funded view
5.6 Tab 5: Reporting
Component file: /components/lender/Reporting.tsx
Date range selector at top: This Week | This Month | Last Month | Custom Range
KPI row: Apps Received | Approval Rate % | Avg APR Offered | Total Funded Volume ($) | Total Referral Fees ($)
Chart 1 (BarChart via Recharts): Applications by Week — grouped bars for Received / Approved / Funded
Chart 2 (LineChart via Recharts): Approval Rate % over time (weekly data points)
Chart 3 (PieChart via Recharts): Applications by Credit Tier (Prime / Near-Prime / Subprime)
Bottom table: Top Vehicles Funded — Make/Model | Count | Avg Loan Amount | Avg APR
6. /dealer Portal — Full Build Spec
6.1 Layout Shell
Identical sidebar layout pattern as lender portal — reuse layout component
Sidebar nav items: Pre-Approved Buyers | Deal Finalization | Active Deals | Performance | Settings
Top bar: Dealer name ('AutoMax Houston') | Notification bell | Logout
Sidebar shows subscription plan badge: 'Pro Plan'
6.2 Tab 1: Pre-Approved Buyer Inbox
Component file: /components/dealer/BuyerInbox.tsx
6.2.1 Page Header
Title: 'Pre-Approved Buyers in Your Market'
Subtitle: 'Houston, TX area | Buyers with active approvals looking for a vehicle'
Filter row: New This Week | All Active | Expiring Soon (< 7 days) | Invited
Sort: Approval Amount (High-Low) | Most Recent | Expiring Soonest
6.2.2 Buyer Card Component
Component file: /components/dealer/BuyerCard.tsx
Card layout: white bg, rounded-xl, border, shadow-sm, hover:shadow-md
Top row: Credit tier badge (Prime/Near-Prime/Subprime in color) | Approval age ('Pre-approved 3 days ago') | Expiry countdown ('Expires in 26 days')
Main section: 'Approved up to' label + '$28,500' (large, bold, blue) | Rate range: '4.49% – 5.19% APR' | Term range: '48–72 months'
Vehicle preference row (if entered): icon + 'Looking for: Used SUV or Sedan, 2018–2022'
Location: ZIP code only — '77001 (Houston area)' — never show full address
Bottom action row: [View Details — ghost] [Invite to Dealership — solid blue]
'Invite to Dealership' onClick → InviteModal — pre-filled message, sends simulated SMS/email
Cards with status 'Invited' show a green 'Invited' banner and disabled invite button
If no buyers: empty state with icon and 'No pre-approved buyers in your market right now. Check back soon.'
6.2.3 Buyer Detail Drawer
Slides in from right on 'View Details' click
Shows: Approval details (lender, amount, rate, term, expiry, conditions) | Vehicle preference | Approval letter preview | Contact status
'Start Deal' button in drawer footer → navigates to Deal Finalization tab pre-loaded with this buyer
Note: DO NOT show borrower PII (SSN, full address, DOB) in dealer portal — dealer never sees sensitive data
6.3 Tab 2: Deal Finalization
Component file: /components/dealer/DealFinalization.tsx
If arriving from buyer card 'Start Deal' button: buyer info pre-loaded
If opened fresh: buyer search input to find by approval ID or buyer first name
Deal Finalization Form
Section 1 — Vehicle Details: VIN input (with NHTSA decoder button — calls https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/[vin]?format=json to auto-fill year/make/model), Odometer, Condition, Stock number (dealer internal)
Section 2 — Final Pricing: Sale price, Doc fee, Title & registration fee, Sales tax (auto-computed from state rate), Dealer add-ons (itemized), Total out-of-door price
Section 3 — Down Payment & Trade: Final cash down, Trade-in details (year/make/model/VIN/ACV/payoff), Trade equity computed
Section 4 — F&I Products: GAP Insurance (toggle + price input), Extended Warranty/VSC (toggle + price input, term select), Tire & Wheel (toggle + price input)
Live Computation Panel (right side, sticky): shows in real-time: Amount Financed | LTV% | PTI% (estimated) | Monthly Payment | Lender Maximum LTV
Compliance check: if LTV exceeds lender's max → show red warning banner 'Deal exceeds lender LTV maximum by X%. Reduce sale price or increase down payment.'
Submit button: 'Submit to [Lender Name] for Funding' — green, disabled if compliance fails
On submit: shows DealSubmittedConfirmation component with deal ID and estimated funding timeline
6.4 Tab 3: Active Deals
Component file: /components/dealer/ActiveDeals.tsx
Sub-tabs: In Progress | Funded | Declined
Table columns for In Progress: Deal ID | Buyer (first name + last initial) | Vehicle | Lender | Amount | Rate | Status | Days Open | Actions
Status pipeline shown per row as mini stepper: Deal Submitted → Lender Review → Approved for Funding → Wire Sent → Funded
Click row → deal detail panel: full timeline of events with timestamps, documents checklist, lender contact info
Funded table adds: Funded Date | Dealer Net (sale price minus payoffs) | Referral info
Export CSV on both views
6.5 Tab 4: Performance Dashboard
Component file: /components/dealer/PerformanceDashboard.tsx
Date toggle: This Month | Last Month | Last 90 Days | YTD
KPI cards row: Buyers Invited | Deals Started | Deals Funded | Avg Days to Fund | Total Funded Volume | Conversion Rate (funded/invited %)
Funnel chart: Buyers Received → Invited → Deal Started → Funded — with % conversion between each stage
Bar chart: Funded deals by week
Donut chart: Funding breakdown by lender (which lenders funded most deals)
Compare to prior period: each KPI card shows delta arrow (up/down) vs prior period
6.6 Tab 5: Settings
Component file: /components/dealer/DealerSettings.tsx
Section — Dealership Info: Name, Address, City/State/ZIP, Phone, Website, Franchise brands (multi-select: Ford/Toyota/Honda/etc.)
Section — Team Members: Table of reps with name, email, role (Sales Manager / F&I Manager / Internet Sales / Admin), status (Active/Inactive), date added. Add/remove/edit reps. Invite new rep by email.
Section — Notifications: Toggle SMS alerts for new pre-approved buyers | Toggle email digest (daily/weekly) | Phone number for SMS alerts
Section — Subscription: Current plan display, billing cycle, next renewal date, upgrade/downgrade buttons, payment method (last 4 digits)
'Save Settings' button at bottom of each section
7. /admin Panel — Full Build Spec
7.1 Layout Shell
Same sidebar layout pattern — reuse layout component with admin-specific nav
Sidebar nav items: Overview | Applications | Lenders | Dealers | Compliance | Revenue | System
Top bar: 'Admin Panel' | Environment badge (Demo / Production) | Admin username | Logout
Sidebar: darker color scheme to distinguish from lender/dealer portals — use slate-900 background
7.2 Tab 1: Platform Overview
Component file: /components/admin/PlatformOverview.tsx
7.2.1 Real-Time KPI Cards (2 rows of 4)
Row 1: Applications Today | Offers Sent Today | Funded Loans MTD | Total Funded Volume (all-time)
Row 2: Revenue MTD | Active Lenders | Active Dealer Partners | Pending Adverse Action Notices
Each card: large number, label, delta vs yesterday/prior month, trend sparkline (small 7-day line chart)
7.2.2 Live Activity Feed
Right side panel (30% width), scrollable, auto-refresh every 30 seconds in production (static in mock)
Each event shows: colored dot (blue=application, green=funded, orange=offer, red=declined) | timestamp | event description
Events to show: 'APP-001: Marcus Johnson submitted application' | 'APP-004: Ally Financial funded $28,500 loan' | 'OFR-006: Chase Auto sent offer to APP-006' | 'APP-007: Declined — Score below minimum'
7.2.3 Alerts Panel
Shows actionable items requiring admin attention
Alert types: Failed credit pull (red) | Lender API timeout (orange) | Adverse action notice deadline in 5 days (yellow) | New lender signup pending approval (blue) | Revenue milestone (green)
Each alert has: icon | message | timestamp | action button ('Resolve' / 'View' / 'Dismiss')
7.3 Tab 2: Application Management
Component file: /components/admin/ApplicationManagement.tsx
Full-text search: searches by App ID, borrower name, email, SSN last 4
Filters: Status (all statuses), State (dropdown), Lender, Credit Tier, Date Range, Amount Range
Table: all columns from lender portal + additional admin columns: User ID | Lenders Submitted | Offers Received | Last Updated | Flags
Admin can see FULL borrower name (no privacy masking like dealer portal)
Row actions (three-dot menu): View Full Application | Force Re-Route to Lenders | Override Status | Flag for Compliance Review | Generate Adverse Action Notice | View Audit Trail
7.3.1 Full Application View (Admin Mode)
Same drawer as lender portal but shows: ALL fields including SSN last 4, full address, full employment details
Adds admin-only sections: Audit Trail (every action on this application with timestamp + user), All Credit Pull Records, All Lender Submissions + Decisions, All Documents with metadata
Admin action buttons at bottom: Override Status | Add Internal Note | Flag | Close Application
7.3.2 Audit Trail Component
Timeline view — newest first
Each entry: timestamp | user/system | action | before value | after value
Events: application created, submitted, credit pull performed, submitted to lender X, offer received from lender X, offer selected, hard pull performed, documents uploaded, status changed, adverse action generated
7.4 Tab 3: Lender Management
Component file: /components/admin/LenderManagement.tsx
Table columns: Lender Name | Tier | Integration Type | Status (Active/Inactive toggle) | Min FICO | Max LTV | Apps Received MTD | Approval Rate | Avg Decision Time | Referral Fee | Last Activity
Add Lender button → full lender onboarding form (all fields from lenders DB schema in Phase 1 PRD, Section 3.3.8)
Edit button on each row → same form pre-filled
Click lender name → Lender Performance Detail page
Lender Performance Detail
Header: lender name | tier badge | integration type | status toggle | last active
KPI cards: Apps Received MTD | Approval Rate % | Avg APR Offered | Avg Decision Time (minutes) | Total Funded Volume | Total Referral Fees Owed
Chart: approval rate trend by month
Chart: funded volume by month
Table: Recent decisions — App ID | Decision | APR | Amount | Date
7.5 Tab 4: Dealer Management
Component file: /components/admin/DealerManagement.tsx
Table: Dealer Name | City | State | Contact Email | Status | Pre-Approvals Sent MTD | Deals Funded MTD | Subscription Plan | MRR | Joined Date | Actions
Add Dealer button → onboarding form: business name, address, contact info, franchise brands, subscription plan selection
Suspend / Reactivate dealer toggle
Click dealer name → Dealer Detail page: team members, all deals, performance metrics, billing history
7.6 Tab 5: Compliance Center
Component file: /components/admin/ComplianceCenter.tsx
7.6.1 Adverse Action Notice Queue
Table: App ID | Borrower Name | Decline Date | Deadline (30 days from decline) | Status (Pending / Sent / Overdue) | Lender | Reason Code | Send Button
Overdue rows highlighted in red
'Send Notice' button generates PDF adverse action letter and marks as sent
Adverse Action Letter template: 'Notice of Adverse Action' | Date | Borrower name/address | 'We regret to inform you that your application for credit has been declined based on information obtained from your credit report' | Specific reason code | Credit bureau contact info | ECOA rights statement
7.6.2 FCRA Audit Log
Table: Log ID | Borrower Name | Pull Type (Soft/Hard) | Bureau | Date/Time | Purpose | Consent on File (Y/N) | Application ID | Requested By
Export to CSV button (for regulatory exams)
Filter by pull type, date range, bureau
7.6.3 ECOA Monitoring
Summary stats: Total applications by race/ethnicity (if HMDA data collected) | Approval rates by demographic | Flag rate
Note: show placeholder charts with explanatory text — 'ECOA disparate impact analysis requires 12 months of data. Full reporting available after launch.'
Manual flag queue: Applications flagged by admin for compliance review — with notes field and resolution status
7.7 Tab 6: Revenue & Billing
Component file: /components/admin/RevenueBilling.tsx
Date filter: This Month | Last Month | Last 90 Days | YTD | All Time
KPI row: Referral Fee Revenue | Dealer Subscription Revenue | Total Revenue | MRR | YTD Revenue | Projected Annual
Chart: Monthly Revenue Breakdown — stacked bar showing referral fees vs dealer subscriptions
Referral Fees table: Lender | Funded Loans Count | Total Volume | Fee Rate | Fees Earned | Payment Status (Paid/Pending/Overdue)
Dealer Subscriptions table: Dealer Name | Plan | Monthly Amount | Billing Date | Status | Payment Method | Last Payment
Revenue detail export: CSV download of all revenue events
7.8 Tab 7: System Settings
Component file: /components/admin/SystemSettings.tsx
Section — Routing Config: Max lenders per submission (number input, default 5) | Submission delay ms | Retry on timeout (toggle + retry count) | Offer expiration default days
Section — Credit Pull Provider: Radio select (700Credit / Experian Connect / Mock/Sandbox) | API endpoint URL | Credentials status
Section — Feature Flags: Table of toggles — each row: Feature Name | Description | Enabled (toggle) | Last Changed. Flags: ITIN_BORROWERS | CO_BORROWER_FLOW | PLAID_INCOME | PRIVATE_PARTY | GAP_PRODUCTS | SPANISH_LOCALE | DEALER_NOTIFICATIONS | EMAIL_OFFERS
Section — Email Templates: List of email types (Offer Available / Status Update / Doc Request / Adverse Action / Welcome). Click any to open template editor with preview.
'Save' button per section with confirmation toast on success
8. File Structure — New Files to Create
All paths are relative to the project root. Do not modify any existing files outside of /app/lender/page.tsx, /app/dealer/page.tsx, /app/admin/page.tsx, /app/offers/page.tsx, and /app/status/page.tsx.
File Path
Purpose
/lib/mock-data.ts
Central mock data store — all applications, offers, lenders, dealers
/lib/config.ts
USE_MOCK_DATA flag + feature flags
/lib/generate-approval-letter.ts
jsPDF approval letter generator function
/lib/format-utils.ts
Currency, date, percentage formatting helpers
/lib/underwriting-engine.ts
LTV, DTI, PTI calculation functions — shared across portals
/components/shared/PortalLayout.tsx
Reusable sidebar + topbar layout for all 3 portals
/components/shared/KPICard.tsx
Reusable KPI metric card component
/components/shared/DataTable.tsx
Reusable TanStack Table wrapper with filtering/sorting/pagination
/components/shared/StatusBadge.tsx
Pill badge component for application/offer/deal status
/components/offers/OfferCard.tsx
Individual lender offer card
/components/offers/ComparisonTable.tsx
Side-by-side offer comparison table
/components/offers/HardPullConsentModal.tsx
Consent dialog before offer selection
/components/status/DocumentUploadCenter.tsx
Document upload slots tied to offer conditions
/components/lender/ApplicationQueue.tsx
Lender Tab 1 — sortable application table
/components/lender/ApplicationDetailDrawer.tsx
Slide-in full application view for lender
/components/lender/DecisionModal.tsx
Approve / Decline / Counter / Request Docs modal
/components/lender/UnderwritingRules.tsx
Lender Tab 3 — parameter configuration form
/components/lender/Pipeline.tsx
Lender Tab 4 — Kanban + table deal pipeline
/components/lender/Reporting.tsx
Lender Tab 5 — charts and KPI reporting
/components/dealer/BuyerInbox.tsx
Dealer Tab 1 — pre-approved buyer card grid
/components/dealer/BuyerCard.tsx
Individual buyer card component
/components/dealer/DealFinalization.tsx
Dealer Tab 2 — deal finalization form
/components/dealer/ActiveDeals.tsx
Dealer Tab 3 — in-progress and funded deal table
/components/dealer/PerformanceDashboard.tsx
Dealer Tab 4 — charts and conversion funnel
/components/dealer/DealerSettings.tsx
Dealer Tab 5 — team and notification settings
/components/admin/PlatformOverview.tsx
Admin Tab 1 — KPI cards, activity feed, alerts
/components/admin/ApplicationManagement.tsx
Admin Tab 2 — master application table with full access
/components/admin/LenderManagement.tsx
Admin Tab 3 — lender table + onboarding + performance
/components/admin/DealerManagement.tsx
Admin Tab 4 — dealer table + management
/components/admin/ComplianceCenter.tsx
Admin Tab 5 — adverse action queue, FCRA log, ECOA monitoring
/components/admin/RevenueBilling.tsx
Admin Tab 6 — referral fees, subscriptions, MRR
/components/admin/SystemSettings.tsx
Admin Tab 7 — routing config, feature flags, templates
9. Dependencies to Install
Package
Install Command
Used For
@tanstack/react-table
npm install @tanstack/react-table
Sortable, filterable, paginated data tables in all portals
recharts
npm install recharts
Bar, line, pie, area charts in reporting tabs
@dnd-kit/core + @dnd-kit/sortable
npm install @dnd-kit/core @dnd-kit/sortable
Drag-and-drop Kanban board in lender pipeline
jspdf
npm install jspdf
Client-side PDF generation for approval letters
react-dropzone
npm install react-dropzone
File drag-and-drop in document upload center
date-fns
npm install date-fns
Date formatting, relative time, countdown calculations
react-hook-form
npm install react-hook-form
Form state management for decision modal + rules config
zod
npm install zod
Schema validation for all forms
@hookform/resolvers
npm install @hookform/resolvers
Connects Zod schemas to react-hook-form
lucide-react
Already installed (confirm in package.json)
Icons throughout all portal UIs
clsx + tailwind-merge
Already installed (confirm)
Conditional class merging utilities
⚠ Check package.json before installing — recharts, react-hook-form, and date-fns may already be installed from Phase 1 build. Do not install duplicates.
10. Recommended Build Order for Claude Code
Execute in this exact order to avoid dependency errors and broken imports:
Step
Task
Files Created/Modified
Estimated Effort
1
Install all dependencies from Section 9
package.json
5 min
2
Create /lib/config.ts with USE_MOCK_DATA flag and feature flags
/lib/config.ts
10 min
3
Create /lib/mock-data.ts with all 10 applications, 9 offers, 6 lenders, 4 dealers from Section 2
/lib/mock-data.ts
20 min
4
Create /lib/underwriting-engine.ts with LTV/DTI/PTI calculation functions
/lib/underwriting-engine.ts
15 min
5
Create /lib/format-utils.ts with currency, date, percent formatters
/lib/format-utils.ts
10 min
6
Create shared components: KPICard, StatusBadge, DataTable wrapper
/components/shared/*
30 min
7
Create PortalLayout.tsx sidebar + topbar reusable shell
/components/shared/PortalLayout.tsx
30 min
8
Rebuild /offers page — OfferCard, ComparisonTable, HardPullConsentModal
/app/offers/page.tsx + components
45 min
9
Enhance /status page — stage tracker + DocumentUploadCenter + approval letter PDF
/app/status/page.tsx + components
45 min
10
Build Lender Portal — ApplicationQueue + ApplicationDetailDrawer (Tab 1 + 2)
/app/lender/page.tsx + components
60 min
11
Build Lender Portal — DecisionModal (Approve/Decline/Counter/Request Docs)
/components/lender/DecisionModal.tsx
45 min
12
Build Lender Portal — UnderwritingRules (Tab 3)
/components/lender/UnderwritingRules.tsx
30 min
13
Build Lender Portal — Pipeline Kanban + Table (Tab 4)
/components/lender/Pipeline.tsx
45 min
14
Build Lender Portal — Reporting charts (Tab 5)
/components/lender/Reporting.tsx
30 min
15
Build Dealer Portal — BuyerInbox + BuyerCard + InviteModal (Tab 1)
/app/dealer/page.tsx + components
45 min
16
Build Dealer Portal — DealFinalization with live LTV calculator (Tab 2)
/components/dealer/DealFinalization.tsx
60 min
17
Build Dealer Portal — ActiveDeals pipeline table (Tab 3)
/components/dealer/ActiveDeals.tsx
30 min
18
Build Dealer Portal — PerformanceDashboard funnel + charts (Tab 4)
/components/dealer/PerformanceDashboard.tsx
30 min
19
Build Dealer Portal — DealerSettings form (Tab 5)
/components/dealer/DealerSettings.tsx
20 min
20
Build Admin Panel — PlatformOverview KPIs + activity feed + alerts (Tab 1)
/app/admin/page.tsx + components
45 min
21
Build Admin Panel — ApplicationManagement master table (Tab 2)
/components/admin/ApplicationManagement.tsx
45 min
22
Build Admin Panel — LenderManagement + onboarding form (Tab 3)
/components/admin/LenderManagement.tsx
30 min
23
Build Admin Panel — DealerManagement (Tab 4)
/components/admin/DealerManagement.tsx
20 min
24
Build Admin Panel — ComplianceCenter adverse action queue + FCRA log (Tab 5)
/components/admin/ComplianceCenter.tsx
45 min
25
Build Admin Panel — RevenueBilling charts + tables (Tab 6)
/components/admin/RevenueBilling.tsx
30 min
26
Build Admin Panel — SystemSettings feature flags + routing config (Tab 7)
/components/admin/SystemSettings.tsx
25 min
27
Final QA pass — verify all routes render, mock data flows correctly, logout works on all portals
All files
30 min
⚠ Total estimated build time: 10–12 hours for a single Claude Code session. Break into 3 sessions: Session 1 = Steps 1–9 (foundation + consumer pages), Session 2 = Steps 10–19 (lender + dealer portals), Session 3 = Steps 20–27 (admin panel + QA).
11. Design System — Exact Color & Style Tokens
All new components must use these exact Tailwind classes to maintain consistency with the existing landing page and apply flow.
11.1 Color Usage
Token
Tailwind Class
Hex
Used For
Primary Blue
bg-blue-600 / text-blue-600
#2563EB
Primary CTAs, active nav items, links
Primary Blue Dark
bg-blue-700
#1D4ED8
Button hover states
Success Green
bg-green-600 / text-green-600
#16A34A
Funded status, lowest rate, conditions met
Warning Yellow
bg-yellow-500 / text-yellow-600
#CA8A04
Conditional status, expiring soon, warnings
Error Red
bg-red-600 / text-red-600
#DC2626
Declined status, compliance alerts, over-threshold
Near-Prime Orange
bg-orange-500 / text-orange-500
#F97316
Near-prime tier badge
Gray Background
bg-gray-50
#F9FAFB
Page backgrounds
Card Background
bg-white
#FFFFFF
All card components
Border Default
border-gray-200
#E5E7EB
All card borders
Text Primary
text-gray-900
#111827
Headings and primary body text
Text Secondary
text-gray-500
#6B7280
Labels, metadata, helper text
Admin Sidebar
bg-slate-900
#0F172A
Admin portal sidebar only
11.2 Component Style Conventions
Cards: className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'
Primary Button: className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors'
Ghost Button: className='border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors'
Danger Button: className='bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors'
Input: className='border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
Table header row: className='bg-gray-50 text-gray-500 text-xs font-medium uppercase tracking-wider'
Status badge base: className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
Sidebar nav active: className='bg-blue-600 text-white' — inactive: className='text-gray-600 hover:bg-gray-100'
KPI card: className='bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-1'
11.3 Typography
Page title (h1): className='text-2xl font-bold text-gray-900'
Section heading (h2): className='text-lg font-semibold text-gray-900'
Card label: className='text-sm font-medium text-gray-500'
Large metric number: className='text-3xl font-bold text-gray-900'
Table cell default: className='text-sm text-gray-900'
Helper text: className='text-xs text-gray-500'
Link: className='text-blue-600 hover:text-blue-700 text-sm font-medium'
12. Ready-to-Use Prompt Template for Claude Code
Copy and paste this prompt to start each build session. Replace [SESSION NUMBER] and [STEPS] with the session you are starting.
─── START COPY ─────────────────────────────────────────────────────────────
You are building new portal pages for Car Loan Pro (car-loan-pro.vercel.app), an auto lending marketplace built in Next.js with TypeScript, Tailwind CSS, and shadcn/ui.
BEFORE WRITING ANY CODE:
Use the GitHub MCP to read the existing /app directory structure
Read /app/apply/page.tsx to understand the current code patterns
Read /components/ui/ to see what shadcn components are already installed
Read package.json to check installed dependencies
PROJECT CONTEXT:
Repo: github.com/zurcxads/car-loan-pro
Live URL: car-loan-pro.vercel.app
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase
All new components go in /components/ — all new pages in /app/
Use mock data from /lib/mock-data.ts — DO NOT make real API calls
Auth: localStorage mock (lender@demo.com/demo123, dealer@demo.com/demo123, admin@clp/admin2026)
THIS SESSION — BUILD STEPS [X] THROUGH [Y] from the PRD:
[Paste the specific step rows from Section 10 Build Order table here]
STYLE RULES:
Match existing page styles exactly — check the landing page for color and spacing conventions
Use Tailwind utility classes only — no custom CSS files
All cards: bg-white rounded-xl border border-gray-200 shadow-sm
Primary action buttons: bg-blue-600 hover:bg-blue-700 text-white
Use lucide-react for all icons
Mobile responsive — all tables must be scrollable on mobile
DO NOT:
Modify the landing page (/app/page.tsx)
Modify the /apply flow
Install packages that are already in package.json
Create separate CSS files
Use any real API keys or make external HTTP calls except the NHTSA VIN decoder (public, no key required)
After completing each step, confirm the file was created and show me the first 20 lines to verify the pattern is correct before moving to the next step.
─── END COPY ───────────────────────────────────────────────────────────────