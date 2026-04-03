import mongoose from "mongoose";

const dailyProgressEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ""
    },
    workout: {
      type: String,
      default: ""
    },
    completedTasks: {
      type: [String],
      default: []
    },
    meals: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    },
    photoDataUrl: {
      type: String,
      default: ""
    },
    photoName: {
      type: String,
      default: ""
    },
    driveFileId: {
      type: String,
      default: ""
    },
    driveFileUrl: {
      type: String,
      default: ""
    },
    driveSyncStatus: {
      type: String,
      default: "not_configured"
    },
    driveSyncError: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

dailyProgressEntrySchema.index({ user: 1, date: 1 }, { unique: true });

const DailyProgressEntry = mongoose.model("DailyProgressEntry", dailyProgressEntrySchema);

export default DailyProgressEntry;
