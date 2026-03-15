import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { dbGetApplications } from '@/lib/db';
import type { MockApplication } from '@/lib/mock-data';

type ReviewApplication = {
  id: string;
  borrower: MockApplication['borrower'];
  credit: MockApplication['credit'];
  status: MockApplication['status'];
  submittedAt: string;
  manualReviewRequired: boolean;
  reviewPriority: number;
  stipulationsComplete: boolean;
  hasVehicle: boolean;
};

function getReviewPriority(application: MockApplication): number {
  let priority = 0;

  if ((application.credit.ficoScore ?? 850) < 620) {
    priority += 1;
  }

  if (application.dtiPercent >= 45) {
    priority += 1;
  }

  if (application.credit.hasRepo || application.credit.hasBankruptcy) {
    priority += 1;
  }

  return Math.min(priority, 3);
}

function requiresManualReview(application: MockApplication, reviewPriority: number): boolean {
  return application.status === 'pending_decision' || reviewPriority > 0 || application.flags.length > 0;
}

function toReviewApplication(application: MockApplication): ReviewApplication {
  const reviewPriority = getReviewPriority(application);

  return {
    id: application.id,
    borrower: application.borrower,
    credit: application.credit,
    status: application.status,
    submittedAt: application.submittedAt,
    manualReviewRequired: requiresManualReview(application, reviewPriority),
    reviewPriority,
    stipulationsComplete: !application.flags.includes('docs_requested') && !application.flags.includes('missing_docs'),
    hasVehicle: application.hasVehicle,
  };
}

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const filter = req.nextUrl.searchParams.get('filter') || 'pending';
  const applications = await dbGetApplications();

  const reviewApplications = applications
    .map(toReviewApplication)
    .filter((application) => {
      if (filter === 'all') {
        return true;
      }

      if (filter === 'high_priority') {
        return application.reviewPriority >= 2;
      }

      return application.manualReviewRequired && application.status === 'pending_decision';
    });

  return NextResponse.json({ success: true, applications: reviewApplications });
}
