import { getRequest, putRequest } from "./api";

export async function loadDailyEntries() {
  try {
    const response = await getRequest("/progress");
    return response.entriesByDate;
  } catch (_error) {
    return {};
  }
}

export async function saveDailyEntry(dateKey, entry) {
  const response = await putRequest(`/progress/${dateKey}`, { entry });
  return response.entry;
}

export async function upsertDailyEntry(dateKey, nextFields) {
  return saveDailyEntry(dateKey, nextFields);
}

export async function loadPhotoEntries() {
  try {
    const response = await getRequest("/photos");
    return response.photos;
  } catch (_error) {
    return [];
  }
}
