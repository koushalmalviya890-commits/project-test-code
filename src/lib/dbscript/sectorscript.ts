import 'dotenv/config';
import mongoose from 'mongoose';

const SECTORS = [
  "Agri Tech", "Bio Tech", "Aerospace and Defence Tech", "Artificial Intelligence",
  "Machine Learning", "Food Tech", "SaaS", "IoT - Internet of Things", "Blue Economy",
  "Marine Tech", "Aquaculture", "Automotive", "Electric Vehicles", "Mobility", "Ed Tech",
  "Fem Tech", "Fin Tech", "Data and Analytics", "Deep Tech", "Circular Economy", "Energy",
  "Climate Tech", "Sustainability", "SDG and ESG", "Insure Tech", "Prop Tech", "D2C",
  "E Commerce", "Art and Culture", "Livelihood", "Manufacturing", "Healthcare",
  "Life Sciences", "Chemicals", "Retail Tech", "Fashion Tech", "Textiles", "Social Impact",
  "Sports Tech", "Travel", "Tourism", "Logistics", "Networking", "Web 3.0", "Industry 5.0",
  "Gaming", "AR, VR", "Others"
];

const sectorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Sector = mongoose.models.Sector || mongoose.model("Sector", sectorSchema);

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("Missing MONGODB_URI in .env.local");

    await mongoose.connect(mongoUri);
   // console.log("✅ Connected to DB");

    await Sector.deleteMany({});
    await Sector.insertMany(SECTORS.map((name) => ({ name })));

   // console.log("✅ Sectors seeded");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding sectors:", err);
    await mongoose.disconnect();
  }
}

seed();
