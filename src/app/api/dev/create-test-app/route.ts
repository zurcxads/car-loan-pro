import { NextRequest, NextResponse } from 'next/server';
import { getTestApplicationData, TEST_CREDIT_RESULT } from '@/lib/test-data';

// Helper to generate a simple session token
function generateSessionToken(): string {
  return 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { withVehicle = false } = body;

    // Get test data (will be used in real implementation)
    getTestApplicationData(withVehicle);

    // Create a mock application ID
    const applicationId = 'test-app-' + Date.now();
    const sessionToken = generateSessionToken();

    // Simulate test application creation
    const creditScore = TEST_CREDIT_RESULT.ficoScore;
    const riskTier = creditScore >= 700 ? 'prime' : creditScore >= 640 ? 'near_prime' : 'subprime';



    return NextResponse.json({
      success: true,
      id: applicationId,
      sessionToken,
      creditScore,
      riskTier,
    });
  } catch (error) {
    console.error('[DEV] Error creating test application:', error);
    return NextResponse.json(
      { error: 'Failed to create test application' },
      { status: 500 }
    );
  }
}
