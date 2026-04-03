import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthTipCard from "../components/AuthTipCard";
import BenefitList from "../components/BenefitList";
import FeatureCard from "../components/FeatureCard";
import GoogleButton from "../components/GoogleButton";
import { API_BASE_URL, getRequest, postRequest } from "../utils/api";

const featureCards = [
  {
    label: "Today",
    title: "Leg Day",
    description: "50 squats, leg press, walking lunges, calf raises."
  },
  {
    label: "Streak",
    title: "12 Days",
    description: "Small daily wins stack into visible progress."
  },
  {
    label: "Progress",
    title: "Photo Timeline",
    description: "Keep photos, notes, and workout proof together."
  }
];

const benefits = [
  "See the right workout automatically each day",
  "Upload progress photos and daily proof",
  "Save logs so your history never disappears"
];

function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [message, setMessage] = useState(
    "Log in with Google so we can create your fitness account and keep your progress connected."
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "RealFitness Login";
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleStatus = params.get("google");

    if (googleStatus === "connected") {
      setMessage("Google connected. Your account can now save backups to your own Google Drive.");
    } else if (googleStatus === "failed") {
      setMessage("Google login did not finish. Please try again.");
    }
  }, [location.search]);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await getRequest("/auth/session");
        if (response.user?.email) {
          navigate("/dashboard");
        }
      } catch (_error) {
        // The login page can stay visible when the backend is unavailable.
      }
    }

    checkSession();
  }, [navigate]);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = `${API_BASE_URL}/auth/google?mode=login`;
  };

  return (
    <main className="page-shell">
      <section className="brand-panel">
        <div className="brand-badge">REALFITNESS</div>
        <h1>Build strength with a plan that shows up every day.</h1>
        <p>
          Track workouts, upload progress photos, save daily logs, and keep your full fitness
          journey in one place.
        </p>

        <div className="feature-grid">
          {featureCards.map((feature) => (
            <FeatureCard
              key={feature.label}
              label={feature.label}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <AuthTipCard />
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card__header">
            <div className="logo-mark">RF</div>
            <div>
              <p className="eyebrow">Welcome Back</p>
              <h2>Log in to your fitness dashboard</h2>
            </div>
          </div>

          <p className="support-text">{message}</p>



          <GoogleButton isLoading={isGoogleLoading} onClick={handleGoogleLogin} />

          <div className="divider">
            <span>Built for your daily routine</span>
          </div>

          <BenefitList items={benefits} />

          <p className="fine-print">
            Your email links your setup to the planner, dashboard, daily progress, BMI, photos,
            and profile pages so each person keeps their own history.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
