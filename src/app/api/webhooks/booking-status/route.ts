import { NextRequest, NextResponse } from 'next/server';
import { createBookingApprovedNotification } from '@/lib/services/notificationService';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyWebhookSignature } from '@/lib/webhooks/verifyWebhook';

// Webhook handler for booking status changes
// This is triggered by the admin panel when a booking status changes
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
    if (!payload.bookingId || !payload.status || !payload.serviceProviderId) {
      return NextResponse.json(
        { error: 'Invalid payload. Required fields: bookingId, status, serviceProviderId' },
        { status: 400 }
      );
    }
    
    // Log the webhook receipt
   // console.log('Received valid booking status webhook:', {
    //   bookingId: payload.bookingId,
    //   status: payload.status,
    //   previousStatus: payload.previousStatus
    // });
    
    // Check if status changed to 'approved'
    if (payload.status.toLowerCase() === 'approved' && payload.previousStatus?.toLowerCase() === 'pending') {
      // Create a notification for the service provider
      const notification = await createBookingApprovedNotification(
        payload.serviceProviderId,
        payload.bookingId,
        payload.facilityName || 'A facility',
        payload.startupName || 'A startup',
        payload.startDate || new Date().toISOString(),
        payload.endDate || new Date().toISOString(),
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
    console.error('Error processing booking status webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 