# Plan: Lender Portal Enhancements
Date: 2026-03-15
Status: executing

## Context
Lenders need to see locked-in applicants, request documents, and communicate with consumers.
The consumer side (dashboard, docs, messages) is built. Now wire the lender side.

## Steps
1. [ ] Update lender dashboard to show locked-in applicants
   - New section: "Active Applications" showing apps where this lender's offer was locked
   - Each row: applicant name (masked: J*** D***), loan amount, date locked, status, actions
   - Click to expand: full application details

2. [ ] Add "Request Documents" action for lenders
   - Button on each application row
   - Modal: select document types (pay stub, ID, bank statement, proof of insurance, proof of residence, other)
   - Set deadline (7/14/30 days from now)
   - On submit: POST /api/lender/document-requests with applicationId, docTypes[], deadline
   - This creates document requests visible in consumer dashboard

3. [ ] Create POST /api/lender/document-requests/route.ts
   - Requires lender auth
   - Validates the application's locked offer belongs to this lender
   - Creates document request records
   - Updates application status to 'documents_requested'

4. [ ] Add lender messaging capability
   - Messages section in application detail view
   - Same chat UI as consumer but from lender perspective
   - POST /api/messages already exists — lenders use it with their auth

5. [ ] Cancel offer from dashboard
   - Consumer can cancel their locked offer
   - Confirmation modal with warning text
   - On confirm: POST /api/offers/cancel (already exists)
   - Dashboard updates to show "no active offer" state

## Verification
- [ ] npm run build passes
- [ ] Lender auth required on all new routes
- [ ] Ownership checks: lender can only see/act on their own applications
- [ ] Mobile responsive
