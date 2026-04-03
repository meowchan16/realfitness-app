import { defaultData } from "../defaultData.js";
import { DEMO_USER_EMAIL } from "../constants/demoUser.js";
import DailyProgressEntry from "../models/DailyProgressEntry.js";
import Photo from "../models/Photo.js";
import Profile from "../models/Profile.js";
import TaskCompletion from "../models/TaskCompletion.js";
import User from "../models/User.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import { readStore } from "../store.js";

function profileFromSource(source) {
  return {
    ...defaultData.profile,
    ...(source || {})
  };
}

export async function getDemoUser() {
  let user = await User.findOne({ email: DEMO_USER_EMAIL });

  if (!user) {
    user = await User.create({
      email: DEMO_USER_EMAIL,
      name: defaultData.profile.name,
      authProvider: "demo"
    });
  }

  return user;
}

export async function bootstrapDemoData() {
  const user = await getDemoUser();
  const legacyStore = await readStore();

  await Profile.findOneAndUpdate(
    { user: user._id },
    profileFromSource(legacyStore.profile),
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await WorkoutPlan.findOneAndUpdate(
    { user: user._id },
    { schedule: legacyStore.workouts?.schedule || defaultData.workouts.schedule },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const completionEntries = Object.entries(legacyStore.workouts?.completionsByDate || {});
  for (const [date, completionsByTask] of completionEntries) {
    await TaskCompletion.findOneAndUpdate(
      { user: user._id, date },
      { completionsByTask },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  const progressEntries = Object.entries(legacyStore.progress?.entriesByDate || {});
  for (const [date, entry] of progressEntries) {
    const progressDoc = await DailyProgressEntry.findOneAndUpdate(
      { user: user._id, date },
      entry,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (entry.photoDataUrl) {
      await Photo.findOneAndUpdate(
        { user: user._id, date },
        {
          date,
          title: entry.title || "Daily photo",
          notes: entry.notes || "",
          meals: entry.meals || "",
          photoDataUrl: entry.photoDataUrl,
          photoName: entry.photoName || "photo",
          progressEntry: progressDoc._id
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }
  }

  return user;
}
