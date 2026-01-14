import 'dotenv/config';
import { connectToDatabase } from '@/lib/mongodb';

(async () => {
  try {
    await connectToDatabase();
   // console.log("✅ MongoDB connection test successful");
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
})();
