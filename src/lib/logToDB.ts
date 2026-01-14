import { Db } from "mongodb";

export async function logToDB(
  db: Db,
  level: "info" | "error" | "warn" | "debug",
  message: string,
  meta: any = {}
) {
  try {
    const collection = db.collection("logs");
    await collection.insertOne({
      level,
      message,
      meta,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Failed to write log to DB", error);
  }
}
