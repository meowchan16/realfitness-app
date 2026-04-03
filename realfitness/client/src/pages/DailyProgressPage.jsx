import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { loadDailyEntries, saveDailyEntry } from "../utils/dailyProgress";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const progressYear = 2026;

function buildDateKey(year, monthIndex, dayNumber) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
}

function buildMonthDays(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1;
    const dateKey = buildDateKey(year, monthIndex, dayNumber);

    return {
      dayNumber,
      dateKey
    };
  });
}

function getMonthIndexFromDateKey(dateKey) {
  const [, month] = dateKey.split("-");
  return Number(month) - 1;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DailyProgressPage() {
  const today = new Date();
  const currentMonthIndex = today.getFullYear() === progressYear ? today.getMonth() : 0;
  const currentDayNumber = today.getFullYear() === progressYear ? today.getDate() : 1;
  const currentDateKey = buildDateKey(progressYear, currentMonthIndex, currentDayNumber);
  const [selectedDate, setSelectedDate] = useState(currentDateKey);
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(currentMonthIndex);
  const [entriesByDate, setEntriesByDate] = useState({});
  const [title, setTitle] = useState("");
  const [workout, setWorkout] = useState("");
  const [meals, setMeals] = useState("");
  const [notes, setNotes] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = "RealFitness Daily Progress";
  }, []);

  useEffect(() => {
    async function fetchEntries() {
      const nextEntries = await loadDailyEntries();
      setEntriesByDate(nextEntries);
      setIsLoading(false);
    }

    fetchEntries();
  }, []);

  useEffect(() => {
    const selectedMonthIndex = getMonthIndexFromDateKey(selectedDate);
    if (selectedMonthIndex !== visibleMonthIndex) {
      setVisibleMonthIndex(selectedMonthIndex);
    }
  }, [selectedDate, visibleMonthIndex]);

  useEffect(() => {
    const entry = entriesByDate[selectedDate];

    setTitle(entry?.title || "");
    setWorkout(entry?.workout || "");
    setMeals(entry?.meals || "");
    setNotes(entry?.notes || "");
    setPhotoDataUrl(entry?.photoDataUrl || "");
    setPhotoName(entry?.photoName || "");
    setSaveMessage("");
  }, [entriesByDate, selectedDate]);

  const monthDays = useMemo(() => buildMonthDays(progressYear, visibleMonthIndex), [visibleMonthIndex]);
  const entry = entriesByDate[selectedDate];

  const handleMonthChange = (direction) => {
    const nextMonthIndex = visibleMonthIndex + direction;
    if (nextMonthIndex < 0 || nextMonthIndex > 11) {
      return;
    }

    const nextMonthDays = buildMonthDays(progressYear, nextMonthIndex);
    const selectedDayNumber = Number(selectedDate.split("-")[2]);
    const nextDayNumber = Math.min(selectedDayNumber, nextMonthDays.length);
    setVisibleMonthIndex(nextMonthIndex);
    setSelectedDate(buildDateKey(progressYear, nextMonthIndex, nextDayNumber));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoDataUrl(String(dataUrl));
      setPhotoName(file.name);
    } catch (_error) {
      setSaveMessage("Photo could not be loaded. Please try another file.");
    }
  };

  const handleSaveEntry = async () => {
    setIsSaving(true);
    setSaveMessage("");
    const nextEntries = {
      ...entriesByDate,
      [selectedDate]: {
        title: title.trim() || "Daily update",
        workout: workout.trim(),
        meals: meals.trim(),
        notes: notes.trim(),
        photoDataUrl,
        photoName
      }
    };

    try {
      setEntriesByDate(nextEntries);
      await saveDailyEntry(selectedDate, nextEntries[selectedDate]);
      setSaveMessage(`Saved your progress for ${selectedDate}.`);
    } catch (_error) {
      setSaveMessage("Could not save that daily entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="simple-page-shell">
      <div className="simple-page-card">
        <PageHeader
          eyebrow="Daily Progress"
          title="Track each date with notes, meals, photos, and later Google Drive backup."
          description="Select a date, update what you did, what you ate, and any notes or photos, then save the record for that day."
        />

        <div className="progress-layout">
          <section className="calendar-card">
            <div className="calendar-head">
              <div className="calendar-month-bar">
                <button
                  className="ghost-button calendar-nav-button"
                  type="button"
                  onClick={() => handleMonthChange(-1)}
                  disabled={visibleMonthIndex === 0}
                >
                  Previous
                </button>
                <h2>
                  {monthNames[visibleMonthIndex]} {progressYear}
                </h2>
                <button
                  className="ghost-button calendar-nav-button"
                  type="button"
                  onClick={() => handleMonthChange(1)}
                  disabled={visibleMonthIndex === 11}
                >
                  Next
                </button>
              </div>
              <p>Click any date to save or review what happened that day.</p>
            </div>

            <div className="calendar-grid">
              {monthDays.map((day) => (
                <button
                  key={day.dateKey}
                  type="button"
                  className={`calendar-day ${selectedDate === day.dateKey ? "calendar-day--active" : ""} ${
                    entriesByDate[day.dateKey] ? "calendar-day--filled" : ""
                  }`}
                  onClick={() => setSelectedDate(day.dateKey)}
                >
                  {day.dayNumber}
                </button>
              ))}
            </div>
          </section>

          <section className="entry-card">
            <span className="feature-label">Selected Date</span>
            <h2>{selectedDate}</h2>
            {isLoading ? <p className="section-copy">Loading saved entries...</p> : null}

            <div className="entry-form">
              <label className="planner-label" htmlFor="daily-title">
                Title
              </label>
              <input
                id="daily-title"
                className="planner-input"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Leg day completed"
              />

              <label className="planner-label" htmlFor="daily-workout">
                What did you do today?
              </label>
              <textarea
                id="daily-workout"
                className="planner-textarea"
                value={workout}
                onChange={(event) => setWorkout(event.target.value)}
                placeholder="Workout, steps, cardio, stretching..."
              />

              <label className="planner-label" htmlFor="daily-meals">
                What did you eat today?
              </label>
              <textarea
                id="daily-meals"
                className="planner-textarea"
                value={meals}
                onChange={(event) => setMeals(event.target.value)}
                placeholder="Meals, snacks, water, protein..."
              />

              <label className="planner-label" htmlFor="daily-notes">
                Notes
              </label>
              <textarea
                id="daily-notes"
                className="planner-textarea"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="How you felt, what to improve, anything important..."
              />
            </div>

            <div className="upload-box">
              <label className="planner-label" htmlFor="photo-upload">
                Add a photo for what you did or ate that day
              </label>
              <input id="photo-upload" type="file" accept="image/*" onChange={handleImageChange} />
              {photoName ? <p className="photo-name">Selected photo: {photoName}</p> : null}
              {photoDataUrl ? (
                <>
                  <img className="progress-preview" src={photoDataUrl} alt="Uploaded preview" />
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setPhotoDataUrl("");
                      setPhotoName("");
                      setSaveMessage("");
                    }}
                  >
                    Remove Photo
                  </button>
                </>
              ) : null}
            </div>

            <div className="entry-actions">
              <button className="primary-cta" type="button" onClick={handleSaveEntry} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save This Date"}
              </button>
              {saveMessage ? <p className="save-message save-message--visible">{saveMessage}</p> : null}
            </div>

            {entry ? (
              <div className="entry-details">
                <p>
                  <strong>Saved summary:</strong> {entry.title}
                </p>
                <p>Workout: {entry.workout || "Nothing added yet"}</p>
                {entry.completedTasks?.length ? (
                  <p>Completed tasks: {entry.completedTasks.join(", ")}</p>
                ) : null}
                <p>Meals: {entry.meals || "Nothing added yet"}</p>
                <p>Notes: {entry.notes || "Nothing added yet"}</p>
                {entry.driveSyncStatus === "synced" && entry.driveFileUrl ? (
                  <p>
                    Google Drive backup:{" "}
                    <a href={entry.driveFileUrl} target="_blank" rel="noreferrer">
                      Open synced photo
                    </a>
                  </p>
                ) : null}
                {entry.driveSyncStatus === "failed" ? (
                  <p>Google Drive backup failed: {entry.driveSyncError || "Please check your Drive setup."}</p>
                ) : null}
                {entry.driveSyncStatus === "not_configured" && entry.photoDataUrl ? (
                  <p>Google Drive backup is not configured yet. The photo is still saved in the app.</p>
                ) : null}
              </div>
            ) : (
              <p className="empty-copy">No saved details for this date yet.</p>
            )}

            <div className="drive-note">
              <p>
                Your day log, notes, meals, tasks, and photos all stay tied to the date you choose
                so reviewing progress stays simple.
              </p>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default DailyProgressPage;
