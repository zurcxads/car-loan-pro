# Car Loan Pro — PRD

AutoBridge
Direct-to-Consumer Auto Lending Marketplace
Product Requirements Document (PRD)
Version 1.0  |  Confidential
Table of Contents
1. Executive Summary
1.1 Product Vision
AutoBridge is a direct-to-consumer auto lending marketplace that replicates and democratizes the F&I (Finance & Insurance) desk experience found at car dealerships. Consumers submit one application, receive multiple real lender offers across all credit tiers, and arrive at any dealership or private-party transaction pre-approved — eliminating dealer markup, rate manipulation, and the high-pressure finance office environment.
1.2 Problem Statement
Today's auto financing process is deliberately opaque:
Dealers submit customer applications to lenders through closed platforms (RouteOne, DealerTrack) that consumers never access directly.
Finance managers mark up the buy rate (dealer reserve) by 1–3%, costing consumers thousands over the loan term.
Subprime and near-prime borrowers are steered toward high-margin lenders regardless of fit.
Hispanic, immigrant, and thin-file borrowers have no visibility into which lenders can approve them.
1.3 Solution
AutoBridge connects consumers directly to a tiered lender network — prime banks, credit unions, and subprime specialty lenders — via a single application. Consumers get transparent, real offers. Dealers get pre-qualified buyers. Lenders get lower-cost, higher-quality originations.
1.4 Target Market
Segment
Description
Size
Prime Borrowers (720+)
Consumers who qualify at banks/CUs but want rate comparison
~40% of auto buyers
Near-Prime (620–719)
Consumers often steered by dealers — biggest opportunity
~35% of auto buyers
Subprime (<620)
Specialized lenders required; underserved digitally
~25% of auto buyers
Thin-File / Immigrant
No US credit history; need ITIN lenders
Fast-growing segment
2. Stakeholders & User Roles
Role
Description
Primary Actions
Consumer / Borrower
Individual seeking auto financing
Submit application, view offers, select lender, get approval letter
Co-Borrower
Joint applicant on the loan
Complete own section of application, authorize credit pull
Lender Admin
Bank, CU, or finance company rep
Configure underwriting rules, view/respond to submitted deals, fund loans
Dealer Partner
Dealership using the platform to view pre-approved buyers
View incoming pre-approved consumers, validate approvals, process deal docs
Platform Admin
AutoBridge internal ops team
Manage lender onboarding, compliance, fraud monitoring, fee reconciliation
Compliance Officer
Legal/regulatory oversight role
Audit credit pulls, adverse action notices, FCRA/ECOA compliance logs
3. System Architecture
3.1 High-Level Architecture
AutoBridge is a multi-sided platform with four core layers:
Consumer Layer — React/Next.js web app + React Native mobile app for application intake and offer display
API Gateway — Node.js/Express REST API handling authentication, routing, rate limiting, and orchestration
Integration Layer — Connectors to credit bureaus, lender APIs, identity verification, and document services
Data Layer — PostgreSQL (primary), Redis (session/cache), S3 (documents), and an audit log store
3.2 Tech Stack
Layer
Technology
Purpose
Frontend Web
Next.js 14, React, Tailwind CSS, shadcn/ui
Consumer application flow, offer comparison, dashboard
Mobile
React Native (Expo)
iOS/Android consumer app
Backend API
Node.js, Express, TypeScript
Core business logic, orchestration, lender routing
Database
PostgreSQL (Supabase)
All relational data: applications, offers, users, lenders
Cache/Queue
Redis
Session management, job queues, rate limiting
File Storage
AWS S3
Document uploads (paystubs, IDs, approval letters)
Credit Pull
Experian Connect API or 700Credit
Soft pull (pre-qual) and hard pull (final approval)
Identity Verification
Persona or Socure
KYC, SSN validation, document verification
Income Verification
Plaid Income or Argyle
Bank statement / payroll data pull
Lender Routing
RouteOne API + Direct Lender APIs
Deal submission and decision retrieval
Auth
Supabase Auth / JWT
Consumer and admin authentication
Email/SMS
SendGrid + Twilio
Notifications, OTP, status updates
Analytics
PostHog or Mixpanel
Funnel tracking, conversion optimization
Hosting
Vercel (frontend), Railway or AWS (backend)
Scalable cloud infrastructure
3.3 Core Database Schema
3.3.1 users
Column
Type
Constraints
Description
id
UUID
PK, NOT NULL
Unique user identifier
email
VARCHAR(255)
UNIQUE, NOT NULL
Login email
phone
VARCHAR(20)
UNIQUE
Mobile phone for OTP/SMS
role
ENUM
NOT NULL
consumer | dealer | lender | admin
first_name
VARCHAR(100)
NOT NULL
last_name
VARCHAR(100)
NOT NULL
ssn_encrypted
TEXT
AES-256 encrypted SSN
dob
DATE
Date of birth
created_at
TIMESTAMP
DEFAULT NOW()
updated_at
TIMESTAMP
DEFAULT NOW()
is_verified
BOOLEAN
DEFAULT FALSE
KYC verified flag
is_active
BOOLEAN
DEFAULT TRUE
Soft delete flag
3.3.2 applications
Column
Type
Constraints
Description
id
UUID
PK, NOT NULL
Application ID
user_id
UUID
FK users.id, NOT NULL
Primary borrower
coborrower_id
UUID
FK users.id
Optional co-borrower
status
ENUM
NOT NULL
draft | submitted | decisioned | expired | funded
application_type
ENUM
NOT NULL
new_vehicle | used_vehicle | refinance | private_party
created_at
TIMESTAMP
DEFAULT NOW()
submitted_at
TIMESTAMP
When sent to lenders
expires_at
TIMESTAMP
Offer expiration date
soft_pull_complete
BOOLEAN
DEFAULT FALSE
hard_pull_authorized
BOOLEAN
DEFAULT FALSE
selected_offer_id
UUID
FK offers.id
Chosen lender offer
3.3.3 borrower_profiles
Column
Type
Constraints
Description
id
UUID
PK
application_id
UUID
FK applications.id
is_coborrower
BOOLEAN
DEFAULT FALSE
full_name
VARCHAR(200)
NOT NULL
ssn_last4
VARCHAR(4)
Last 4 digits only for display
ssn_encrypted
TEXT
Full SSN, AES-256 encrypted
dob
DATE
NOT NULL
drivers_license_number
VARCHAR(50)
drivers_license_state
CHAR(2)
email
VARCHAR(255)
NOT NULL
phone_primary
VARCHAR(20)
NOT NULL
current_address_line1
VARCHAR(200)
NOT NULL
current_address_line2
VARCHAR(100)
current_city
VARCHAR(100)
NOT NULL
current_state
CHAR(2)
NOT NULL
current_zip
VARCHAR(10)
NOT NULL
current_residence_type
ENUM
own | rent | other
current_monthly_housing_payment
DECIMAL(10,2)
months_at_current_address
INTEGER
prev_address_line1
VARCHAR(200)
Required if < 24 months current
prev_address_city
VARCHAR(100)
prev_address_state
CHAR(2)
prev_address_zip
VARCHAR(10)
3.3.4 employment_income
Column
Type
Constraints
Description
id
UUID
PK
borrower_profile_id
UUID
FK borrower_profiles.id
income_type
ENUM
NOT NULL
primary_employment | secondary_employment | self_employed | retirement | disability | ssi | child_support | other
employer_name
VARCHAR(200)
employer_address
VARCHAR(300)
employer_phone
VARCHAR(20)
job_title
VARCHAR(100)
employment_status
ENUM
full_time | part_time | self_employed | retired | other
months_at_employer
INTEGER
gross_monthly_income
DECIMAL(10,2)
NOT NULL
income_verified
BOOLEAN
DEFAULT FALSE
income_verification_method
ENUM
paystub | bank_statement | tax_return | plaid | argyle
3.3.5 vehicle_info
Column
Type
Constraints
Description
id
UUID
PK
application_id
UUID
FK applications.id, NOT NULL
vehicle_condition
ENUM
NOT NULL
new | used | certified_pre_owned
year
SMALLINT
NOT NULL
make
VARCHAR(100)
NOT NULL
model
VARCHAR(100)
NOT NULL
trim
VARCHAR(100)
vin
VARCHAR(17)
17-character VIN
mileage
INTEGER
Current odometer
asking_price
DECIMAL(10,2)
NOT NULL
Dealer or seller price
nada_book_value
DECIMAL(10,2)
NADA clean trade value
kbb_value
DECIMAL(10,2)
Kelley Blue Book value
dealer_name
VARCHAR(200)
Selling dealer if applicable
dealer_id
UUID
FK dealers.id
If dealer is a platform partner
is_private_party
BOOLEAN
DEFAULT FALSE
3.3.6 deal_structure
Column
Type
Constraints
Description
id
UUID
PK
application_id
UUID
FK applications.id, NOT NULL
sale_price
DECIMAL(10,2)
NOT NULL
Agreed vehicle sale price
cash_down_payment
DECIMAL(10,2)
DEFAULT 0
trade_in_year
SMALLINT
Trade-in vehicle year
trade_in_make
VARCHAR(100)
trade_in_model
VARCHAR(100)
trade_in_vin
VARCHAR(17)
trade_in_acv
DECIMAL(10,2)
Actual Cash Value of trade
trade_in_payoff
DECIMAL(10,2)
Outstanding balance on trade
trade_in_equity
DECIMAL(10,2)
ACV minus payoff (can be negative)
doc_fee
DECIMAL(10,2)
Dealer documentation fee
title_registration_fee
DECIMAL(10,2)
sales_tax
DECIMAL(10,2)
State/local tax
gap_insurance
DECIMAL(10,2)
Rolled into loan if selected
extended_warranty
DECIMAL(10,2)
VSC if selected
total_amount_financed
DECIMAL(10,2)
NOT NULL
Computed: price + fees - down - equity
desired_term_months
SMALLINT
36 | 48 | 60 | 72 | 84
max_monthly_payment
DECIMAL(10,2)
Consumer's self-reported max
3.3.7 credit_pulls
Column
Type
Constraints
Description
id
UUID
PK
borrower_profile_id
UUID
FK borrower_profiles.id
pull_type
ENUM
NOT NULL
soft | hard
bureau
ENUM
experian | equifax | transunion | tri_merge
pulled_at
TIMESTAMP
NOT NULL
fico_score
SMALLINT
vantage_score
SMALLINT
report_reference_id
VARCHAR(100)
Bureau-returned reference
raw_report_s3_key
TEXT
Encrypted stored report
dti_percent
DECIMAL(5,2)
Debt-to-income ratio
total_monthly_obligations
DECIMAL(10,2)
open_auto_tradelines
SMALLINT
derogatory_marks
SMALLINT
has_repo
BOOLEAN
Any repossession on file
has_bankruptcy
BOOLEAN
months_since_last_derog
SMALLINT
3.3.8 lenders
Column
Type
Constraints
Description
id
UUID
PK
name
VARCHAR(200)
NOT NULL
Lender display name
tier
ENUM
NOT NULL
prime | near_prime | subprime | specialty
integration_type
ENUM
NOT NULL
routeone | dealertrack | direct_api | manual
api_base_url
TEXT
Direct API endpoint
api_key_encrypted
TEXT
Encrypted credentials
min_fico_score
SMALLINT
Minimum acceptable score
max_ltv_percent
DECIMAL(5,2)
Max loan-to-value ratio
max_dti_percent
DECIMAL(5,2)
Max debt-to-income
max_pti_percent
DECIMAL(5,2)
Max payment-to-income
max_loan_amount
DECIMAL(10,2)
min_loan_amount
DECIMAL(10,2)
accepts_private_party
BOOLEAN
DEFAULT FALSE
accepts_itin
BOOLEAN
DEFAULT FALSE
No SSN borrowers
states_active
TEXT[]
Array of active state codes
referral_fee
DECIMAL(10,2)
Per-funded-loan fee to AutoBridge
is_active
BOOLEAN
DEFAULT TRUE
3.3.9 offers
Column
Type
Constraints
Description
id
UUID
PK
application_id
UUID
FK applications.id, NOT NULL
lender_id
UUID
FK lenders.id, NOT NULL
status
ENUM
NOT NULL
pending | approved | conditional | declined | expired | selected
approved_amount
DECIMAL(10,2)
annual_percentage_rate
DECIMAL(6,4)
APR offered
term_months
SMALLINT
monthly_payment
DECIMAL(10,2)
conditions
TEXT[]
List of conditions (e.g. proof of income)
lender_decision_at
TIMESTAMP
expires_at
TIMESTAMP
Offer expiry
lender_reference_id
VARCHAR(100)
Lender-side deal ID
approval_letter_s3_key
TEXT
Generated PDF letter
is_consumer_visible
BOOLEAN
DEFAULT TRUE
3.3.10 documents
Column
Type
Constraints
Description
id
UUID
PK
application_id
UUID
FK applications.id
borrower_profile_id
UUID
FK borrower_profiles.id
document_type
ENUM
NOT NULL
paystub | bank_statement | tax_return | drivers_license | proof_of_insurance | proof_of_residence | title
s3_key
TEXT
NOT NULL
Encrypted file path
file_name
VARCHAR(255)
Original filename
mime_type
VARCHAR(100)
uploaded_at
TIMESTAMP
DEFAULT NOW()
verified
BOOLEAN
DEFAULT FALSE
verified_by
UUID
FK users.id
Admin who verified
4. Consumer Application — Field Specifications
This is the complete intake form the consumer completes. All fields map directly to the database schema defined in Section 3. Field validations, required status, and lender tier requirements are specified per field.
4.1 Step 1 — Borrower Personal Information
Field Name
Field Type
Required
Validation Rule
Notes
full_legal_first_name
Text
Yes
Min 2 chars, alpha only
Must match ID
full_legal_middle_name
Text
No
Alpha only
full_legal_last_name
Text
Yes
Min 2 chars, alpha only
suffix
Select
No
Jr | Sr | II | III | IV
ssn
Masked Text
Yes
###-##-#### format, Luhn-like check
Encrypted at rest
date_of_birth
Date
Yes
Must be 18+ years old
drivers_license_number
Text
No*
State-specific format
*Required by some lenders
drivers_license_state
Select
No*
2-char state code
email
Email
Yes
RFC 5322 valid format
Verified via OTP
phone_primary
Phone
Yes
10-digit US number
SMS OTP sent
preferred_language
Select
No
English | Spanish | Other
Affects UI locale
4.2 Step 2 — Address History
Field Name
Field Type
Required
Validation Rule
Notes
current_address_line1
Text
Yes
Max 200 chars
USPS validation preferred
current_address_line2
Text
No
Apt/unit number
current_city
Text
Yes
Max 100 chars
current_state
Select
Yes
2-char US state
current_zip
Text
Yes
5 or 9 digit ZIP
current_residence_type
Radio
Yes
own | rent | other
monthly_housing_payment
Currency
Yes
0 if own free-clear
Used in DTI calc
months_at_current_address
Number
Yes
0–600 range
prev_address_line1
Text
Conditional
Required if months_at_current < 24
prev_address_city
Text
Conditional
Same condition as above
prev_address_state
Select
Conditional
2-char state
prev_address_zip
Text
Conditional
5 or 9 digit ZIP
months_at_prev_address
Number
Conditional
Required if prev address present
4.3 Step 3 — Employment & Income
Field Name
Field Type
Required
Validation Rule
Notes
employment_status
Select
Yes
full_time | part_time | self_employed | retired | other
employer_name
Text
Conditional
Required if employed
Max 200 chars
employer_address
Text
Conditional
Required by some lenders
employer_phone
Phone
No
10-digit US
job_title
Text
Conditional
Required if employed
months_at_employer
Number
Yes
0–600
< 6 months triggers instability flag
gross_monthly_income
Currency
Yes
Must be > 0
Pre-tax monthly
income_type_primary
Select
Yes
employment | self_employed | retirement | disability | ssi | child_support | other
other_income_source
Text
Conditional
Required if income_type = other
other_income_monthly
Currency
Conditional
Required if other income present
income_verification_method
Select
No
paystub | bank_statement | tax_return | plaid | argyle
Consumer selects preferred method
4.4 Step 4 — Vehicle Information
Field Name
Field Type
Required
Validation Rule
Notes
application_type
Radio
Yes
new_vehicle | used_vehicle | refinance | private_party
Affects lender eligibility
vehicle_condition
Radio
Yes
new | used | certified_pre_owned
vehicle_year
Number
Yes
1990–current year + 1
Older vehicles limit lenders
vehicle_make
Select/Text
Yes
Validated against NHTSA list
vehicle_model
Select/Text
Yes
Dependent on make
vehicle_trim
Text
No
Max 100 chars
vin
Text
No*
17-char, NHTSA format validated
*Required for final approval
mileage
Number
Conditional
Required if used vehicle
High mileage limits lenders
asking_price
Currency
Yes
Must be > 0
Vehicle sale price
is_private_party
Boolean
Yes
true | false
Limits to PPT lenders
dealer_name
Text
Conditional
Required if dealer sale
dealer_zip
Text
Conditional
For dealer lookup
4.5 Step 5 — Deal Structure
Field Name
Field Type
Required
Validation Rule
Notes
cash_down_payment
Currency
Yes
Min 0
Can be $0
has_trade_in
Boolean
Yes
true | false
trade_in_year
Number
Conditional
Required if has_trade_in
trade_in_make
Select/Text
Conditional
Required if has_trade_in
trade_in_model
Select/Text
Conditional
Required if has_trade_in
trade_in_vin
Text
Conditional
17-char VIN if available
trade_in_payoff_amount
Currency
Conditional
0 if owned free and clear
desired_term_months
Select
Yes
36 | 48 | 60 | 72 | 84
max_monthly_payment
Currency
No
Consumer guidance field
Used for offer filtering
gap_insurance_interest
Boolean
No
true | false
Pre-selects GAP add-on
extended_warranty_interest
Boolean
No
true | false
Pre-selects VSC add-on
4.6 Step 6 — Co-Borrower (Optional)
All fields from Steps 1–3 are repeated for the co-borrower. Co-borrower income is added to primary borrower income for DTI/PTI calculations. Co-borrower credit is pulled separately (same soft/hard pull flow).
4.7 Step 7 — Credit Authorization & Consent
Field Name
Field Type
Required
Notes
soft_pull_consent
Checkbox
Yes
FCRA-compliant language required. Soft pull does not affect score.
hard_pull_consent
Checkbox
Yes
Obtained ONLY when consumer selects an offer. Must be separate click.
tcpa_consent
Checkbox
Yes
Consent to contact via phone/SMS/email
terms_of_service
Checkbox
Yes
Link to full TOS must be visible
privacy_policy
Checkbox
Yes
Link to Privacy Policy must be visible
e_sign_consent
Checkbox
Yes
Required for electronic document delivery
adverse_action_email
Email
Yes
Pre-filled from profile; for ECOA notices
5. Lender Underwriting & Routing Engine
5.1 Lender Tier Definitions
Tier
FICO Range
Example Lenders
Key Underwriting Factors
Tier 1 — Prime
720+
Chase Auto, Bank of America, Capital One, DCU
Strict LTV, low DTI, clean credit history
Tier 2 — Near-Prime
660–719
Ally Financial, TD Auto, Westlake Financial
Moderate LTV, stable employment, min 12mo history
Tier 3 — Subprime
580–659
CAC (Credit Acceptance), DriveTime, Prestige Financial
Income-based underwriting, higher rates, shorter terms on older vehicles
Tier 4 — Deep Subprime
Below 580
JM Family, buy-here-pay-here lenders
Employment verification critical, high down payment required
Specialty — Thin File
No score / ITIN
Self-Help CU, ITIN lenders
Alternative data: rent history, utility payments, bank statements
5.2 Underwriting Decision Variables
Variable
Calculation
Threshold Logic
Loan-to-Value (LTV)
Loan Amount ÷ Vehicle Value
Prime: max 110% | Near-Prime: max 120% | Subprime: max 130%
Payment-to-Income (PTI)
Monthly Payment ÷ Gross Monthly Income
Most lenders: max 15–20% of gross monthly
Debt-to-Income (DTI)
Total Monthly Obligations ÷ Gross Monthly Income
Prime: max 40% | Others: max 50%
Vehicle Age Factor
Current Year - Vehicle Year
Most lenders: max 7–10 year old vehicles; subprime allows older
Mileage Factor
Odometer reading
Most lenders: max 100k–150k miles for standard terms
Employment Stability
Months at current employer
< 6 months triggers secondary review; 12+ months preferred
Housing Stability
Months at current address
< 12 months may require extra documentation
Bankruptcy Score
Has BK on report + months since discharge
Most lenders: 2–4 years post-discharge minimum
Repossession Score
Has repo on report + months since
Prime: any repo = decline; Subprime: 12–24 months seasoning
5.3 Lender Matching Algorithm
When an application is submitted, the routing engine executes the following logic:
Step 1 — Filter lenders by state (application state must be in lender.states_active array)
Step 2 — Filter by application_type (e.g., if is_private_party = true, only lenders with accepts_private_party = true)
Step 3 — Filter by FICO score (lender.min_fico_score <= credit_pull.fico_score)
Step 4 — Compute LTV and filter by lender.max_ltv_percent
Step 5 — Compute PTI and DTI; filter by lender thresholds
Step 6 — Apply vehicle-specific filters (year, mileage, condition)
Step 7 — Sort remaining eligible lenders by: estimated rate (ASC), then lender.referral_fee (DESC) as tiebreaker
Step 8 — Submit to top N lenders simultaneously (configurable, default N=5)
Step 9 — Receive decisions asynchronously; display to consumer as they arrive (streaming UI)
Step 10 — Log all submissions and decisions for ECOA/FCRA compliance audit trail
6. Feature Modules
6.1 Consumer-Facing Features
6.1.1 Pre-Qualification Flow (Soft Pull)
Consumer enters personal info, income, vehicle, and deal structure
Platform performs soft credit pull — zero credit score impact
Consumer sees estimated rate ranges and lender tier eligibility
Full application not yet submitted to lenders — no hard inquiry
Consumer can save application as draft and return later (email magic link)
6.1.2 Offer Dashboard
Displays all lender offers in a comparison card view
Each card shows: Lender name + logo, APR, term, monthly payment, approved amount, conditions
Filter/sort by: lowest rate, lowest payment, shortest term
'Select This Offer' button triggers hard pull consent dialog
Offer expiration countdown shown on each card
Declined offers shown collapsed with reason (when lender provides)
6.1.3 Approval Letter Generator
PDF generated dynamically upon offer selection
Includes: borrower name, approved amount, lender name, valid-through date, conditions list
Consumer can download, email, or share directly to dealer
Dealer-friendly format mimics Capital One Auto Navigator blank check
6.1.4 Document Upload Center
Consumer uploads required verification docs (paystubs, ID, proof of residence)
Each document requirement linked to specific offer conditions
Supports PDF, JPG, PNG — max 10MB per file
OCR extraction to auto-fill fields where possible
Lender notified automatically when all conditions are satisfied
6.1.5 Application Status Tracker
Step-by-step status display: Application Received > Credit Reviewed > Offers Available > Offer Selected > Conditions Satisfied > Funded
SMS and email notifications at each stage transition
Estimated funding timeline shown after offer selection
6.2 Lender-Facing Portal
6.2.1 Lender Dashboard
Real-time queue of submitted applications matching their criteria
Ability to set automated decisioning rules (auto-approve or auto-decline based on parameters)
Manual review queue for applications outside auto-decision parameters
Funded loan reporting and referral fee reconciliation
6.2.2 Underwriting Rule Configuration
Lender can update their own min/max thresholds (FICO, LTV, DTI, PTI, mileage, vehicle age) via UI
Changes are effective immediately and affect next routing cycle
Audit log of all rule changes with timestamp and user
6.3 Dealer Partner Portal
6.3.1 Pre-Approved Buyer Inbox
Dealers can view consumers who have selected offers valid at their location
Consumer profile shows: approval amount, term, rate range, vehicle desired, and time since pre-approval
Dealer can trigger in-app notification to consumer to schedule visit
6.3.2 Deal Finalization
Dealer enters final VIN, exact sale price, fees once consumer arrives
Platform re-checks offer against final numbers for LTV compliance
If within lender tolerance, deal is confirmed and lender is notified for funding
Dealer receives funding confirmation and wire instructions
7. External API Integrations
Integration
Provider
Usage
Auth Method
Latency SLA
Credit Bureau — Soft Pull
Experian Connect or 700Credit
Pre-qualification FICO score, summary tradeline data
OAuth 2.0 + client certs
< 3 seconds
Credit Bureau — Hard Pull
Experian Connect or 700Credit
Full tri-merge report for selected offer
OAuth 2.0 + client certs
< 5 seconds
VIN Decoder
NHTSA vPIC API (free) or Polk
Year/make/model/trim from 17-char VIN
API Key
< 1 second
Vehicle Valuation
NADA Guides API or Black Book
Current market value for LTV calculation
API Key
< 2 seconds
Identity Verification
Persona or Socure
KYC: SSN validation, ID document scan
API Key + Webhook
< 10 seconds
Income Verification
Plaid Income or Argyle
Direct payroll / bank statement pull
OAuth (consumer auth)
< 5 seconds
Lender Routing
RouteOne API or DealerTrack
Submit deal packages to lender network
SFTP + REST or SOAP
< 30 seconds
Direct Lender APIs
Ally, Westlake, CAC, etc.
Real-time decisions on direct integrations
Per-lender credentials
5–60 seconds
Address Validation
USPS API or SmartyStreets
USPS-validate all mailing addresses
API Key
< 1 second
Document Storage
AWS S3 + KMS
Encrypted document upload and retrieval
IAM roles
< 2 seconds
Email
SendGrid
Transactional email: OTP, offers, status
API Key
< 5 seconds
SMS
Twilio
OTP verification, status notifications
API Key + SID
< 3 seconds
Fraud / Device Fingerprinting
Sardine or Socure
Prevent synthetic identity fraud
API Key
< 1 second
8. Compliance & Regulatory Requirements
8.1 Federal Requirements
Regulation
Requirement
Implementation
FCRA (Fair Credit Reporting Act)
Permissible purpose for every credit pull; adverse action notices within 30 days of decline
Consent checkboxes with FCRA language; automated adverse action letter generation on all declined applications
ECOA (Equal Credit Opportunity Act)
Cannot discriminate based on race, sex, national origin, age, religion, marital status
Audit log of all decisions; no prohibited data collected; regular disparate impact analysis
GLBA (Gramm-Leach-Bliley)
Protect consumer financial data; privacy notice required
Data encryption at rest and in transit; annual privacy notice email to all users
TILA (Truth in Lending Act)
Disclose APR, total finance charge, total of payments before loan closing
APR shown prominently on every offer card; Truth in Lending disclosure PDF pre-closing
TCPA (Telephone Consumer Protection Act)
Explicit consent before marketing calls/texts
TCPA consent checkbox at account creation; opt-out honored within 24 hours
BSA/AML
Monitor for suspicious activity if money transmission license held
Depends on state licensing model; may not apply if purely matching/brokering
8.2 State Licensing
Depending on the business model chosen, AutoBridge may need one or more of the following per state:
Consumer Finance Lender License — if AutoBridge originates loans directly (not recommended for V1)
Mortgage/Auto Broker License — if AutoBridge receives fees for arranging credit (most states require this)
Credit Services Organization (CSO) License — required in TX, GA, SC, CO for credit repair/arranging credit
Sales Finance Company License — required in FL, CA, NY for indirect auto lending arrangements
Recommendation: Engage auto finance compliance counsel (e.g., Hudson Cook LLP) prior to launch. Start with states that have lowest licensing burden (TX, FL, GA, OH, MI) for V1 rollout.
8.3 Data Security Requirements
All PII (SSN, DOB, DL number) encrypted at rest using AES-256
All API communication over TLS 1.2+
SSNs never stored in plaintext — encrypted on write, decrypted only at point of use
Credit reports stored in encrypted S3 with 7-year retention per FCRA
SOC 2 Type II compliance target within 12 months of launch
Annual penetration testing required
9. Business Model & Monetization
Revenue Stream
Description
Est. Per-Transaction Value
Notes
Lender Referral Fee
Per-funded-loan fee paid by lender to AutoBridge for origination
$150–$500 per funded loan
Primary revenue driver; negotiated per lender agreement
Dealer SaaS Subscription
Monthly fee for dealers to access pre-approved buyer inbox and deal finalization tools
$299–$999/month per dealer location
Secondary revenue; scales with dealer network
Lead Monetization (non-funded)
Consumer started application but did not fund — sell lead to other lenders or dealers
$10–$50 per qualified lead
Must be disclosed in Privacy Policy; consumer opt-in
F&I Product Commissions
Revenue share on GAP insurance, extended warranties sold through platform
$100–$400 per product sold
Requires insurance license or carrier partnership
Premium Consumer Tier
Consumer pays monthly fee for credit monitoring + rate alerts + priority matching
$9.99–$19.99/month
Optional B2C subscription layer
9.1 Unit Economics Model
Metric
Conservative
Base Case
Optimistic
Monthly funded loans
50
200
500
Avg referral fee per loan
$200
$300
$400
Monthly referral revenue
$10,000
$60,000
$200,000
Active dealer partners
10
50
150
Avg dealer monthly fee
$299
$499
$699
Monthly dealer revenue
$2,990
$24,950
$104,850
Total Monthly Revenue
$12,990
$84,950
$304,850
CAC (Consumer)
$30
$20
$15
CAC (Dealer)
$500
$300
$200
10. Development Roadmap
Phase 1 — MVP (Weeks 1–12)
Module
Deliverable
Priority
Auth
Consumer registration, login, OTP verification
P0
Application Intake
Full 7-step intake form with validation (Sections 4.1–4.7)
P0
Credit Pull
Soft pull integration via 700Credit or Experian sandbox
P0
Lender Routing
Manual/webhook-based submission to 3–5 lenders
P0
Offer Dashboard
Display offers, filter/sort, select offer flow
P0
Hard Pull Flow
Consent collection + hard pull trigger on offer selection
P0
Approval Letter
PDF generation with lender offer details
P0
Admin Dashboard
Application monitoring, lender management, basic reporting
P0
Document Upload
S3-based upload with document type tagging
P1
SMS/Email Notifications
Status change alerts via Twilio + SendGrid
P1
Dealer Portal V1
Pre-approved buyer view for pilot dealers
P1
Phase 2 — Growth (Weeks 13–24)
Module
Deliverable
Priority
Mobile App
React Native iOS/Android consumer app
P1
Income Verification
Plaid Income integration for instant verification
P1
Identity Verification
Persona KYC integration
P1
Direct Lender APIs
Ally, Westlake, CAC direct API integrations
P1
ITIN Borrower Support
No-SSN application flow with ITIN lenders
P2
Deal Finalization
Dealer final deal submission + lender funding trigger
P1
Compliance Automation
Adverse action letter automation, FCRA audit log export
P1
Analytics Dashboard
Conversion funnel, lender approval rates, revenue tracking
P2
Co-Borrower Flow
Full co-borrower application + joint credit pull
P2
Phase 3 — Scale (Weeks 25–52)
Module
Deliverable
Priority
Refinance Product
Existing loan refinance application flow
P2
Private Party Lending
PPT lender integrations + title transfer workflow
P2
F&I Products
GAP + VSC product selection and revenue sharing
P2
Spanish Language Support
Full app localization in Spanish
P2
Credit Improvement Tools
Score simulator, pre-qual coaching, credit monitoring
P3
Dealer DMS Integration
RouteOne/DealerTrack API for seamless dealer workflow
P2
White-Label Option
Platform white-label for credit unions and dealer groups
P3
ML Underwriting Assist
Predictive match scoring to improve lender routing
P3
11. Non-Functional Requirements
Category
Requirement
Target Metric
Performance
Application page load time
< 2 seconds (P95)
Performance
Lender routing submission
< 500ms to submit; async decision handling
Performance
Credit pull response time
< 5 seconds end-to-end
Availability
Platform uptime
99.9% uptime SLA (< 8.7 hrs downtime/year)
Scalability
Concurrent users
Handle 10,000 concurrent users without degradation
Security
Data encryption
AES-256 at rest; TLS 1.3 in transit
Security
Authentication
JWT with 15-minute expiry; refresh tokens with rotation
Security
Rate limiting
Max 100 requests/minute per IP; 10 credit pulls/day per SSN
Compliance
Data retention
Credit reports: 7 years; applications: 5 years; logs: 3 years
Compliance
Adverse action notices
Auto-generated and delivered within 30 days of decline
Accessibility
WCAG compliance
WCAG 2.1 AA — screen reader compatible, keyboard navigable
Mobile
Responsive design
Full functionality on mobile screens 375px+
12. Glossary
Term
Definition
ACV
Actual Cash Value — the current market value of a trade-in vehicle
APR
Annual Percentage Rate — the true yearly cost of the loan including fees
CSO
Credit Services Organization — a state license type required in some states to arrange credit
Dealer Reserve
The markup dealers add to the buy rate from a lender — retained as profit
DMS
Dealer Management System — dealership software platform (e.g., CDK, Reynolds)
DTI
Debt-to-Income ratio — total monthly debt obligations divided by gross monthly income
ECOA
Equal Credit Opportunity Act — federal law prohibiting credit discrimination
ERA
Explanation of Remittance Advice — see also EOB in healthcare context
F&I
Finance and Insurance — the dealership department that handles financing and add-on products
FCRA
Fair Credit Reporting Act — governs how credit reports are used and disputed
ITIN
Individual Taxpayer Identification Number — used by non-SSN borrowers
LTV
Loan-to-Value ratio — loan amount divided by vehicle value
PPT
Private Party Transaction — sale between two individuals, not through a dealer
PTI
Payment-to-Income ratio — monthly loan payment divided by gross monthly income
Soft Pull
A credit inquiry that does not affect the consumer's credit score
Hard Pull
A credit inquiry that does affect the consumer's credit score; required for final approval
Thin File
A consumer with little or no traditional credit history
VSC
Vehicle Service Contract — commonly called extended warranty
VIN
Vehicle Identification Number — unique 17-character vehicle identifier
13. Appendix — Lender Network Targets for V1
Lender
Tier
Integration Path
Min FICO
Notes
Capital One Auto
Prime
Direct API
660
Strong API; consumer-facing product exists — differentiator needed
Chase Auto
Prime
RouteOne
680
Dealer indirect only; requires dealer code or fintech agreement
Ally Financial
Near-Prime
RouteOne / DealerTrack
620
High volume lender; open to fintech partnerships
TD Auto Finance
Near-Prime
RouteOne
630
Strong in Southeast and Midwest
Westlake Financial
Subprime
Direct API
520
Strong subprime; has direct API program
Credit Acceptance Corp (CAC)
Subprime
Direct API
None
Portfolio-based; accepts any score if income sufficient
Prestige Financial
Subprime
Direct API
500
Utah-based; specialty in near-prime/subprime
Open Lending Lenders
Near-Prime
Open Lending platform
580
Middleware aggregator connecting to 400+ CUs
DriveTime/Bridgecrest
Deep Subprime
Direct
None
Captive for DriveTime dealers; potential API access
Self-Help CU (ITIN)
Specialty
Direct
None
ITIN and thin-file borrowers; national reach