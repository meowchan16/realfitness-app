import { defaultData } from "../defaultData.js";
import TaskCompletion from "../models/TaskCompletion.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import { requireCurrentUser } from "../services/authService.js";
import { buildUserBackupFileName, syncJsonBackupToGoogleDrive } from "../services/googleDriveService.js";

function getTodayName() {
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return weekDays[new Date().getDay()];
}

function getTodayDateKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

export async function getSchedule(request, response) {
  const user = await requireCurrentUser(request);
  const workoutPlan = await WorkoutPlan.findOne({ user: user._id }).lean();

  response.json({
    schedule: workoutPlan?.schedule || defaultData.workouts.schedule
  });
}

export async function updateSchedule(request, response) {
  const nextSchedule = request.body?.schedule;

  if (!nextSchedule || typeof nextSchedule !== "object") {
    response.status(400).json({ message: "A valid schedule object is required." });
    return;
  }

  const user = await requireCurrentUser(request);
  const workoutPlan = await WorkoutPlan.findOneAndUpdate(
    { user: user._id },
    { schedule: nextSchedule },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  await syncJsonBackupToGoogleDrive({
    user,
    fileName: buildUserBackupFileName(user.email, "schedule"),
    payload: {
      email: user.email,
      schedule: workoutPlan.schedule
    }
  });

  response.json({
    schedule: workoutPlan.schedule
  });
}

export async function getCompletions(request, response) {
  const user = await requireCurrentUser(request);
  const completions = await TaskCompletion.find({ user: user._id }).lean();

  const completionsByDate = completions.reduce((accumulator, item) => {
    accumulator[item.date] = item.completionsByTask || {};
    return accumulator;
  }, {});

  response.json({
    completionsByDate
  });
}

export async function updateCompletions(request, response) {
  const { date } = request.params;
  const completionsByTask = request.body?.completionsByTask;

  if (!completionsByTask || typeof completionsByTask !== "object") {
    response.status(400).json({ message: "A valid completionsByTask object is required." });
    return;
  }

  const user = await requireCurrentUser(request);
  const completion = await TaskCompletion.findOneAndUpdate(
    { user: user._id, date },
    { completionsByTask },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  await syncJsonBackupToGoogleDrive({
    user,
    fileName: buildUserBackupFileName(user.email, `completions-${date}`),
    payload: {
      email: user.email,
      date,
      completionsByTask: completion.completionsByTask || {}
    }
  });

  response.json({
    date,
    completionsByTask: completion.completionsByTask || {}
  });
}

export async function getTodayWorkout(request, response) {
  const user = await requireCurrentUser(request);
  const todayName = getTodayName();
  const date = getTodayDateKey();
  const [workoutPlan, completion] = await Promise.all([
    WorkoutPlan.findOne({ user: user._id }).lean(),
    TaskCompletion.findOne({ user: user._id, date }).lean()
  ]);

  response.json({
    day: todayName,
    date,
    workout: workoutPlan?.schedule?.[todayName] || defaultData.workouts.schedule[todayName],
    completionsByTask: completion?.completionsByTask || {}
  });
}
