import mongoose from "mongoose";

const AffiliateLinkUsersSchema = new mongoose.Schema({
  mailId: {
    type: String,
    required: true,
  },
    contactNumber: {
    type: String,
    required: true,
  },
  contactName: {
    type: String,
    required: true,
  },
  affiliateId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const AffiliateLinkUsers = mongoose.models.AffiliateLinkUsers || mongoose.model("AffiliateLinkUsers", AffiliateLinkUsersSchema);
