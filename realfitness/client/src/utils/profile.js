import { getRequest, putRequest } from "./api";

const profileUpdatedEvent = "realfitness:profile-updated";
const themeStorageKey = "realfitness:theme";

export const defaultProfile = {
  name: "Saarasuman",
  age: "21",
  gender: "Prefer not to say",
  heightCm: "170",
  weightKg: "72",
  goal: "Build Muscle",
  workoutStyle: "Gym Training",
  daysPerWeek: "5",
  bio: "Focused on building a consistent workout routine and tracking progress clearly.",
  profilePhotoDataUrl: "",
  themePreference: "light"
};

export function normalizeThemePreference(themePreference) {
  return themePreference === "dark" ? "dark" : "light";
}

export function applyThemePreference(themePreference) {
  const normalizedTheme = normalizeThemePreference(themePreference);
  document.body.dataset.theme = normalizedTheme;
  window.localStorage.setItem(themeStorageKey, normalizedTheme);
  return normalizedTheme;
}

export function initializeThemePreference() {
  const storedTheme = window.localStorage.getItem(themeStorageKey) || defaultProfile.themePreference;
  applyThemePreference(storedTheme);
}

export async function loadProfile() {
  try {
    const response = await getRequest("/profile");
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const profile = { ...defaultProfile, ...(response.profile || {}) };
    profile.themePreference = response.profile?.themePreference || storedTheme || profile.themePreference;
    profile.themePreference = applyThemePreference(profile.themePreference);
    return profile;
  } catch (_error) {
    const profile = {
      ...defaultProfile,
      themePreference: window.localStorage.getItem(themeStorageKey) || defaultProfile.themePreference
    };
    profile.themePreference = applyThemePreference(profile.themePreference);
    return profile;
  }
}

export async function saveProfile(profile) {
  const requestedThemePreference = normalizeThemePreference(profile.themePreference);
  const response = await putRequest("/profile", {
    profile: {
      ...profile,
      themePreference: requestedThemePreference
    }
  });
  const nextProfile = {
    ...defaultProfile,
    ...profile,
    ...(response.profile || {}),
    themePreference: response.profile?.themePreference || requestedThemePreference
  };
  nextProfile.themePreference = applyThemePreference(nextProfile.themePreference);
  window.dispatchEvent(new CustomEvent(profileUpdatedEvent, { detail: nextProfile }));
  return nextProfile;
}

export function subscribeToProfileUpdates(callback) {
  function handleProfileUpdated(event) {
    const profile = { ...defaultProfile, ...(event.detail || {}) };
    profile.themePreference = applyThemePreference(profile.themePreference);
    callback(profile);
  }

  window.addEventListener(profileUpdatedEvent, handleProfileUpdated);

  return () => {
    window.removeEventListener(profileUpdatedEvent, handleProfileUpdated);
  };
}
