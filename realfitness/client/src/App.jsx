import React from "react";
import { Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ErrorBoundary from "./components/ErrorBoundary";
import BmiPage from "./pages/BmiPage";
import DailyProgressPage from "./pages/DailyProgressPage";
import LoginPage from "./pages/LoginPage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import MainDashboardPage from "./pages/MainDashboardPage";
import OnboardingPage from "./pages/OnboardingPage";
import PhotoGalleryPage from "./pages/PhotoGalleryPage";
import ProfilePage from "./pages/ProfilePage";
import TodaysWorkoutPage from "./pages/TodaysWorkoutPage";
import WorkoutPlannerPage from "./pages/WorkoutPlannerPage";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AppShell />}>
          <Route path="/workout-planner" element={<WorkoutPlannerPage />} />
          <Route path="/dashboard" element={<MainDashboardPage />} />
          <Route path="/todays-workout" element={<TodaysWorkoutPage />} />
          <Route path="/bmi" element={<BmiPage />} />
          <Route path="/daily-progress" element={<DailyProgressPage />} />
          <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
          <Route path="/photo-gallery" element={<PhotoGalleryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
