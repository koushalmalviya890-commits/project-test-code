// /api/customers/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Authenticate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the email domain from query parameters
    const { searchParams } = new URL(request.url);
    const emailDomain = searchParams.get('emailDomain');

    // Check if emailDomain is provided
    if (!emailDomain) {
      return NextResponse.json(
        { error: 'emailDomain query parameter is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Build the query
    const query = { startupMailId: emailDomain };

    // Fetch customers with the specified email domain
    const customers = await db.collection('Startups').find(query).toArray();

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error in GET /api/customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}