// models/facilitystartups.js or .ts
import mongoose from 'mongoose';

const FacilityStartupsSchema = new mongoose.Schema({
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Startup'
  },
  incubatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'FacilityStartups' // <-- force exact collection name
});

export default mongoose.models.FacilityStartups ||
  mongoose.model('FacilityStartups', FacilityStartupsSchema);
