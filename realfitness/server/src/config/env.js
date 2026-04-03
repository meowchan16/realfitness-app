import "dotenv/config";

export const env = {
  clientAppUrl: process.env.CLIENT_APP_URL || "http://localhost:5173",
  host: process.env.HOST || "localhost",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || "",
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
  googleServiceAccountPrivateKey: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  ),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/realfitness",
  port: Number(process.env.PORT || 4000)
};
