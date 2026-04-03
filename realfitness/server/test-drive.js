import { syncJsonBackupToGoogleDrive } from "./src/services/googleDriveService.js";

async function runTest() {
  console.log("Testing drive sync...");
  const result = await syncJsonBackupToGoogleDrive({
    fileName: "test-backend-upload.json",
    payload: { test: "This is a test from Antigravity" }
  });
  console.log("Result:", result);
}

runTest().catch(console.error);
