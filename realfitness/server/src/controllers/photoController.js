import Photo from "../models/Photo.js";
import { requireCurrentUser } from "../services/authService.js";

export async function getPhotos(request, response) {
  const user = await requireCurrentUser(request);
  const photos = await Photo.find({ user: user._id }).sort({ date: -1 }).lean();

  response.json({
    photos: photos.map((photo) => ({
      date: photo.date,
      driveFileUrl: photo.driveFileUrl || "",
      driveSyncError: photo.driveSyncError || "",
      driveSyncStatus: photo.driveSyncStatus || "not_configured",
      title: photo.title || "Daily photo",
      notes: photo.notes || "",
      meals: photo.meals || "",
      photoDataUrl: photo.photoDataUrl,
      photoName: photo.photoName || "photo"
    }))
  });
}
