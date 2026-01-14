// app/api/auth/send-otp/route.ts
import { NextResponse } from 'next/server';
import OtpModel from '@/models/Otp'; 
  import connectDB from '@/lib/db'
import { Types } from 'mongoose';

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const OTP_EXPIRY_MINUTES = 5; // OTP valid for 5 minutes

// Utility to generate a 6-digit code
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
}

// Utility to format phone number to E.164
function formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber.startsWith('+')) {
        // ⚠️ Adjust +91 to your required default country code or ensure client passes it
        return `+91${phoneNumber}`; 
    }
    return phoneNumber;
}

export async function POST(request: Request) {
    await connectDB();

    try {
        const body = await request.json();
        let { phoneNumber, serviceProviderId } = body; // Expecting SP ID from client

        if (!phoneNumber || !serviceProviderId) {
            return NextResponse.json({ error: 'Phone number and Service Provider ID are required.' }, { status: 400 });
        }
        
        phoneNumber = formatPhoneNumber(phoneNumber);
        const spId = new Types.ObjectId(serviceProviderId); // Convert string ID to ObjectId

        // 1. Generate OTP and Expiration
        const otpCode = generateOtp();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // 2. Save/Update OTP in MongoDB
        await OtpModel.findOneAndUpdate(
            { serviceProviderId: spId }, // Find by the unique Service Provider ID
            { 
                code: otpCode, 
                expiresAt: expiresAt,
                phoneNumber: phoneNumber // Update phone number in case it changed
            },
            { 
                upsert: true, // Create if not exists
                new: true,
                setDefaultsOnInsert: true
            }
        );
        
        // 3. Prepare WhatsApp API Payload
        const payload = {
            messaging_product: "whatsapp",
            to: phoneNumber.replace('+', ''), 
            type: "template",
            template: {
                name: "verification_code", // Replace with your approved template name
                language: { code: "en" },
                components: [
                    {
                        type: "body",
                        parameters: [
                            { type: "text", text: otpCode }, 
                            { type: "text", text: String(OTP_EXPIRY_MINUTES) }
                        ]
                    }
                ]
            }
        };

        // 4. Send Message to WhatsApp Cloud API
        const response = await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('WhatsApp API Error:', data);
            await OtpModel.deleteOne({ serviceProviderId: spId }); // Clean up failed attempt
            return NextResponse.json({ error: 'Failed to send OTP via WhatsApp. Check logs for details.' }, { status: 500 });
        }
        
        return NextResponse.json({ message: `OTP sent successfully. Expires in ${OTP_EXPIRY_MINUTES} minutes.` });

    } catch (error) {
        console.error('Send OTP Handler Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}