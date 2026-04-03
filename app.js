const STORAGE_KEY = "forgefit-tracker-data-v3";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

const state = loadState();

const workoutForm = document.getElementById("workoutForm");
const plannerForm = document.getElementById("plannerForm");
const metricsForm = document.getElementById("metricsForm");
const historyList = document.getElementById("historyList");
const clearButton = document.getElementById("clearButton");
const demoButton = document.getElementById("demoButton");
const installButton = document.getElementById("installButton");
const exportButton = document.getElementById("exportButton");
const backupStatus = document.getElementById("backupStatus");
const historyTemplate = document.getElementById("historyItemTemplate");

let deferredPrompt = null;

render();
registerEvents();
registerServiceWorker();

function createInitialState() {
  return {
    workouts: [],
    plan: {
      Sun: "Rest",
      Mon: "Rest",
      Tue: "Rest",
      Wed: "Rest",
      Thu: "Rest",
      Fri: "Rest",
      Sat: "Rest",
    },
    metrics: {
      weight: "",
      height: "",
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialState();
    }

    const parsed = JSON.parse(raw);
    return {
      workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
      plan: {
        Sun: parsed.plan?.Sun || "Rest",
        Mon: parsed.plan?.Mon || "Rest",
        Tue: parsed.plan?.Tue || "Rest",
        Wed: parsed.plan?.Wed || "Rest",
        Thu: parsed.plan?.Thu || "Rest",
        Fri: parsed.plan?.Fri || "Rest",
        Sat: parsed.plan?.Sat || "Rest",
      },
      metrics: {
        weight: parsed.metrics?.weight ?? "",
        height: parsed.metrics?.height ?? "",
      },
    };
  } catch {
    return createInitialState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function registerEvents() {
  workoutForm.addEventListener("submit", handleWorkoutSubmit);
  plannerForm.addEventListener("submit", handlePlannerSubmit);
  metricsForm.addEventListener("submit", handleMetricsSubmit);
  document.getElementById("workoutDate").addEventListener("change", syncTodayPlannedWorkout);
  clearButton.addEventListener("click", clearData);
  demoButton.addEventListener("click", loadDemoData);
  exportButton.addEventListener("click", exportData);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  });
}

function handlePlannerSubmit(event) {
  event.preventDefault();

  DAYS.forEach((day) => {
    state.plan[day] = document.querySelector(`[data-day="${day}"]`).value;
  });

  saveState();
  render();
  backupStatus.textContent = "Weekly workout plan saved.";
}

function handleWorkoutSubmit(event) {
  event.preventDefault();

  const formData = new FormData(workoutForm);
  const workoutDate = formData.get("workoutDate").toString();
  const dayKey = DAYS[new Date(workoutDate).getDay()];
  const plannedWorkout = state.plan[dayKey] || "Rest";

  const workout = {
    id: makeId(),
    date: workoutDate,
    plannedWorkout,
    actualWorkout: formData.get("workoutName").toString().trim(),
    duration: Number(formData.get("duration")),
    notes: formData.get("notes").toString().trim(),
    createdAt: new Date(`${workoutDate}T18:00:00`).toISOString(),
  };

  state.workouts.unshift(workout);
  saveState();
  workoutForm.reset();
  document.getElementById("workoutDate").value = formatDateInput(new Date());
  document.getElementById("duration").value = 60;
  syncTodayPlannedWorkout();
  render();
  backupStatus.textContent =
    "Workout saved locally. You can export it below and later connect it to Google Drive.";
}

function handleMetricsSubmit(event) {
  event.preventDefault();

  const formData = new FormData(metricsForm);
  state.metrics.weight = formData.get("weight").toString().trim();
  state.metrics.height = formData.get("height").toString().trim();

  saveState();
  render();
}

function exportData() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `forgefit-drive-backup-${formatDateInput(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
  backupStatus.textContent =
    "Workout data exported as JSON. This file is ready for future Google Drive backup.";
}

function clearData() {
  const confirmed = window.confirm(
    "Clear your weekly plan, workout logs, and health details from this device?",
  );

  if (!confirmed) {
    return;
  }

  const fresh = createInitialState();
  state.workouts = fresh.workouts;
  state.plan = fresh.plan;
  state.metrics = fresh.metrics;
  saveState();
  render();
  backupStatus.textContent = "All local data cleared.";
}

function loadDemoData() {
  state.plan = {
    Sun: "Rest",
    Mon: "Chest",
    Tue: "Legs",
    Wed: "Back",
    Thu: "Shoulders",
    Fri: "Arms",
    Sat: "Cardio",
  };

  state.metrics = {
    weight: "72.4",
    height: "172",
  };

  state.workouts = [
    {
      id: makeId(),
      date: formatDateInput(new Date()),
      plannedWorkout: state.plan[DAYS[new Date().getDay()]],
      actualWorkout: state.plan[DAYS[new Date().getDay()]],
      duration: 70,
      notes: "Strong session with good energy today.",
      createdAt: new Date().toISOString(),
    },
    {
      id: makeId(),
      date: formatDateInput(offsetDateObject(1)),
      plannedWorkout: "Legs",
      actualWorkout: "Legs",
      duration: 82,
      notes: "Squats, lunges, RDLs, calves.",
      createdAt: offsetDateObject(1).toISOString(),
    },
    {
      id: makeId(),
      date: formatDateInput(offsetDateObject(3)),
      plannedWorkout: "Back",
      actualWorkout: "Back",
      duration: 68,
      notes: "Rows, pulldowns, curls.",
      createdAt: offsetDateObject(3).toISOString(),
    },
  ];

  saveState();
  render();
  backupStatus.textContent = "Demo plan and logs loaded.";
}

function render() {
  syncPlannerForm();
  syncMetricsForm();
  syncWorkoutForm();

  const today = new Date();
  const todayKey = DAYS[today.getDay()];
  const todayLabel = DAY_LABELS[todayKey];
  const plannedWorkout = state.plan[todayKey] || "Rest";
  const todayLog = findWorkoutByDate(formatDateInput(today));
  const stats = buildStats();

  document.getElementById("todayHeading").textContent = `Today is ${todayLabel}.`;
  document.getElementById("todayPlanText").textContent =
    plannedWorkout === "Rest"
      ? "Today is a rest or recovery day. You can still log anything extra you choose to do."
      : `Your planned workout for today is ${plannedWorkout}. Scroll down to log what you actually did.`;
  document.getElementById("todayWorkoutBadge").textContent = plannedWorkout;
  document.getElementById("todayCompletionBadge").textContent = todayLog
    ? todayLog.actualWorkout
    : "No log yet";
  document.getElementById("driveSummaryBadge").textContent = state.workouts.length
    ? `${state.workouts.length} logs ready`
    : "No logs yet";
  document.getElementById("currentDayCard").textContent = todayLabel;
  document.getElementById("plannedFocusCard").textContent = plannedWorkout;
  document.getElementById("totalWorkouts").textContent = String(stats.totalWorkouts);
  document.getElementById("currentStreak").textContent = `${stats.streak} days`;
  document.getElementById("coachNote").textContent = buildCoachNote(plannedWorkout, todayLog);
  document.getElementById("weightValue").textContent = state.metrics.weight
    ? `${state.metrics.weight} kg`
    : "-";
  document.getElementById("heightValue").textContent = state.metrics.height
    ? `${state.metrics.height} cm`
    : "-";
  document.getElementById("bmiPreview").textContent = computeBmiText();

  renderPlanOverview();
  renderHistory();
}

function syncPlannerForm() {
  DAYS.forEach((day) => {
    document.querySelector(`[data-day="${day}"]`).value = state.plan[day] || "Rest";
  });
}

function syncMetricsForm() {
  document.getElementById("weight").value = state.metrics.weight;
  document.getElementById("height").value = state.metrics.height;
}

function syncWorkoutForm() {
  document.getElementById("workoutDate").value = formatDateInput(new Date());
  syncTodayPlannedWorkout();
}

function syncTodayPlannedWorkout() {
  const input = document.getElementById("workoutDate");
  const selectedDate = input.value ? new Date(input.value) : new Date();
  const dayKey = DAYS[selectedDate.getDay()];
  document.getElementById("plannedWorkout").value = state.plan[dayKey] || "Rest";
}

function renderPlanOverview() {
  const container = document.getElementById("planOverview");
  container.innerHTML = "";

  DAYS.forEach((day) => {
    const card = document.createElement("article");
    card.className = "overview-card";
    card.innerHTML = `
      <span>${DAY_LABELS[day]}</span>
      <strong>${state.plan[day]}</strong>
    `;
    container.appendChild(card);
  });
}

function renderHistory() {
  historyList.innerHTML = "";

  if (!state.workouts.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      "No workout logged yet. Save what you did today and it will appear here.";
    historyList.appendChild(empty);
    return;
  }

  state.workouts.slice(0, 8).forEach((workout) => {
    const node = historyTemplate.content.cloneNode(true);
    node.querySelector("h3").textContent = workout.actualWorkout;
    node.querySelector(".history-date").textContent = formatDisplayDate(workout.createdAt);
    node.querySelector(".history-meta").textContent =
      `Planned: ${workout.plannedWorkout} • ${workout.duration} min`;
    node.querySelector(".history-notes").textContent =
      workout.notes || "No notes added for this workout.";
    historyList.appendChild(node);
  });
}

function buildStats() {
  const workouts = [...state.workouts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const workoutDays = new Set(workouts.map((workout) => formatDateKey(new Date(workout.createdAt))));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const cursor = new Date(today);
  while (workoutDays.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    totalWorkouts: workouts.length,
    streak,
  };
}

function buildCoachNote(plannedWorkout, todayLog) {
  if (todayLog) {
    return `Nice work. You planned ${plannedWorkout} and logged ${todayLog.actualWorkout} today.`;
  }

  if (plannedWorkout === "Rest") {
    return "Today is marked as rest. If you do recovery, stretching, or cardio, you can still log it below.";
  }

  return `Your plan says ${plannedWorkout} today. Scroll down and log the workout after you finish.`;
}

function findWorkoutByDate(dateString) {
  return state.workouts.find((workout) => workout.date === dateString);
}

function computeBmiText() {
  const weight = Number(state.metrics.weight);
  const heightCm = Number(state.metrics.height);

  if (!weight || !heightCm) {
    return "-";
  }

  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  return bmi.toFixed(1);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateInput(date) {
  return formatDateKey(date);
}

function formatDisplayDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function makeId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function offsetDateObject(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(18, 30, 0, 0);
  return date;
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("sw.js");
  } catch (error) {
    console.error("Service worker registration failed", error);
  }
}
