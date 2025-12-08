import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Trip } from "../data/trips";
import { useAuthStore } from "./auth";
import * as tripService from "../services/tripService";
import { THAI_PROVINCES } from "../data/thai-provinces";


export type TripFormPayload = {
  title: string;
  province: string;
  description: string;
  tags: string[];
  photos: string[];
  latitude: number | null;
  longitude: number | null;
};

export const useTripStore = defineStore("trips", () => {
  const trips = ref<Trip[]>([]);
  const isLoaded = ref(false);
  const auth = useAuthStore();

  const provinces = computed(() => {
    const fromTrips = trips.value.map((trip) => trip.province);
  
    return Array.from(
      new Set([
        ...THAI_PROVINCES, // รายชื่อจังหวัดไทยทั้งหมด
        ...fromTrips       // จังหวัดที่ถูกดึงมาจาก trips
      ])
    ).sort();
  });

  async function loadTrips() {
    const { data } = await tripService.fetchTrips();
    // แปลงข้อมูลจาก API ให้ตรงกับ interface Trip
    trips.value = data.map((item: any) => {
      // หา province จาก tags (เช่น "ตราด" ใน tags)
      const provinceTags = item.tags?.filter((tag: string) => 
        THAI_PROVINCES.some((p: string) => tag.includes(p))
      ) || [];
      const province = provinceTags[0] || item.province || "ไม่ระบุ";
      
      // Debug: log photos to see what backend sends
      // eslint-disable-next-line no-console
      console.log(`Trip "${item.title}" photos from API:`, item.photos);
      
      // สร้าง mapEmbedUrl จาก latitude/longitude
      const mapEmbedUrl = item.mapEmbedUrl || 
        (item.latitude && item.longitude 
          ? `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${item.longitude}!3d${item.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sth!4v0`
          : "");
      
      return {
        id: String(item.id), // แปลง id จาก number เป็น string
        title: item.title || "",
        province: province,
        description: item.description || "",
        tags: item.tags || [],
        photos: item.photos || [],
        mapEmbedUrl: mapEmbedUrl,
        authorId: String(item.authorId || "system"),
        ownerEmail: item.ownerEmail || "",
      } as Trip;
    });
    isLoaded.value = true;
  }

  async function createTrip(payload: TripFormPayload) {
    if (!auth.currentUser) {
      throw new Error("จำเป็นต้องเข้าสู่ระบบ");
    }
    
    try {
      // ส่งข้อมูลไป API (server กำหนด author_id จาก JWT)
      const { data } = await tripService.createTrip(payload);
      
      // แปลงข้อมูลที่ได้จาก API ให้ตรงกับ Trip interface
      const newTrip: Trip = {
        id: String(data.id),
        title: data.title || payload.title,
        province: payload.province,
        description: data.description || payload.description,
        tags: data.tags || payload.tags,
        photos: data.photos && data.photos.length > 0 ? data.photos : payload.photos,
        mapEmbedUrl: data.mapEmbedUrl || 
          (payload.latitude && payload.longitude
            ? `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${payload.longitude}!3d${payload.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sth!4v0`
            : ""),
        authorId: String(data.authorId || auth.currentUser.id),
        ownerEmail: data.ownerEmail || auth.currentUser.email,
      };
      
      // เพิ่มใน local state
      trips.value.unshift(newTrip);
      return newTrip;
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  }

  async function updateTrip(id: string, payload: TripFormPayload) {
    if (!auth.currentUser) {
      throw new Error("จำเป็นต้องเข้าสู่ระบบ");
    }
    
    const index = trips.value.findIndex((trip) => trip.id === id);
    if (index === -1) {
      throw new Error("ไม่พบทริป");
    }
    const current = trips.value[index];
    if (!current) {
      throw new Error("ไม่พบทริป");
    }
    if (current.authorId !== auth.currentUser.id) {
      throw new Error("ไม่สามารถแก้ไขทริปของผู้อื่น");
    }
    
    try {
      // ส่งข้อมูลไป API (เฉพาะที่ API ต้องการ)
      const apiPayload: tripService.TripApiPayload = {
        title: payload.title,
        description: payload.description,
        photos: payload.photos,
        tags: payload.tags,
        latitude: payload.latitude,
        longitude: payload.longitude,
      };
      
      const { data } = await tripService.updateTrip(id, apiPayload);
      
      // อัปเดตข้อมูลใน local state
      // Determine province: prefer payload.province, but if it's empty or "ไม่ระบุ",
      // fall back to the first tag (if available), then current.province, then default.
      let updatedProvince: string = payload.province ?? "";
      if (!updatedProvince || String(updatedProvince).trim() === "" || updatedProvince === "ไม่ระบุ") {
        const possibleTags: string[] = (data && data.tags) || payload.tags || current.tags || [];
        updatedProvince = possibleTags.length > 0 ? possibleTags[0]! : (current.province || "ไม่ระบุ");
      }

      const updatedTrip: Trip = {
        ...current,
        title: data.title || payload.title,
        province: updatedProvince, // เก็บไว้ใน local state
        description: data.description || payload.description,
        tags: data.tags || payload.tags,
        photos: data.photos && data.photos.length > 0 ? data.photos : payload.photos,
        mapEmbedUrl: data.mapEmbedUrl || 
          (payload.latitude && payload.longitude
            ? `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${payload.longitude}!3d${payload.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sth!4v0`
            : current.mapEmbedUrl),
      };
      
      trips.value[index] = updatedTrip;
    } catch (error) {
      // Log detailed axios error info when available to help debugging
      // eslint-disable-next-line no-console
      console.error("Error updating trip:", error);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        if (err.response) {
          // eslint-disable-next-line no-console
          console.error("updateTrip response status:", err.response.status);
          // eslint-disable-next-line no-console
          console.error("updateTrip response data:", err.response.data);
        }
      } catch (e) {
        // ignore logging errors
      }
      throw error;
    }
  }

  async function deleteTrip(id: string) {
    if (!auth.currentUser) {
      throw new Error("จำเป็นต้องเข้าสู่ระบบ");
    }
    const trip = trips.value.find((t) => t.id === id);
    if (!trip) {
      return;
    }
    if (trip.authorId !== auth.currentUser.id) {
      throw new Error("ไม่สามารถลบทริปของผู้อื่น");
    }
    
    try {
      // ส่งคำขอลบไป API
      await tripService.deleteTrip(id);
      
      // ลบออกจาก local state
      trips.value = trips.value.filter((t) => t.id !== id);
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  }

  function getTrip(id: string | number) {
    const idStr = String(id);
    return trips.value.find((t) => String(t.id) === idStr) ?? null;
  }

  return {
    trips,
    provinces,
    createTrip,
    updateTrip,
    deleteTrip,
    getTrip,
    loadTrips,
    isLoaded,
  };
});

