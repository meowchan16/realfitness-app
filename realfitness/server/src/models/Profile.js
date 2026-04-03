import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    name: String,
    age: String,
    gender: String,
    heightCm: String,
    weightKg: String,
    goal: String,
    workoutStyle: String,
    daysPerWeek: String,
    bio: String,
    profilePhotoDataUrl: {
      type: String,
      default: ""
    },
    themePreference: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    }
  },
  {
    timestamps: true
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
