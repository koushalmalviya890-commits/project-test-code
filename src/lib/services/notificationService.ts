import Notification, { INotification } from '@/models/Notification';
import { connectToDatabase } from '@/lib/mongodb';

export async function createBookingApprovedNotification(
  serviceProviderId: string,
  bookingId: string,
  facilityName: string,
  startupName: string,
  startDate: string,
  endDate: string,
  facilityType: string
) {
  await connectToDatabase();
  
  const title = 'New Booking Approved';
  const message = `${facilityName} was booked by ${startupName} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
  
  const notification = new Notification({
    userId: serviceProviderId,
    type: 'booking-approved',
    title,
    message,
    relatedId: bookingId,
    relatedType: 'booking',
    isRead: false,
    metadata: {
      facilityName,
      startupName,
      facilityType,
      startDate,
      endDate
    }
  });
  
  await notification.save();
  return notification;
}

export async function createFacilityApprovedNotification(
  serviceProviderId: string,
  facilityId: string,
  facilityName: string,
  facilityType: string
) {
  await connectToDatabase();
  
  const title = 'Facility Approved';
  const message = `${facilityName} is live and open for bookings.`;
  
  const notification = new Notification({
    userId: serviceProviderId,
    type: 'facility-approved',
    title,
    message,
    relatedId: facilityId,
    relatedType: 'facility',
    isRead: false,
    metadata: {
      facilityName,
      facilityType
    }
  });
  
  await notification.save();
  return notification;
}

export async function getUserNotifications(
  userId: string,
  options: { 
    limit?: number; 
    offset?: number; 
    unreadOnly?: boolean;
    type?: string | null;
    status?: string | null;
  } = {}
) {
  await connectToDatabase();
  
  const { limit = 10, offset = 0, unreadOnly = false, type = null, status = null } = options;
  
  const query: any = { userId };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  // Add type filter if specified
  if (type) {
    query.relatedType = type;
  }
  
  // Add status filter if specified (maps to notification type)
  if (status) {
    // Map status to the corresponding notification type
    // For example, if status is 'approved', we want notifications of type 'booking-approved'
    if (status === 'approved') {
      if (type === 'booking') {
        query.type = 'booking-approved';
      } else if (type === 'facility') {
        query.type = 'facility-approved';
      } else {
        // If no specific type is provided but status is 'approved'
        query.type = { $regex: '-approved$' };
      }
    }
    // Add more status mappings here as needed
  }
  
  const notifications = await Notification
    .find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
  
  return notifications;
}

export async function getUnreadNotificationCount(userId: string) {
  await connectToDatabase();
  
  const count = await Notification.countDocuments({
    userId,
    isRead: false
  });
  
  return count;
}

export async function markNotificationAsRead(notificationId: string) {
  await connectToDatabase();
  
  const result = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  
  return result;
}

export async function markAllNotificationsAsRead(userId: string) {
  await connectToDatabase();
  
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  
  return result.modifiedCount;
}

export async function deleteNotification(notificationId: string) {
  await connectToDatabase();
  
  await Notification.findByIdAndDelete(notificationId);
  return true;
}

export async function deleteAllNotifications(userId: string) {
  await connectToDatabase();
  
  const result = await Notification.deleteMany({ userId });
  return result.deletedCount;
} 