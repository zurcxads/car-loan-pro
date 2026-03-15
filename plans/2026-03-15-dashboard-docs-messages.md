# Plan: Dashboard Documents & Messages Sections
Date: 2026-03-15
Status: executing

## Context
The consumer dashboard has a locked offer hero card and progress bar. 
Now we need the documents section (lender requests + upload) and messages section.
These are core to the post-lock-in flow — lenders request docs, consumers upload them.

## Steps
1. [ ] Create document request types and interfaces in src/lib/types.ts
   - DocumentRequest: id, applicationId, type (pay_stub, drivers_license, bank_statement, etc), status (pending, uploaded, reviewed, approved, rejected), requestedAt, deadline, uploadedAt, notes
   - Message: id, applicationId, senderId, senderRole (consumer, lender, admin), content, createdAt, readAt

2. [ ] Create src/app/api/documents/requests/route.ts
   - GET: fetch document requests for an application (consumer session auth)
   - POST: upload a document against a request (multipart form or base64)

3. [ ] Create src/app/api/messages/route.ts
   - GET: fetch messages for an application (consumer session auth)
   - POST: send a message (consumer or lender)

4. [ ] Add Documents section to dashboard page
   - List of pending document requests with type, deadline, status
   - Upload button per request (file input)
   - Uploaded docs show with checkmark
   - Empty state: "No documents requested yet"

5. [ ] Add Messages section to dashboard page
   - Simple chat-style UI (messages in chronological order)
   - Text input + send button at bottom
   - Messages from lender have different styling (left-aligned, gray bg)
   - Messages from consumer (right-aligned, blue bg)
   - Empty state: "No messages yet. Your lender will reach out here if they need anything."

6. [ ] Add Next Steps card to dashboard
   - Contextual based on application status
   - offer_accepted: "Your lender is reviewing your application"
   - documents_requested: "Upload the requested documents below"
   - under_review: "Your application is being reviewed"
   - approved: "Visit your lender to finalize"
   - funded: "Your loan has been funded"

## Verification
- [ ] npm run build passes
- [ ] No new console statements
- [ ] No new any types
- [ ] All new routes have auth checks
- [ ] Mobile responsive

## Risks
- Document upload needs storage — use Supabase Storage or base64 in DB for now
- Messages table doesn't exist yet — create via API or add to blockers
