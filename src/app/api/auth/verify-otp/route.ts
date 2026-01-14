// app/api/auth/verify-otp/route.ts
import { NextResponse } from 'next/server';
import OtpModel from '@/models/Otp'; 
import ServiceProviderModel from '@/models/ServiceProvider'; // ⭐️ Import your SP model
  import connectDB from '@/lib/db'
import { Types } from 'mongoose';

export async function POST(request: Request) {
    await connectDB();

    try {
        const body = await request.json();
        let { phoneNumber, otp, serviceProviderId } = body; // Expecting SP ID from client

        if (!phoneNumber || !otp || !serviceProviderId) {
            return NextResponse.json({ error: 'Phone number, OTP, and Service Provider ID are required.' }, { status: 400 });
        }
        
        // Ensure the phone number format matches the one saved in DB
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = `+91${phoneNumber}`; 
        }
        const spId = new Types.ObjectId(serviceProviderId); // Convert string ID to ObjectId

        // 1. Find the OTP record in MongoDB, using both phone number and ID
        const storedOtp = await OtpModel.findOne({ 
          phoneNumber: phoneNumber, 
          serviceProviderId: spId 
        });

        if (!storedOtp) {
            return NextResponse.json({ error: 'No verification code found or mismatch with account.' }, { status: 401 });
        }

        // 2. Check for Expiration
        if (storedOtp.expiresAt < new Date()) {
            await OtpModel.deleteOne({ _id: storedOtp._id }); // Delete expired OTP
            return NextResponse.json({ error: 'OTP has expired. Please request a new code.' }, { status: 401 });
        }

        // 3. Check for Code Match
        if (storedOtp.code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP.' }, { status: 401 });
        }
        
        // 4. Success: Delete the OTP record and UPDATE SERVICE PROVIDER
        
        // A. Delete the OTP record
        await OtpModel.deleteOne({ _id: storedOtp._id }); 

        // B. Mark the phone number as verified in the Service Provider schema
        await ServiceProviderModel.updateOne(
            { _id: spId },
            { $set: { 
                isPhoneVerified: true 
            } } 
        );
        
        return NextResponse.json({ message: 'Phone number verified successfully.', isVerified: true });

    } catch (error) {
        console.error('Verify OTP Handler Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}