import mongoose, { Schema } from 'mongoose';

export interface INotification {
  _id: string;
  userId: string;
  type: 'booking-approved' | 'facility-approved';
  title: string;
  message: string;
  relatedId: string;
  relatedType: 'booking' | 'facility';
  isRead: boolean;
  createdAt: Date;
  metadata?: {
    facilityName?: string;
    startupName?: string;
    facilityType?: string; 
    startDate?: string;  
    endDate?: string;
    [key: string]: any;
  };
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { 
      type: String, 
      required: true, 
      index: true 
    },
    type: { 
      type: String, 
      required: true, 
      enum: ['booking-approved', 'facility-approved']
    },
    title: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    relatedId: { 
      type: String, 
      required: true 
    },
    relatedType: { 
      type: String, 
      required: true, 
      enum: ['booking', 'facility']
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    createdAt: { 
      type: Date, 
      default: Date.now
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// Create TTL index to auto-delete notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification; 