import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import GoogleButton from "../components/GoogleButton";
import { API_BASE_URL, getRequest } from "../utils/api";
import { defaultProfile, loadProfile, saveProfile } from "../utils/profile";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ProfilePage() {
  const [profile, setProfile] = useState(defaultProfile);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    document.title = "RealFitness Profile";
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      const nextProfile = await loadProfile();
      setProfile(nextProfile);
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await getRequest("/auth/session");
        setSessionUser(response.user || null);
      } catch (_error) {
        setSessionUser(null);
      }
    }

    fetchSession();
  }, []);

  const handleChange = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value
    }));
    setSaveMessage("");
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const photoDataUrl = await readFileAsDataUrl(file);
      setProfile((current) => ({
        ...current,
        profilePhotoDataUrl: String(photoDataUrl)
      }));
      setSaveMessage("");
    } catch (_error) {
      setSaveMessage("Could not load that photo. Please try another image.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const nextProfile = await saveProfile(profile);
      setProfile(nextProfile);
      setSaveMessage("Profile saved successfully.");
    } catch (_error) {
      setSaveMessage("Profile could not be saved. Please try again after restarting the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGoogleDrive = () => {
    setIsGoogleLoading(true);
    window.location.href = `${API_BASE_URL}/auth/google?mode=connect`;
  };

  return (
    <section className="simple-page-shell">
      <div className="simple-page-card">
        <PageHeader
          eyebrow="Profile"
          title="Keep your personal fitness details and goals in one place."
          description="Update your body details, goal, and workout style here so the app can feel more personalized later."
        />

        <div className="profile-layout">
          <section className="profile-summary-card">
            {profile.profilePhotoDataUrl ? (
              <img className="profile-avatar profile-avatar--image" src={profile.profilePhotoDataUrl} alt="Profile" />
            ) : (
              <div className="profile-avatar">RF</div>
            )}
            <div>
              <h2>{profile.name || "Your Profile"}</h2>
              <p className="section-copy">{profile.bio}</p>
            </div>

            <div className="saved-day-card">
              <span className="feature-label">Google Drive</span>
              <strong>{sessionUser?.googleDriveConnected ? "Connected" : "Not Connected"}</strong>
              <p>
                {sessionUser?.googleDriveConnected
                  ? "Backups can go to this user's own Google Drive."
                  : "Connect Google to save photos and backups into your own Drive."}
              </p>
            </div>

            <GoogleButton
              isLoading={isGoogleLoading}
              label="Connect Google Drive"
              loadingLabel="Connecting Drive..."
              onClick={handleConnectGoogleDrive}
            />

            <div className="profile-metrics">
              <article className="saved-day-card">
                <span className="feature-label">Goal</span>
                <strong>{profile.goal}</strong>
                <p>Main fitness direction</p>
              </article>
              <article className="saved-day-card">
                <span className="feature-label">Style</span>
                <strong>{profile.workoutStyle}</strong>
                <p>Preferred training style</p>
              </article>
              <article className="saved-day-card">
                <span className="feature-label">Days / Week</span>
                <strong>{profile.daysPerWeek}</strong>
                <p>Planned workout frequency</p>
              </article>
              <article className="saved-day-card">
                <span className="feature-label">Theme</span>
                <strong>{profile.themePreference === "dark" ? "Dark" : "Light"}</strong>
                <p>Applies across the whole app</p>
              </article>
            </div>
          </section>

          <section className="entry-card">
            <div className="entry-form profile-form-grid">
              <label>
                <p className="planner-label">Name</p>
                <input
                  className="planner-input"
                  type="text"
                  value={profile.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                />
              </label>
              <label>
                <p className="planner-label">Age</p>
                <input
                  className="planner-input"
                  type="number"
                  value={profile.age}
                  onChange={(event) => handleChange("age", event.target.value)}
                />
              </label>
              <label>
                <p className="planner-label">Gender</p>
                <input
                  className="planner-input"
                  type="text"
                  value={profile.gender}
                  onChange={(event) => handleChange("gender", event.target.value)}
                />
              </label>
              <label>
                <p className="planner-label">Height (cm)</p>
                <input
                  className="planner-input"
                  type="number"
                  value={profile.heightCm}
                  onChange={(event) => handleChange("heightCm", event.target.value)}
                />
              </label>
              <label>
                <p className="planner-label">Weight (kg)</p>
                <input
                  className="planner-input"
                  type="number"
                  value={profile.weightKg}
                  onChange={(event) => handleChange("weightKg", event.target.value)}
                />
              </label>
              <label>
                <p className="planner-label">Goal</p>
                <input
                  className="planner-input"
                  type="text"
                  value={profile.goal}
                  onChange={(event) => handleChange("goal", event.target.value)}
                />
              </label>
              <label>
                <p className="planner-label">Workout Style</p>
                <input
                  className="planner-input"
                  type="text"
                  value={profile.workoutStyle}
                  onChange={(event) => handleChange("workoutStyle", event.target.value)}
                />
              </label>
              <label>
                <p className="planner-label">Days Per Week</p>
                <input
                  className="planner-input"
                  type="text"
                  value={profile.daysPerWeek}
                  onChange={(event) => handleChange("daysPerWeek", event.target.value)}
                />
              </label>
              <label>
                <p className="planner-label">Theme</p>
                <div className="theme-toggle" role="radiogroup" aria-label="Theme preference">
                  <button
                    className={`theme-toggle__option ${
                      profile.themePreference === "light" ? "theme-toggle__option--active" : ""
                    }`}
                    type="button"
                    role="radio"
                    aria-checked={profile.themePreference === "light"}
                    onClick={() => handleChange("themePreference", "light")}
                  >
                    Light Theme
                  </button>
                  <button
                    className={`theme-toggle__option ${
                      profile.themePreference === "dark" ? "theme-toggle__option--active" : ""
                    }`}
                    type="button"
                    role="radio"
                    aria-checked={profile.themePreference === "dark"}
                    onClick={() => handleChange("themePreference", "dark")}
                  >
                    Dark Theme
                  </button>
                </div>
              </label>
              <label className="profile-form-grid__full">
                <p className="planner-label">Profile Photo</p>
                <input className="planner-input" type="file" accept="image/*" onChange={handlePhotoChange} />
              </label>
              <label className="profile-form-grid__full">
                <p className="planner-label">Short Bio</p>
                <textarea
                  className="planner-textarea"
                  value={profile.bio}
                  onChange={(event) => handleChange("bio", event.target.value)}
                />
              </label>
            </div>

            <div className="entry-actions">
              <button className="primary-cta" type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
              {saveMessage ? <p className="save-message save-message--visible">{saveMessage}</p> : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
