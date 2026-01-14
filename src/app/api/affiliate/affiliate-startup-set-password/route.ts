import { NextRequest, NextResponse } from 'next/server';
import { setAffiliatePassword } from '@/lib/actions/auth';

export async function POST(req: NextRequest) {
  try {
    // Get request data
    const requestData = await req.json();
    const { email, password } = requestData;

    // Call the action to set the password
    const result = await setAffiliatePassword({ email, password });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}