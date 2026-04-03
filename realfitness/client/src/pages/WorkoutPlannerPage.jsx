import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DayPill from "../components/DayPill";
import PageHeader from "../components/PageHeader";
import {
  defaultSchedule,
  getTodayName,
  loadSchedule,
  saveSchedule,
  weekDays
} from "../utils/workoutPlanner";

function WorkoutPlannerPage() {
  const todayName = useMemo(() => getTodayName(), []);
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [workoutTitle, setWorkoutTitle] = useState(defaultSchedule[todayName].title);
  const [tasks, setTasks] = useState(defaultSchedule[todayName].tasks);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "RealFitness Workout Planner";
  }, []);

  useEffect(() => {
    async function fetchSchedule() {
      const nextSchedule = await loadSchedule();
      setSchedule(nextSchedule);
    }

    fetchSchedule();
  }, []);

  useEffect(() => {
    const daySchedule = schedule[selectedDay];
    setWorkoutTitle(daySchedule?.title || "");
    setTasks(daySchedule?.tasks?.length ? daySchedule.tasks : [""]);
  }, [schedule, selectedDay]);

  const handleTaskChange = (index, value) => {
    setSaveMessage("");
    setTasks((currentTasks) =>
      currentTasks.map((task, currentIndex) => (currentIndex === index ? value : task))
    );
  };

  const handleAddTask = () => {
    setSaveMessage("");
    setTasks((currentTasks) => [...currentTasks, ""]);
  };

  const handleRemoveTask = (index) => {
    setSaveMessage("");
    setTasks((currentTasks) => {
      const updated = currentTasks.filter((_, currentIndex) => currentIndex !== index);
      return updated.length ? updated : [""];
    });
  };

  const handleSaveDay = async () => {
    setIsSaving(true);
    setSaveMessage("");
    const cleanedTasks = tasks.map((task) => task.trim()).filter(Boolean);
    const updatedSchedule = {
      ...schedule,
      [selectedDay]: {
        title: workoutTitle.trim() || `${selectedDay} Workout`,
        tasks: cleanedTasks.length ? cleanedTasks : ["Add your first task"]
      }
    };

    try {
      setSchedule(updatedSchedule);
      await saveSchedule(updatedSchedule);
      setSaveMessage(`${selectedDay} plan saved.`);
    } catch (_error) {
      setSaveMessage("Could not save your planner changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const todaysWorkout = schedule[todayName];

  return (
    <section className="planner-shell">
      <PageHeader
        eyebrow="Weekly Planner"
        title="Create your day-by-day workout plan once and edit it any time."
        description="Pick a day, update the workout name, save the task list, and let the app switch automatically when the date changes."
        actionLabel="Go To Main Page"
        actionTo="/dashboard"
        actionClassName="secondary-link"
      />

      <div className="planner-layout">
        <section className="planner-summary-card">
          <span className="feature-label">Today&apos;s Workout</span>
          <h3>
            {todayName}: {todaysWorkout.title}
          </h3>
          <p className="section-copy">This summary updates from your saved weekly planner.</p>
          <ul className="snapshot-list">
            {todaysWorkout.tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </section>

        <div className="planner-card">
          <div className="day-pill-row">
            {weekDays.map((day) => (
              <DayPill
                key={day}
                day={day}
                isActive={selectedDay === day}
                isToday={todayName === day}
                onClick={() => setSelectedDay(day)}
              />
            ))}
          </div>

          <div className="planner-form-card">
            <label className="planner-label" htmlFor="workout-title">
              Workout name for {selectedDay}
            </label>
            <input
              id="workout-title"
              className="planner-input"
              type="text"
              value={workoutTitle}
              onChange={(event) => {
                setWorkoutTitle(event.target.value);
                setSaveMessage("");
              }}
              placeholder="Example: Friday Legs"
            />

            <div className="planner-task-header">
              <p className="planner-label">Tasks / Exercises</p>
              <button className="ghost-button" type="button" onClick={handleAddTask}>
                Add task
              </button>
            </div>

            <div className="task-stack">
              {tasks.map((task, index) => (
                <div className="task-row" key={`${selectedDay}-${index}`}>
                  <input
                    className="planner-input"
                    type="text"
                    value={task}
                    onChange={(event) => handleTaskChange(index, event.target.value)}
                    placeholder="Example: 50 squats"
                  />
                  <button
                    className="task-remove"
                    type="button"
                    onClick={() => handleRemoveTask(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="planner-actions">
            <button className="primary-cta" type="button" onClick={handleSaveDay} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Day"}
            </button>
            <button
              className="secondary-link"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Go To Main Page
            </button>
          </div>
          {saveMessage ? <p className="save-message save-message--visible">{saveMessage}</p> : null}

          <div className="planner-saved-grid">
            {weekDays.map((day) => (
              <article
                className={`saved-day-card ${selectedDay === day ? "saved-day-card--active" : ""}`}
                key={day}
              >
                <span className="feature-label">{day}</span>
                <strong>{schedule[day].title}</strong>
                <p>{schedule[day].tasks.join(" • ")}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkoutPlannerPage;
