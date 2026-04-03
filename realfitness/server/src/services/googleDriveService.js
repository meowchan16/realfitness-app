import { Buffer } from "node:buffer";
import { Readable } from "node:stream";
import { google } from "googleapis";
import { env } from "../config/env.js";

function buildServiceAccountClient() {
  const auth = new google.auth.JWT({
    email: env.googleServiceAccountEmail,
    key: env.googleServiceAccountPrivateKey,
    scopes: ["https://www.googleapis.com/auth/drive.file"]
  });

  return {
    auth,
    drive: google.drive({
      version: "v3",
      auth
    }),
    parentFolderId: env.googleDriveFolderId
  };
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Photo must be a valid base64 data URL.");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

function guessExtension(mimeType) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function sanitizeFilePart(value, fallback = "file") {
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

async function findExistingFileId(drive, fileName, parentFolderId) {
  const queryParts = [`name = '${String(fileName).replace(/'/g, "\\'")}'`, "trashed = false"];

  if (parentFolderId) {
    queryParts.unshift(`'${parentFolderId}' in parents`);
  }

  const result = await drive.files.list({
    q: queryParts.join(" and "),
    fields: "files(id, name)",
    pageSize: 1
  });

  return result.data.files?.[0]?.id || "";
}

async function ensureUserDriveFolder(drive, user) {
  if (user.googleDriveFolderId) {
    return user.googleDriveFolderId;
  }

  const existingFolder = await drive.files.list({
    q: [
      "mimeType = 'application/vnd.google-apps.folder'",
      "name = 'RealFitness'",
      "trashed = false"
    ].join(" and "),
    fields: "files(id, name)",
    pageSize: 1
  });

  const folderId = existingFolder.data.files?.[0]?.id;

  if (folderId) {
    user.googleDriveFolderId = folderId;
    await user.save();
    return folderId;
  }

  const created = await drive.files.create({
    requestBody: {
      name: "RealFitness",
      mimeType: "application/vnd.google-apps.folder"
    },
    fields: "id"
  });

  user.googleDriveFolderId = created.data.id || "";
  await user.save();
  return user.googleDriveFolderId;
}

function buildUserOAuthClient(user) {
  const auth = new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret,
    env.googleRedirectUri
  );

  auth.setCredentials({
    access_token: user.googleAccessToken || undefined,
    refresh_token: user.googleRefreshToken || undefined,
    expiry_date: user.googleTokenExpiryDate || undefined
  });

  return auth;
}

async function buildDriveContext(user) {
  if (user?.googleRefreshToken || user?.googleAccessToken) {
    const auth = buildUserOAuthClient(user);
    const drive = google.drive({
      version: "v3",
      auth
    });
    const parentFolderId = await ensureUserDriveFolder(drive, user);
    return {
      auth,
      drive,
      parentFolderId,
      usingUserDrive: true
    };
  }

  if (isGoogleDriveConfigured()) {
    return {
      ...buildServiceAccountClient(),
      usingUserDrive: false
    };
  }

  return null;
}

export function isGoogleDriveConfigured() {
  return Boolean(
    env.googleDriveFolderId && env.googleServiceAccountEmail && env.googleServiceAccountPrivateKey
  );
}

export async function syncPhotoToGoogleDrive({
  user,
  date,
  photoDataUrl,
  photoName,
  title,
  existingDriveFileId
}) {
  const driveContext = await buildDriveContext(user);

  if (!driveContext) {
    return {
      driveFileId: "",
      driveFileUrl: "",
      driveSyncError: "",
      driveSyncStatus: "not_configured"
    };
  }

  try {
    const { drive, parentFolderId } = driveContext;
    const { mimeType, buffer } = parseDataUrl(photoDataUrl);
    const extension = guessExtension(mimeType);
    const safeTitle = (title || "daily-progress").trim().replace(/[^a-z0-9-_]+/gi, "-");
    const fileName = `${date}-${safeTitle || "daily-progress"}.${extension}`;

    const media = {
      mimeType,
      body: Readable.from(buffer)
    };

    let file;

    if (existingDriveFileId) {
      const updated = await drive.files.update({
        fileId: existingDriveFileId,
        media,
        requestBody: {
          name: photoName || fileName
        },
        fields: "id, webViewLink, webContentLink"
      });
      file = updated.data;
    } else {
      const created = await drive.files.create({
        media,
        requestBody: {
          name: photoName || fileName,
          parents: parentFolderId ? [parentFolderId] : undefined
        },
        fields: "id, webViewLink, webContentLink"
      });
      file = created.data;

      if (file.id) {
        await drive.permissions.create({
          fileId: file.id,
          requestBody: {
            type: "anyone",
            role: "reader"
          }
        });
      }
    }

    return {
      driveFileId: file.id || "",
      driveFileUrl: file.webViewLink || file.webContentLink || "",
      driveSyncError: "",
      driveSyncStatus: "synced"
    };
  } catch (error) {
    return {
      driveFileId: existingDriveFileId || "",
      driveFileUrl: "",
      driveSyncError: error?.message || "Drive sync failed.",
      driveSyncStatus: "failed"
    };
  }
}

export async function syncJsonBackupToGoogleDrive({ user, fileName, payload }) {
  const driveContext = await buildDriveContext(user || null);

  if (!driveContext) {
    return {
      driveFileUrl: "",
      driveSyncError: "",
      driveSyncStatus: "not_configured"
    };
  }

  try {
    const { drive, parentFolderId } = driveContext;
    const existingFileId = await findExistingFileId(drive, fileName, parentFolderId);
    const media = {
      mimeType: "application/json",
      body: Readable.from(Buffer.from(JSON.stringify(payload, null, 2), "utf8"))
    };

    let file;

    if (existingFileId) {
      const updated = await drive.files.update({
        fileId: existingFileId,
        media,
        requestBody: { name: fileName },
        fields: "id, webViewLink, webContentLink"
      });
      file = updated.data;
    } else {
      const created = await drive.files.create({
        media,
        requestBody: {
          name: fileName,
          parents: parentFolderId ? [parentFolderId] : undefined
        },
        fields: "id, webViewLink, webContentLink"
      });
      file = created.data;

      if (file.id) {
        await drive.permissions.create({
          fileId: file.id,
          requestBody: {
            type: "anyone",
            role: "reader"
          }
        });
      }
    }

    return {
      driveFileUrl: file.webViewLink || file.webContentLink || "",
      driveSyncError: "",
      driveSyncStatus: "synced"
    };
  } catch (error) {
    return {
      driveFileUrl: "",
      driveSyncError: error?.message || "Drive sync failed.",
      driveSyncStatus: "failed"
    };
  }
}

export function buildUserBackupFileName(email, suffix) {
  return `${sanitizeFilePart(email, "member")}-${suffix}.json`;
}

export async function syncCsvBackupToGoogleDrive({ user, fileName, csvText }) {
  const driveContext = await buildDriveContext(user || null);

  if (!driveContext) {
    return {
      driveFileUrl: "",
      driveSyncError: "",
      driveSyncStatus: "not_configured"
    };
  }

  try {
    const { drive, parentFolderId } = driveContext;
    const existingFileId = await findExistingFileId(drive, fileName, parentFolderId);
    const media = {
      mimeType: "text/csv",
      body: Readable.from(Buffer.from(csvText, "utf8"))
    };

    let file;

    if (existingFileId) {
      const updated = await drive.files.update({
        fileId: existingFileId,
        media,
        requestBody: { name: fileName },
        fields: "id, webViewLink, webContentLink"
      });
      file = updated.data;
    } else {
      const created = await drive.files.create({
        media,
        requestBody: {
          name: fileName,
          parents: parentFolderId ? [parentFolderId] : undefined
        },
        fields: "id, webViewLink, webContentLink"
      });
      file = created.data;

      if (file.id) {
        await drive.permissions.create({
          fileId: file.id,
          requestBody: {
            type: "anyone",
            role: "reader"
          }
        });
      }
    }

    return {
      driveFileUrl: file.webViewLink || file.webContentLink || "",
      driveSyncError: "",
      driveSyncStatus: "synced"
    };
  } catch (error) {
    return {
      driveFileUrl: "",
      driveSyncError: error?.message || "Drive sync failed.",
      driveSyncStatus: "failed"
    };
  }
}

export function buildUserCsvBackupFileName(email) {
  return `${sanitizeFilePart(email, "member")}-master-log.csv`;
}
