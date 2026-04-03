import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
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
    notes: {
      type: String,
      default: ""
    },
    meals: {
      type: String,
      default: ""
    },
    photoDataUrl: {
      type: String,
      required: true
    },
    photoName: {
      type: String,
      default: "photo"
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
    },
    progressEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyProgressEntry",
      default: null
    }
  },
  {
    timestamps: true
  }
);

photoSchema.index({ user: 1, date: 1 });

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;
