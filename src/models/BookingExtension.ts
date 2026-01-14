// models/BookingExtension.ts
import mongoose, { Schema, model, models } from 'mongoose'

export interface IBookingExtension extends mongoose.Document {
  bookingId: string
  startupId: string
  incubatorId: string
  facilityId: string
  userId: string
  extentDays: number
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: Date
  processedAt?: Date
  serviceProviderNotes?: string
  newEndDate?: Date
  createdAt: Date
  updatedAt: Date
}

const BookingExtensionSchema = new Schema<IBookingExtension>(
  {
    bookingId: { type: String, required: true, index: true },
    startupId: { type: String, required: true, index: true },
    incubatorId: { type: String, required: true, index: true },
    facilityId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    extentDays: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    requestedAt: { type: Date, required: true, default: Date.now },
    processedAt: { type: Date },
    serviceProviderNotes: { type: String, trim: true },
    newEndDate: { type: Date }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

// ✅ Force schema refresh in dev (important!)
// if (process.env.NODE_ENV === 'development') {
//   mongoose.deleteModel?.('BookingExtension')
// }

export const BookingExtension =
  models.BookingExtension || model<IBookingExtension>('BookingExtension', BookingExtensionSchema)
