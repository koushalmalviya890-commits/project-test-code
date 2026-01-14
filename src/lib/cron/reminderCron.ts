// src/lib/cron/reminderCron.ts
import 'dotenv/config';
import cron from 'node-cron';
import { checkAndSendReminders } from '@/lib/reminders';

cron.schedule('52 10 * * *', async () => {
 // console.log('⏰ Running reminder at 10:52 AM');
  await checkAndSendReminders();
});
