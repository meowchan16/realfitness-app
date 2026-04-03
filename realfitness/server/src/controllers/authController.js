import { defaultData } from "../defaultData.js";
import { env } from "../config/env.js";
import {
  getCurrentUser,
  getGoogleAuthUrl,
  handleGoogleOAuthCallback,
  isGoogleOAuthConfigured,
  loginUserWithEmail,
  logoutCurrentUser,
  requireCurrentUser,
  serializeUser
} from "../services/authService.js";

export async function getProviders(_request, response) {
  response.json({
    providers: defaultData.auth.providers,
    googleOAuthConfigured: isGoogleOAuthConfigured()
  });
}

export async function login(request, response) {
  const email = request.body?.email;
  const user = await loginUserWithEmail(email, response);

  response.json({
    user: serializeUser(user)
  });
}

export async function getSession(request, response) {
  const user = await getCurrentUser(request);

  response.json({
    user: user ? serializeUser(user) : null
  });
}

export async function logout(request, response) {
  logoutCurrentUser(request, response);
  response.json({ success: true });
}

export async function startGoogleAuth(request, response) {
  const mode = request.query?.mode === "connect" ? "connect" : "login";
  const currentUser = mode === "connect" ? await requireCurrentUser(request) : null;
  const authUrl = getGoogleAuthUrl({
    mode,
    userId: currentUser?._id ? String(currentUser._id) : ""
  });

  response.redirect(authUrl);
}

export async function completeGoogleAuth(request, response) {
  try {
    const result = await handleGoogleOAuthCallback({
      code: request.query?.code,
      state: request.query?.state,
      response
    });

    response.redirect(result.redirectTo);
  } catch (_error) {
    response.redirect(`${env.clientAppUrl}/?google=failed`);
  }
}
