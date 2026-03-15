import { NextRequest, NextResponse } from 'next/server';
import { dbGetApplications } from '@/lib/db';
import { verifyDevAccessRequest } from '@/lib/dev-access';

export async function GET(request: NextRequest) {
  const devAccess = await verifyDevAccessRequest(request);
  if (!devAccess.valid) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  const applications = await dbGetApplications();
  const recentApplications = applications
    .slice()
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 12)
    .map((application) => ({
      created_at: application.submittedAt,
      id: application.id,
      name: `${application.borrower.firstName} ${application.borrower.lastName}`.trim(),
      status: application.status,
    }));

  return NextResponse.json({ success: true, data: recentApplications });
}
