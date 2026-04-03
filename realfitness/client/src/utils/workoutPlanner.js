import { getRequest, putRequest } from "./api";

export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const defaultSchedule = {
  Monday: {
    title: "Chest Day",
    tasks: ["20 push-ups", "Bench press", "Incline dumbbell press"]
  },
  Tuesday: {
    title: "Back Day",
    tasks: ["Lat pulldown", "Seated row", "Deadlift practice"]
  },
  Wednesday: {
    title: "Recovery",
    tasks: ["Stretching", "Light walk", "Hydration focus"]
  },
  Thursday: {
    title: "Arms Day",
    tasks: ["Bicep curls", "Tricep dips", "Hammer curls"]
  },
  Friday: {
    title: "Leg Day",
    tasks: ["50 squats", "Leg press", "Walking lunges"]
  },
  Saturday: {
    title: "Core + Cardio",
    tasks: ["Plank holds", "Mountain climbers", "20 min treadmill"]
  },
  Sunday: {
    title: "Rest Day",
    tasks: ["Mobility work", "Meal prep", "Progress photo check"]
  }
};

export function getTodayName() {
  const todayIndex = new Date().getDay();
  const mappedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  return weekDays[mappedIndex];
}

export function getTodayDateKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

export async function loadSchedule() {
  try {
    const response = await getRequest("/workouts/schedule");
    return response.schedule;
  } catch (_error) {
    return defaultSchedule;
  }
}

export async function saveSchedule(schedule) {
  const response = await putRequest("/workouts/schedule", { schedule });
  return response.schedule;
}

export async function loadTaskCompletions() {
  try {
    const response = await getRequest("/workouts/completions");
    return response.completionsByDate;
  } catch (_error) {
    return {};
  }
}

export async function saveTaskCompletions(date, completionsByTask) {
  const response = await putRequest(`/workouts/completions/${date}`, { completionsByTask });
  return response.completionsByTask;
}
