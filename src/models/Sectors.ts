// src/models/Sectors.ts
import mongoose from "mongoose";

const sectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Sector =
  mongoose.models.Sector || mongoose.model("Sector", sectorSchema);
