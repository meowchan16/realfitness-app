import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    authProvider: {
      type: String,
      default: "local"
    },
    googleId: {
      type: String,
      default: ""
    },
    googleAccessToken: {
      type: String,
      default: ""
    },
    googleRefreshToken: {
      type: String,
      default: ""
    },
    googleTokenExpiryDate: {
      type: Number,
      default: 0
    },
    googleDriveFolderId: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;
