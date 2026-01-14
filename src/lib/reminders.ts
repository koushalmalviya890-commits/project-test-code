import { connectToDatabase } from '@/lib/mongodb';
import { sendReminderEmailToStartup } from '@/lib/email';
import { ObjectId } from 'mongodb';
import dayjs from 'dayjs';

export async function checkAndSendReminders() {
  const { db } = await connectToDatabase();
  const today = dayjs().startOf('day');
  const reminderWindow = today.add(3, 'days'); // Send reminders 3 days before endDate

 // console.log(`🔍 Checking bookings expiring between ${today.format()} and ${reminderWindow.format()}`);

  const bookings = await db.collection('bookings').find({
    paymentStatus: 'completed',
    endDate: {
      $gte: today.toDate(),
      $lte: reminderWindow.toDate()
    }
  }).toArray();

  for (const booking of bookings) {
    const startup = await db.collection('Startups').findOne({
      userId: new ObjectId(booking.startupId)
    });

    if (!startup || !startup.startupMailId) {
      console.warn(`⚠️ Skipping booking ${booking._id} — startup or email not found.`);
      continue;
    }

    const alreadyNotified = await db.collection('notifications').findOne({
      userId: booking.startupId.toString(),
      relatedId: booking._id.toString(),
      type: 'plan-expiry-reminder'
    });

    if (alreadyNotified) {
     // console.log(`ℹ️ Already notified booking ${booking._id}`);
      continue;
    }

    try {
      await sendReminderEmailToStartup({
        to: startup.startupMailId,
        startupName: startup.startupName || 'Your Startup',
        facilityName: booking.facilityName || 'Your Facility',
        rentalPlan: booking.rentalPlan || 'N/A',
        endDate: booking.endDate,
      });

     // console.log(`✅ Sent reminder to ${startup.startupMailId} for booking ${booking._id}`);

      await db.collection('notifications').insertOne({
        userId: booking.startupId.toString(),
        type: 'plan-expiry-reminder',
        title: 'Rental Plan Expiry Reminder',
        message: `Your rental plan (${booking.rentalPlan}) will end on ${dayjs(booking.endDate).format('YYYY-MM-DD')}`,
        relatedId: booking._id.toString(),
        relatedType: 'booking',
        isRead: false,
        createdAt: new Date(),
        metadata: {
          startupName: startup.startupName,
          facilityName: booking.facilityName,
          rentalPlan: booking.rentalPlan,
          endDate: booking.endDate,
        }
      });
    } catch (err) {
      console.error(`❌ Failed to send email for booking ${booking._id}`, err);
    }
  }

 // console.log('🎉 Reminder check completed.');
}
