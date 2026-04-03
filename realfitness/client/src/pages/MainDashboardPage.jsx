import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSnapshot from "../components/DashboardSnapshot";
import PageHeader from "../components/PageHeader";
import { loadDailyEntries, loadPhotoEntries } from "../utils/dailyProgress";
import { loadProfile } from "../utils/profile";
import {
  defaultSchedule,
  getTodayDateKey,
  getTodayName,
  loadSchedule,
  loadTaskCompletions
} from "../utils/workoutPlanner";

const featureCards = [
  {
    label: "Today's Workout",
    title: "Finish Today's Tasks",
    description: "Open the focused daily screen, check off tasks, and carry them into your daily log.",
    to: "/todays-workout"
  },
  {
    label: "Daily Progress",
    title: "Track Your Day",
    description: "Save workouts, meals, notes, and photos to the exact date on your calendar.",
    to: "/daily-progress"
  },
  {
    label: "Photo Gallery",
    title: "Review Progress Photos",
    description: "See saved meal and progress images together in one clean gallery.",
    to: "/photo-gallery"
  },
  {
    label: "BMI",
    title: "Check Body Health",
    description: "Use your height and weight to understand your BMI and healthy target range.",
    to: "/bmi"
  },
  {
    label: "Exercise Library",
    title: "Browse More Exercises",
    description: "Explore category-based exercise ideas for legs, arms, chest, back, and more.",
    to: "/exercise-library"
  }
];

function MainDashboardPage() {
  const todayName = useMemo(() => getTodayName(), []);
  const todayDateKey = useMemo(() => getTodayDateKey(), []);
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [profileName, setProfileName] = useState("Athlete");
  const [stats, setStats] = useState({
    completedCount: 0,
    totalTasks: defaultSchedule[todayName].tasks.length,
    loggedDays: 0,
    photoCount: 0
  });
  const todaysWorkout = schedule[todayName];

  useEffect(() => {
    document.title = "RealFitness Main Page";
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      const [nextSchedule, profile, completionsByDate, entriesByDate, photos] = await Promise.all([
        loadSchedule(),
        loadProfile(),
        loadTaskCompletions(),
        loadDailyEntries(),
        loadPhotoEntries()
      ]);

      setSchedule(nextSchedule);
      setProfileName(profile.name || "Athlete");

      const todaysTasks = nextSchedule[todayName]?.tasks || [];
      const todaysCompletions = completionsByDate[todayDateKey] || {};
      const completedCount = todaysTasks.filter((task) => todaysCompletions[task]).length;

      setStats({
        completedCount,
        totalTasks: todaysTasks.length,
        loggedDays: Object.keys(entriesByDate).length,
        photoCount: photos.length
      });
    }

    fetchDashboardData();
  }, [todayDateKey, todayName]);

  return (
    <section className="dashboard-shell">
      <PageHeader
        eyebrow="Main Page"
        title={`${profileName}, your ${todayName.toLowerCase()} plan is ready.`}
        description="Your dashboard highlights today's workout, current progress, and the parts of the app you will use most often."
        actionLabel="Open Today's Workout"
        actionTo="/todays-workout"
        actionClassName="primary-cta"
      />

      <div className="dashboard-grid">
        <DashboardSnapshot
          workout={{
            name: `${todayName}: ${todaysWorkout.title}`,
            tasks: todaysWorkout.tasks
          }}
        />

        <section className="today-card">
          <div className="today-card__header">
            <div>
              <p className="eyebrow">Today's Tasks</p>
              <h2>{todaysWorkout.title}</h2>
              <p className="section-copy">
                Your planner decides what appears here automatically based on the current date.
              </p>
            </div>
            <div className="today-card__actions">
              <Link className="ghost-link" to="/workout-planner">
                Edit Planner
              </Link>
              <Link className="secondary-link" to="/daily-progress">
                Log Progress
              </Link>
            </div>
          </div>
          <ul className="snapshot-list">
            {todaysWorkout.tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="dashboard-metrics">
        <article className="saved-day-card">
          <span className="feature-label">Today's Progress</span>
          <strong>
            {stats.completedCount} / {stats.totalTasks}
          </strong>
          <p>Tasks completed for {todayName}</p>
        </article>
        <article className="saved-day-card">
          <span className="feature-label">Logged Days</span>
          <strong>{stats.loggedDays}</strong>
          <p>Calendar entries saved so far</p>
        </article>
        <article className="saved-day-card">
          <span className="feature-label">Photos</span>
          <strong>{stats.photoCount}</strong>
          <p>Progress or meal photos in your gallery</p>
        </article>
      </section>

      <section className="feature-section">
        <div className="feature-section__header">
          <p className="eyebrow">Quick Access</p>
          <h2>Open the tools you’ll use most.</h2>
        </div>
        <div className="feature-hub">
          {featureCards.map((card) => (
            <Link className="hub-card" key={card.title} to={card.to}>
              <span className="feature-label">{card.label}</span>
              <strong>{card.title}</strong>
              <p>{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

export default MainDashboardPage;
