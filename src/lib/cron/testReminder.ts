// src/lib/cron/testReminder.ts
import 'dotenv/config';
import { checkAndSendReminders } from '@/lib/reminders';

checkAndSendReminders()
  .then(() => {
   // console.log('✅ Manual reminder test completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error running manual reminder:', err);
    process.exit(1);
  });
