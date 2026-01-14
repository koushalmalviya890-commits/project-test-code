// models/Otp.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Define the interface for the OTP document
export interface IOtp extends Document {
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  serviceProviderId: Types.ObjectId; // ⭐️ REQUIRED: Link to the ServiceProvider
  createdAt: Date; 
}

const OtpSchema: Schema<IOtp> = new Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    // Note: Use a 6-digit OTP for better security
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  // ⭐️ Foreign Key to the ServiceProvider collection
  serviceProviderId: {
    type: Schema.Types.ObjectId,
    ref: 'Service Provider', 
    required: true, 
    unique: true, // Ensures only one active OTP per SP document
  },
}, {
  timestamps: true,
});

// Index for efficient lookup during verification
OtpSchema.index({ serviceProviderId: 1, phoneNumber: 1 }); 

const OtpModel: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);

export default OtpModel;