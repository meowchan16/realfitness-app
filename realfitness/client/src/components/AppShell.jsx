import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { postRequest } from "../utils/api";
import { defaultProfile, loadProfile, subscribeToProfileUpdates } from "../utils/profile";

const primaryLinks = [
  { to: "/dashboard", label: "Main Page" },
  { to: "/todays-workout", label: "Today's Workout" },
  { to: "/workout-planner", label: "Planner" },
  { to: "/daily-progress", label: "Daily Progress" },
  { to: "/photo-gallery", label: "Photo Gallery" }
];

const secondaryLinks = [
  { to: "/bmi", label: "BMI" },
  { to: "/exercise-library", label: "Exercises" }
];

function AppShell({ children }) {
  const [profile, setProfile] = useState(defaultProfile);
  const location = useLocation();

  useEffect(() => {
    async function fetchProfile() {
      const nextProfile = await loadProfile();
      setProfile(nextProfile);
    }

    fetchProfile();

    const unsubscribe = subscribeToProfileUpdates((nextProfile) => {
      setProfile(nextProfile);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function refreshProfile() {
      const nextProfile = await loadProfile();
      setProfile(nextProfile);
    }

    refreshProfile();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await postRequest("/auth/logout", {});
    } catch (_error) {
      // The app should still leave the protected area even if the request fails.
    }

    window.location.href = "/";
  };

  return (
    <div className="app-shell">
      <header className="app-nav">
        <div className="app-brand-wrap">
          <NavLink className="app-avatar-link" to="/profile" aria-label="Open profile">
            {profile.profilePhotoDataUrl ? (
              <img className="logo-mark logo-mark--image" src={profile.profilePhotoDataUrl} alt="Profile" />
            ) : (
              <span className="logo-mark">RF</span>
            )}
          </NavLink>

          <NavLink className="app-brand-copy" to="/dashboard">
            <strong>RealFitness</strong>
            <small>Train with a plan</small>
          </NavLink>
        </div>

        <nav className="app-nav__primary" aria-label="Primary">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `app-link ${isActive ? "app-link--active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-nav__secondary">
          <span className="app-nav__label">More</span>
          {secondaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `app-link app-link--compact ${isActive ? "app-link--active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
          <button className="app-link app-link--compact app-link--button" type="button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      <main className="app-content">{children || <Outlet />}</main>
    </div>
  );
}

AppShell.propTypes = {
  children: PropTypes.node
};

AppShell.defaultProps = {
  children: null
};

export default AppShell;
