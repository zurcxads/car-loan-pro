import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MOCK_APPLICATIONS } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Missing session token' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();
    
    // Try to query from Supabase if configured
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('session_token', token)
      .gt('session_expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      // Fallback to mock data for development
      const mockApp = MOCK_APPLICATIONS.find(a => 
        (a as unknown as { sessionToken?: string }).sessionToken === token
      ) || MOCK_APPLICATIONS[0];

      return NextResponse.json({
        application: {
          id: mockApp.id,
          status: mockApp.status,
          borrower: mockApp.borrower,
          loanAmount: mockApp.loanAmount,
          offersReceived: mockApp.offersReceived,
          submittedAt: mockApp.submittedAt,
        }
      });
    }

    // Return Supabase data
    return NextResponse.json({
      application: {
        id: data.id,
        status: data.status,
        borrower: data.borrower,
        loanAmount: data.loan_amount,
        offersReceived: data.offers_received || 0,
        submittedAt: data.submitted_at,
      }
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    
    // On error, try mock data
    const mockApp = MOCK_APPLICATIONS[0];
    return NextResponse.json({
      application: {
        id: mockApp.id,
        status: mockApp.status,
        borrower: mockApp.borrower,
        loanAmount: mockApp.loanAmount,
        offersReceived: mockApp.offersReceived,
        submittedAt: mockApp.submittedAt,
      }
    });
  }
}
