import { NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * Verifies the signature of an incoming webhook request
 * @param req The incoming request
 * @returns An object with isValid flag and the request body
 */
export async function verifyWebhookSignature(req: NextRequest): Promise<{isValid: boolean, body: string}> {
  try {
    // Get the signature and timestamp from headers
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');
    
    // If signature or timestamp are missing, reject the request
    if (!signature || !timestamp) {
      console.error('Missing signature or timestamp headers');
      return { isValid: false, body: '' };
    }
    
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET is not configured in environment variables');
      return { isValid: false, body: '' };
    }
    
    // Get the request body as text
    const body = await req.text();
    
    // Recalculate the signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(timestamp + '.' + body)
      .digest('hex');
    
    // Check timestamp (prevent replay attacks)
    const timestampAge = Date.now() - parseInt(timestamp);
    const isTimestampValid = timestampAge <= 5 * 60 * 1000; // Within 5 minutes
    
    if (!isTimestampValid) {
      console.error('Webhook timestamp is too old', { timestamp, age: timestampAge });
    }
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature', { providedSignature: signature, expectedSignature });
    }
    
    // Verify the signature matches and timestamp is valid
    return {
      isValid: signature === expectedSignature && isTimestampValid,
      body
    };
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return { isValid: false, body: '' };
  }
} 