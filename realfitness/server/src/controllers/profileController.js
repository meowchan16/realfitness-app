import { defaultData } from "../defaultData.js";
import Profile from "../models/Profile.js";
import { requireCurrentUser } from "../services/authService.js";
import { buildUserBackupFileName, syncJsonBackupToGoogleDrive } from "../services/googleDriveService.js";

export async function getProfile(request, response) {
  const user = await requireCurrentUser(request);
  const profile = await Profile.findOne({ user: user._id }).lean();

  response.json({
    profile: profile ? serializeProfile(profile) : defaultData.profile
  });
}

export async function updateProfile(request, response) {
  const profileInput = request.body?.profile;

  if (!profileInput || typeof profileInput !== "object") {
    response.status(400).json({ message: "A valid profile object is required." });
    return;
  }

  const user = await requireCurrentUser(request);
  const profile = await Profile.findOneAndUpdate(
    { user: user._id },
    { ...defaultData.profile, ...profileInput },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  await syncJsonBackupToGoogleDrive({
    user,
    fileName: buildUserBackupFileName(user.email, "profile"),
    payload: {
      email: user.email,
      profile: serializeProfile(profile)
    }
  });

  response.json({
    profile: serializeProfile(profile)
  });
}

function serializeProfile(profile) {
  return {
    name: profile.name || "",
    age: profile.age || "",
    gender: profile.gender || "",
    heightCm: profile.heightCm || "",
    weightKg: profile.weightKg || "",
    goal: profile.goal || "",
    workoutStyle: profile.workoutStyle || "",
    daysPerWeek: profile.daysPerWeek || "",
    bio: profile.bio || "",
    profilePhotoDataUrl: profile.profilePhotoDataUrl || "",
    themePreference: profile.themePreference === "dark" ? "dark" : "light"
  };
}
