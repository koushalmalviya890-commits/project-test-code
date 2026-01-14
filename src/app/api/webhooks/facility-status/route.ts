import { NextRequest, NextResponse } from 'next/server';
import { createFacilityApprovedNotification } from '@/lib/services/notificationService';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyWebhookSignature } from '@/lib/webhooks/verifyWebhook';

// Webhook handler for facility status changes
// This is triggered by the admin panel when a facility status changes
export async function POST(req: NextRequest) {
  try {
    // Verify the webhook signature
    const { isValid, body } = await verifyWebhookSignature(req);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature or expired timestamp' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Parse the payload
    const payload = JSON.parse(body);
    
    // Validate the payload
    if (!payload.facilityId || !payload.status || !payload.serviceProviderId) {
      return NextResponse.json(
        { error: 'Invalid payload. Required fields: facilityId, status, serviceProviderId' },
        { status: 400 }
      );
    }
    
    // Log the webhook receipt
   // console.log('Received valid facility status webhook:', {
    //   facilityId: payload.facilityId,
    //   status: payload.status,
    //   previousStatus: payload.previousStatus
    // });
    
    // Check if status changed to 'approved'
    if (payload.status.toLowerCase() === 'approved' && payload.previousStatus?.toLowerCase() === 'pending') {
      // Create a notification for the service provider
      const notification = await createFacilityApprovedNotification(
        payload.serviceProviderId,
        payload.facilityId,
        payload.facilityName || 'Your facility',
        payload.facilityType || 'Unknown type'
      );
      
      return NextResponse.json({ 
        message: 'Notification created successfully',
        notification
      });
    }
    
    // If status is not 'approved' or previous status was not 'pending', just return success
    return NextResponse.json({ message: 'No notification needed for this status change' });
  } catch (error: any) {
    console.error('Error processing facility status webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 