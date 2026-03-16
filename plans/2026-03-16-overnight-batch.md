# Overnight Batch — March 16, 2026

## Batch 1: Lender Actions + Real-time Updates
- [ ] Lender approve/decline/counter-offer actions on locked applications
- [ ] Consumer dashboard updates in real-time when lender takes action
- [ ] Lender gets notified when consumer uploads documents

## Batch 2: Consumer Email Notifications
- [ ] Offer expiring soon (7 days, 3 days, 1 day warnings)
- [ ] Lender requested documents notification
- [ ] Offer approved/declined notification
- [ ] All use existing Resend email infrastructure

## Batch 3: Onboarding Wizards
- [ ] Lender onboarding multi-step wizard (company info → lending criteria → states → review)
- [ ] Dealer onboarding multi-step wizard (dealership info → inventory → location → review)

## Batch 4: Code Cleanup
- [ ] Convert 72 inline styles to Tailwind classes
- [ ] Final UI audit polish pass

## Rules
- Sequential Codex agents (one at a time)
- Build must pass after each batch
- Commit after each logical piece
- No emojis in UI
- Use serverLogger, not console.log
