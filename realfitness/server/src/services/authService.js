import crypto from "node:crypto";
import { google } from "googleapis";
import { env } from "../config/env.js";
import { defaultData } from "../defaultData.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import WorkoutPlan from "../models/WorkoutPlan.js";

const SESSION_COOKIE_NAME = "realfitness_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const sessionStore = new Map();
const oauthStateStore = new Map();

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatNameFromEmail(email) {
  const localPart = normalizeEmail(email).split("@")[0] || "Member";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce((cookies, entry) => {
    const [rawName, ...rawValueParts] = entry.trim().split("=");
    if (!rawName) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValueParts.join("=") || "");
    return cookies;
  }, {});
}

function getSessionToken(request) {
  const cookies = parseCookies(request.headers.cookie || "");
  return cookies[SESSION_COOKIE_NAME] || "";
}

function setSessionCookie(response, token) {
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${SESSION_TTL_SECONDS}`
  );
}

function clearSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`
  );
}

function buildGoogleOAuthClient() {
  if (!isGoogleOAuthConfigured()) {
    throw createHttpError(500, "Google login is not configured yet.");
  }

  return new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret,
    env.googleRedirectUri
  );
}

function saveSessionForUser(response, user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessionStore.set(token, {
    userId: String(user._id),
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000
  });
  setSessionCookie(response, token);
}

function buildRedirectUrl(status, mode = "login") {
  const clientAppUrl = env.clientAppUrl || "http://localhost:5173";
  const nextPath = mode === "connect" ? "/profile" : "/onboarding";
  return `${clientAppUrl}${nextPath}?google=${status}`;
}

export function serializeUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    authProvider: user.authProvider,
    googleDriveConnected: Boolean(user.googleRefreshToken || user.googleAccessToken),
    googleDriveFolderId: user.googleDriveFolderId || ""
  };
}

export function isGoogleOAuthConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret && env.googleRedirectUri);
}

export async function ensureUserData(user) {
  const fallbackName = user.name || formatNameFromEmail(user.email);

  await Profile.findOneAndUpdate(
    { user: user._id },
    {
      $setOnInsert: {
        ...defaultData.profile,
        name: fallbackName
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await WorkoutPlan.findOneAndUpdate(
    { user: user._id },
    {
      $setOnInsert: {
        schedule: defaultData.workouts.schedule
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

export async function loginUserWithEmail(email, response) {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw createHttpError(400, "Please enter a valid email address.");
  }

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = await User.create({
      email: normalizedEmail,
      name: formatNameFromEmail(normalizedEmail),
      authProvider: "email"
    });
  }

  await ensureUserData(user);

  saveSessionForUser(response, user);

  return user;
}

export async function getCurrentUser(request) {
  const token = getSessionToken(request);
  if (!token) {
    return null;
  }

  const session = sessionStore.get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessionStore.delete(token);
    return null;
  }

  return User.findById(session.userId);
}

export async function requireCurrentUser(request) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw createHttpError(401, "Please log in with your email first.");
  }

  return user;
}

export function logoutCurrentUser(request, response) {
  const token = getSessionToken(request);
  if (token) {
    sessionStore.delete(token);
  }

  clearSessionCookie(response);
}

export function getGoogleAuthUrl({ mode = "login", userId = "", redirectTo = "" } = {}) {
  const oauthClient = buildGoogleOAuthClient();
  const stateToken = crypto.randomBytes(24).toString("hex");
  oauthStateStore.set(stateToken, {
    mode,
    userId,
    redirectTo,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  return oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/drive.file"
    ],
    state: stateToken
  });
}

export async function handleGoogleOAuthCallback({ code, state, response }) {
  if (!code || !state) {
    throw createHttpError(400, "Google login response is incomplete.");
  }

  const stateEntry = oauthStateStore.get(state);
  oauthStateStore.delete(state);

  if (!stateEntry || stateEntry.expiresAt <= Date.now()) {
    throw createHttpError(400, "Google login session expired. Please try again.");
  }

  const oauthClient = buildGoogleOAuthClient();
  const { tokens } = await oauthClient.getToken(code);
  oauthClient.setCredentials(tokens);

  const oauth2 = google.oauth2({
    version: "v2",
    auth: oauthClient
  });
  const userInfoResponse = await oauth2.userinfo.get();
  const userInfo = userInfoResponse.data;

  if (!userInfo.email) {
    throw createHttpError(400, "Google account email was not returned.");
  }

  let user = null;

  if (stateEntry.mode === "connect" && stateEntry.userId) {
    user = await User.findById(stateEntry.userId);
    if (!user) {
      throw createHttpError(401, "Your session expired. Please log in again before connecting Google Drive.");
    }

    if (user.email.toLowerCase() !== String(userInfo.email).toLowerCase()) {
      throw createHttpError(
        400,
        "Please connect the same Google email that you use in this RealFitness account."
      );
    }
  } else {
    user =
      (await User.findOne({ googleId: userInfo.id })) ||
      (await User.findOne({ email: String(userInfo.email).toLowerCase() }));

    if (!user) {
      user = await User.create({
        email: String(userInfo.email).toLowerCase(),
        name: userInfo.name || formatNameFromEmail(userInfo.email),
        authProvider: "google",
        googleId: userInfo.id || ""
      });
    }
  }

  user.email = String(userInfo.email).toLowerCase();
  user.name = userInfo.name || user.name || formatNameFromEmail(userInfo.email);
  user.authProvider = "google";
  user.googleId = userInfo.id || user.googleId || "";
  user.googleAccessToken = tokens.access_token || user.googleAccessToken || "";
  user.googleRefreshToken = tokens.refresh_token || user.googleRefreshToken || "";
  user.googleTokenExpiryDate = tokens.expiry_date || user.googleTokenExpiryDate || 0;
  await user.save();

  await ensureUserData(user);
  saveSessionForUser(response, user);

  return {
    user,
    redirectTo: buildRedirectUrl("connected", stateEntry.mode)
  };
}
