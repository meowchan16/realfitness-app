import DailyProgressEntry from "../models/DailyProgressEntry.js";
import Photo from "../models/Photo.js";
import { requireCurrentUser } from "../services/authService.js";
import {
  buildUserCsvBackupFileName,
  syncCsvBackupToGoogleDrive,
  syncPhotoToGoogleDrive
} from "../services/googleDriveService.js";

export async function getProgressEntries(request, response) {
  const user = await requireCurrentUser(request);
  const entries = await DailyProgressEntry.find({ user: user._id }).lean();

  const entriesByDate = entries.reduce((accumulator, entry) => {
    accumulator[entry.date] = serializeEntry(entry);
    return accumulator;
  }, {});

  response.json({
    entriesByDate
  });
}

export async function getProgressEntryByDate(request, response) {
  const user = await requireCurrentUser(request);
  const { date } = request.params;
  const entry = await DailyProgressEntry.findOne({ user: user._id, date }).lean();

  response.json({
    date,
    entry: entry ? serializeEntry(entry) : null
  });
}

export async function updateProgressEntry(request, response) {
  const user = await requireCurrentUser(request);
  const { date } = request.params;
  const entryInput = request.body?.entry;

  if (!entryInput || typeof entryInput !== "object") {
    response.status(400).json({ message: "A valid entry object is required." });
    return;
  }

  const entry = await DailyProgressEntry.findOneAndUpdate(
    { user: user._id, date },
    { ...entryInput, date },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (entry.photoDataUrl) {
    const driveBackup = await syncPhotoToGoogleDrive({
      user,
      date,
      existingDriveFileId: entry.driveFileId,
      photoDataUrl: entry.photoDataUrl,
      photoName: entry.photoName,
      title: entry.title
    });

    entry.driveFileId = driveBackup.driveFileId;
    entry.driveFileUrl = driveBackup.driveFileUrl;
    entry.driveSyncStatus = driveBackup.driveSyncStatus;
    entry.driveSyncError = driveBackup.driveSyncError;
    await entry.save();

    await Photo.findOneAndUpdate(
      { user: user._id, date },
      {
        date,
        driveFileId: entry.driveFileId,
        driveFileUrl: entry.driveFileUrl,
        driveSyncError: entry.driveSyncError,
        driveSyncStatus: entry.driveSyncStatus,
        title: entry.title || "Daily photo",
        notes: entry.notes || "",
        meals: entry.meals || "",
        photoDataUrl: entry.photoDataUrl,
        photoName: entry.photoName || "photo",
        progressEntry: entry._id
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } else {
    await Photo.findOneAndDelete({ user: user._id, date });
  }

  const allEntries = await DailyProgressEntry.find({ user: user._id }).sort({ date: 1 }).lean();
  let csvText = "Date,Title,Workout,Meals,Tasks Completed,Notes\n";

  for (const row of allEntries) {
    const d = row.date || "";
    const t = (row.title || "").replace(/"/g, '""');
    const w = (row.workout || "").replace(/"/g, '""');
    const m = (row.meals || "").replace(/"/g, '""');
    const c = (row.completedTasks || []).join("; ").replace(/"/g, '""');
    const n = (row.notes || "").replace(/"/g, '""');
    csvText += `"${d}","${t}","${w}","${m}","${c}","${n}"\n`;
  }

  await syncCsvBackupToGoogleDrive({
    user,
    fileName: buildUserCsvBackupFileName(user.email),
    csvText
  });

  const serializedEntry = serializeEntry(entry.toObject());
  response.json({
    date,
    entry: serializedEntry
  });
}

function serializeEntry(entry) {
  return {
    driveFileUrl: entry.driveFileUrl || "",
    driveSyncError: entry.driveSyncError || "",
    driveSyncStatus: entry.driveSyncStatus || "not_configured",
    title: entry.title || "",
    workout: entry.workout || "",
    completedTasks: entry.completedTasks || [],
    meals: entry.meals || "",
    notes: entry.notes || "",
    photoDataUrl: entry.photoDataUrl || "",
    photoName: entry.photoName || ""
  };
}
