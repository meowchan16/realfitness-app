import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { upsertDailyEntry } from "../utils/dailyProgress";
import {
  defaultSchedule,
  getTodayDateKey,
  getTodayName,
  loadSchedule,
  loadTaskCompletions,
  saveTaskCompletions
} from "../utils/workoutPlanner";

function TodaysWorkoutPage() {
  const todayName = useMemo(() => getTodayName(), []);
  const todayDateKey = useMemo(() => getTodayDateKey(), []);
  const [schedule, setSchedule] = useState(defaultSchedule);
  const todaysWorkout = schedule[todayName];
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    document.title = "RealFitness Today's Workout";
  }, []);

  useEffect(() => {
    async function fetchWorkoutData() {
      const [nextSchedule, allCompletions] = await Promise.all([loadSchedule(), loadTaskCompletions()]);
      setSchedule(nextSchedule);
      setCompletedTasks(allCompletions[todayDateKey] || {});
    }

    fetchWorkoutData();
  }, [todayDateKey]);

  const completedCount = todaysWorkout.tasks.filter((task) => completedTasks[task]).length;

  const syncDailyProgress = async (taskState) => {
    const finishedTasks = todaysWorkout.tasks.filter((task) => taskState[task]);

    await upsertDailyEntry(todayDateKey, {
      title: finishedTasks.length ? `${todaysWorkout.title} progress` : "Daily update",
      workout: finishedTasks.length
        ? `${todaysWorkout.title}: ${finishedTasks.join(", ")}`
        : todaysWorkout.title,
      completedTasks: finishedTasks
    });
  };

  const handleToggleTask = async (task) => {
    const nextTasks = {
      ...completedTasks,
      [task]: !completedTasks[task]
    };

    setCompletedTasks(nextTasks);
    await saveTaskCompletions(todayDateKey, nextTasks);
    await syncDailyProgress(nextTasks);
  };

  return (
    <section className="simple-page-shell">
      <div className="simple-page-card">
        <PageHeader
          eyebrow="Today's Workout"
          title="The app reads the current date and shows the right workout automatically."
          description="Complete tasks here without changing your weekly template. Finished tasks sync into your saved daily record."
          actionLabel="Open Daily Progress"
          actionTo="/daily-progress"
          actionClassName="secondary-link"
        />

        <div className="today-workout-layout">
          <section className="result-card result-card--compact">
            <span className="feature-label">{todayDateKey}</span>
            <h2>
              {todayName}: {todaysWorkout.title}
            </h2>
            <div className="completion-meter" aria-hidden="true">
              <span style={{ width: `${(completedCount / todaysWorkout.tasks.length) * 100}%` }} />
            </div>
            <p>
              Completed {completedCount} of {todaysWorkout.tasks.length} tasks today.
            </p>
            <Link className="secondary-link" to="/workout-planner">
              Edit Weekly Planner
            </Link>
          </section>

          <section className="entry-card">
            <p className="eyebrow">Task Checklist</p>
            <div className="checklist-stack">
              {todaysWorkout.tasks.map((task) => (
                <label className="checklist-item" key={task}>
                  <input
                    type="checkbox"
                    checked={Boolean(completedTasks[task])}
                    onChange={() => handleToggleTask(task)}
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>

            <div className="today-actions">
              <Link
                className="primary-cta"
                to="/daily-progress"
                onClick={() => syncDailyProgress(completedTasks)}
              >
                Log This Day
              </Link>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default TodaysWorkoutPage;
