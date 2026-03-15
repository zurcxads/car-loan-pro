import { NextRequest, NextResponse } from 'next/server';
import { verifyDevAccessRequest } from '@/lib/dev-access';

export async function GET(request: NextRequest) {
  const result = await verifyDevAccessRequest(request);

  return NextResponse.json({
    expiresAt: result.expiresAt,
    valid: result.valid,
  });
}
