import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SelectionCard from "../components/SelectionCard";
import { getRequest } from "../utils/api";
import { defaultProfile, loadProfile, saveProfile } from "../utils/profile";

const goals = [
  {
    title: "Build Muscle",
    description: "Create strength-focused weekly workouts and track steady progress."
  },
  {
    title: "Lose Weight",
    description: "Stay consistent with daily habits, cardio, and food tracking."
  },
  {
    title: "Stay Fit",
    description: "Keep a balanced plan with movement, photos, and simple routines."
  }
];

const workoutStyles = [
  {
    title: "Gym Training",
    description: "Best for structured tasks like leg press, bench press, and machines."
  },
  {
    title: "Home Workouts",
    description: "Perfect for bodyweight sessions, quick routines, and minimal equipment."
  },
  {
    title: "Mixed Routine",
    description: "Use both home and gym sessions depending on your schedule."
  }
];

const planTypes = [
  {
    title: "Weekly Repeat Plan",
    description: "Save Monday to Sunday once, and let the app show the correct workout every day."
  },
  {
    title: "Flexible Daily Plan",
    description: "Adjust tasks day by day when your week changes often."
  }
];

function OnboardingPage() {
  const [selectedGoal, setSelectedGoal] = useState(goals[0].title);
  const [selectedStyle, setSelectedStyle] = useState(workoutStyles[0].title);
  const [selectedPlan, setSelectedPlan] = useState(planTypes[0].title);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [name, setName] = useState(defaultProfile.name);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "RealFitness Onboarding";
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const session = await getRequest("/auth/session");

        if (!session.user?.email) {
          navigate("/");
          return;
        }

        const profile = await loadProfile();
        setName(profile.name || defaultProfile.name);
        setSelectedGoal(profile.goal || goals[0].title);
        setSelectedStyle(profile.workoutStyle || workoutStyles[0].title);
        setDaysPerWeek(Number(profile.daysPerWeek) || 5);
        setSelectedPlan(planTypes[0].title);
      } catch (_error) {
        navigate("/");
      }
    }

    fetchProfile();
  }, [navigate]);

  const handleContinue = async () => {
    setIsSaving(true);
    setStatusMessage("");

    try {
      await saveProfile({
        ...defaultProfile,
        ...(await loadProfile()),
        name: name.trim() || defaultProfile.name,
        goal: selectedGoal,
        workoutStyle: selectedStyle,
        daysPerWeek: String(daysPerWeek),
        bio: `${selectedGoal} focus with a ${selectedStyle.toLowerCase()} routine ${daysPerWeek} day${
          daysPerWeek === 1 ? "" : "s"
        } per week.`
      });

      navigate("/dashboard");
    } catch (_error) {
      setStatusMessage("We couldn't save your setup. Please check that the server is running and try again.");
      setIsSaving(false);
    }
  };

  return (
    <main className="onboarding-shell">
      <section className="onboarding-hero">
        <div className="brand-badge">STEP 1 OF 1</div>
        <h1>Set up your training style before we build your dashboard.</h1>
        <p>
          Choose your goal, training style, and weekly frequency so the rest of the app starts with
          a plan that fits you.
        </p>

        <div className="onboarding-summary-card">
          <span className="feature-label">Current Setup</span>
          <ul className="summary-list">
            <li>
              <span>Name</span>
              <strong>{name || "Your profile"}</strong>
            </li>
            <li>
              <span>Goal</span>
              <strong>{selectedGoal}</strong>
            </li>
            <li>
              <span>Workout Style</span>
              <strong>{selectedStyle}</strong>
            </li>
            <li>
              <span>Plan Type</span>
              <strong>{selectedPlan}</strong>
            </li>
            <li>
              <span>Days Per Week</span>
              <strong>{daysPerWeek} days</strong>
            </li>
          </ul>
        </div>
      </section>

      <section className="onboarding-panel">
        <div className="onboarding-card">
          <div className="onboarding-section">
            <p className="eyebrow">Your Name</p>
            <input
              className="planner-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="onboarding-section">
            <p className="eyebrow">Choose Your Goal</p>
            <div className="selection-grid">
              {goals.map((goal) => (
                <SelectionCard
                  key={goal.title}
                  title={goal.title}
                  description={goal.description}
                  isActive={selectedGoal === goal.title}
                  onClick={() => setSelectedGoal(goal.title)}
                />
              ))}
            </div>
          </div>

          <div className="onboarding-section">
            <p className="eyebrow">Pick Your Workout Style</p>
            <div className="selection-grid">
              {workoutStyles.map((style) => (
                <SelectionCard
                  key={style.title}
                  title={style.title}
                  description={style.description}
                  isActive={selectedStyle === style.title}
                  onClick={() => setSelectedStyle(style.title)}
                />
              ))}
            </div>
          </div>

          <div className="onboarding-section">
            <p className="eyebrow">Training Days Per Week</p>
            <div className="range-wrap">
              <input
                type="range"
                min="1"
                max="7"
                value={daysPerWeek}
                onChange={(event) => setDaysPerWeek(Number(event.target.value))}
              />
              <div className="range-marks">
                <span>1</span>
                <strong>{daysPerWeek}</strong>
                <span>7</span>
              </div>
            </div>
          </div>

          <div className="onboarding-section">
            <p className="eyebrow">How Should Plans Work?</p>
            <div className="selection-grid selection-grid--double">
              {planTypes.map((plan) => (
                <SelectionCard
                  key={plan.title}
                  title={plan.title}
                  description={plan.description}
                  isActive={selectedPlan === plan.title}
                  onClick={() => setSelectedPlan(plan.title)}
                />
              ))}
            </div>
          </div>

          <div className="onboarding-actions">
            <Link className="ghost-link" to="/">
              Back to Login
            </Link>
            <button className="primary-cta" type="button" onClick={handleContinue} disabled={isSaving}>
              {isSaving ? "Saving Setup..." : "Continue to Dashboard"}
            </button>
          </div>
          {statusMessage ? <p className="save-message save-message--visible">{statusMessage}</p> : null}
        </div>
      </section>
    </main>
  );
}

export default OnboardingPage;
