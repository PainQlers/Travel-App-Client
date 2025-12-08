// /services/tripService.ts
import axios from "axios";
import type { Trip } from "../data/trips";

const api = axios.create({
  baseURL: "https://travel-app-server-ehuz.onrender.com/",
});

// เพิ่ม token ไปกับทุก request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // Debug: log token presence (remove in production)
  // eslint-disable-next-line no-console
  console.debug("tripService: request interceptor, token present:", !!token);
  if (token) {
    // ensure headers object exists
    if (!config.headers) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers = {};
    }
    // Attach Authorization header in a safe way
    // some axios versions use plain object or AxiosHeaders; set as string key to be safe
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Type สำหรับ API payload
export type TripApiPayload = {
  title: string;
  description: string;
  province?: string;
  photos?: string[];
  tags: string[];
  latitude: number | null;
  longitude: number | null;
  photosToUpload?: File[];
};

// Helper function to fix nested/malformed tags array
// Handles cases where tags are stored as nested arrays or stringified
function cleanTags(tags: any): string[] {
  if (!tags) return [];
  
  // If already a flat array of strings, return as-is
  if (Array.isArray(tags) && tags.every((t) => typeof t === "string")) {
    return tags;
  }

  // If nested array (e.g., [["tag1", "tag2"]])
  if (Array.isArray(tags)) {
    const flattened: string[] = [];
    tags.forEach((item) => {
      if (typeof item === "string") {
        // Try to parse if it looks like JSON
        if (item.startsWith("[") || item.startsWith('["')) {
          try {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
              flattened.push(...parsed);
            } else {
              flattened.push(item);
            }
          } catch {
            flattened.push(item);
          }
        } else {
          flattened.push(item);
        }
      } else if (Array.isArray(item)) {
        flattened.push(...item);
      }
    });
    return flattened;
  }

  return [];
}

export async function fetchTrips() {
  const res = await api.get<Trip[]>("/api/trips");
  // eslint-disable-next-line no-console
  console.log("API response:", res.data);
  
  // Debug: log photos field
  if (res.data && res.data.length > 0) {
    const firstTrip = res.data[0];
    // eslint-disable-next-line no-console
    console.log("First trip photos:", firstTrip?.photos);
    // eslint-disable-next-line no-console
    console.log("First trip photos type:", typeof firstTrip?.photos);
    // eslint-disable-next-line no-console
    console.log("First trip photos is array:", Array.isArray(firstTrip?.photos));
  }
  
  // Clean up malformed tags in response
  res.data = res.data.map((trip) => ({
    ...trip,
    tags: cleanTags(trip.tags),
  }));

  return res;
}

export async function fetchTrip(id: string) {
  const res = await api.get<Trip>(`/api/trips/${id}`);
  
  // Clean up malformed tags in response
  if (res.data && res.data.tags) {
    res.data.tags = cleanTags(res.data.tags);
  }

  return res;
}

export function createTrip(payload: TripApiPayload) {
  // สร้าง FormData สำหรับส่ง files และ data
  // Server จะกำหนด author_id จาก JWT token
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  if (payload.province) formData.append("province", payload.province);
  
  // Send tags as individual items (so @RequestParam can parse correctly)
  if (payload.tags && payload.tags.length > 0) {
    payload.tags.forEach((tag) => {
      formData.append("tags", tag);
    });
  }
  
  formData.append("latitude", String(payload.latitude ?? ""));
  formData.append("longitude", String(payload.longitude ?? ""));
  
  // เพิ่มไฟล์ถ้ามี
  if (payload.photosToUpload && payload.photosToUpload.length > 0) {
    // eslint-disable-next-line no-console
    console.debug("createTrip: uploading files, count:", payload.photosToUpload.length);
    payload.photosToUpload.forEach((file) => {
      // eslint-disable-next-line no-console
      console.debug("createTrip: appending file:", file.name, "size:", file.size);
      // server expects multipart files under param name 'files'
      formData.append("files", file);
    });
  } else {
    // eslint-disable-next-line no-console
    console.warn("createTrip: no files to upload");
  }
  
  // eslint-disable-next-line no-console
  console.debug("createTrip FormData entries:", Array.from((formData as any).entries()).map((e: any) => [e[0], e[1] instanceof File ? `File: ${e[1].name}` : e[1]]));

  // Do NOT set Content-Type header explicitly for FormData; the browser
  // will set the correct multipart boundary for us.
  return api.post<Trip>("/api/trips/with-files", formData);
}

export function updateTrip(id: string, payload: TripApiPayload) {
  // If there are files to upload, use FormData (multipart). Otherwise send JSON.
  if (payload.photosToUpload && payload.photosToUpload.length > 0) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    if (payload.province) formData.append("province", payload.province);

    // Send tags as individual items (so @RequestParam can parse correctly)
    if (payload.tags && payload.tags.length > 0) {
      payload.tags.forEach((tag) => {
        formData.append("tags", tag);
      });
    }

    formData.append("latitude", String(payload.latitude ?? ""));
    formData.append("longitude", String(payload.longitude ?? ""));

    // เก็บ URLs ของรูปที่มีอยู่ (ถ้ามี)
    if (payload.photos && payload.photos.length > 0) {
      formData.append("existingPhotos", JSON.stringify(payload.photos));
    }

    // เพิ่มไฟล์ใหม่
    payload.photosToUpload.forEach((file) => {
      formData.append("files", file);
    });

    // Debug: print FormData entries to help server-side debugging
    try {
      // eslint-disable-next-line no-console
      console.debug("updateTrip FormData entries:", Array.from((formData as any).entries()).map((e: any) => [e[0], e[1] instanceof File ? `File: ${e[1].name}` : e[1]]));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug("updateTrip: unable to enumerate FormData entries");
    }

    // Let the browser set the Content-Type (with boundary) for FormData
    return api.put(`/api/trips/${id}`, formData);
  }

  // No files: send JSON body to avoid multipart Content-Type issues on server
  const body: any = {
    title: payload.title,
    description: payload.description,
    province: payload.province,
    tags: payload.tags,
    latitude: payload.latitude,
    longitude: payload.longitude,
    existingPhotos: payload.photos || [],
  };

  // Explicitly set Content-Type application/json for this request
  return api.put(`/api/trips/${id}`, body, {
    headers: { "Content-Type": "application/json" },
  });
}

export function deleteTrip(id: string) {
  return api.delete(`/api/trips/${id}`);
}
