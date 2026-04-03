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

export const defaultData = {
  auth: {
    providers: ["email", "google"],
    currentUser: null
  },
  profile: {
    name: "Saarasuman",
    age: "21",
    gender: "Prefer not to say",
    heightCm: "170",
    weightKg: "72",
    goal: "Build Muscle",
    workoutStyle: "Gym Training",
    daysPerWeek: "5",
    bio: "Focused on building a consistent workout routine and tracking progress clearly.",
    profilePhotoDataUrl: "",
    themePreference: "light"
  },
  workouts: {
    schedule: defaultSchedule,
    completionsByDate: {}
  },
  progress: {
    entriesByDate: {}
  }
};
