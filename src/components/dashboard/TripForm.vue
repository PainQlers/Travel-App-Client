<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { Trip } from "../../data/trips";

const props = defineProps<{
  trip?: Trip | null;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    payload: {
      name: string;
      province: string;
      description: string;
      categories: string[];
      images: string[];
      latitude: number | null;
      longitude: number | null;
      files?: File[];
    }
  ): void;
}>();

const form = reactive({
  name: "",
  province: "",
  description: "",
  categories: "",
  latitude: "",
  longitude: "",
});

const selectedFiles = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const maxImages = 4;

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files) return;

  const newFiles = Array.from(files);
  const totalFiles = imagePreviews.value.length + newFiles.length;

  if (totalFiles > maxImages) {
    alert(`สามารถเลือกรูปได้สูงสุด ${maxImages} รูป`);
    // เลือกเฉพาะจำนวนที่เหลือได้
    const remaining = maxImages - imagePreviews.value.length;
    if (remaining > 0) {
      newFiles.splice(remaining);
    } else {
      target.value = "";
      return;
    }
  }

  // สร้าง preview URLs และเก็บไฟล์
  newFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        imagePreviews.value.push(result);
        selectedFiles.value.push(file);
      }
    };
    reader.readAsDataURL(file);
  });

  // Reset input เพื่อให้สามารถเลือกไฟล์เดิมได้อีกครั้ง
  target.value = "";
}

function removeImage(index: number) {
  imagePreviews.value.splice(index, 1);
  // ลบไฟล์ที่ตำแหน่งเดียวกัน (ถ้ามี)
  if (index < selectedFiles.value.length) {
    selectedFiles.value.splice(index, 1);
  }
}

// Function เพื่อ extract latitude และ longitude จาก mapEmbedUrl
function extractLatLngFromMapUrl(url: string): { lat: number | null; lng: number | null } {
  if (!url) return { lat: null, lng: null };
  
  // ลองหา latitude และ longitude จาก URL pattern
  // Pattern: !3d{latitude} และ !2d{longitude}
  const latMatch = url.match(/!3d([+-]?[0-9]*\.?[0-9]+)/);
  const lngMatch = url.match(/!2d([+-]?[0-9]*\.?[0-9]+)/);
  
  if (latMatch && lngMatch && latMatch[1] && lngMatch[1]) {
    return {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1]),
    };
  }
  
  return { lat: null, lng: null };
}

watch(
  () => props.trip,
  (trip) => {
    if (!trip) {
      Object.assign(form, {
        name: "",
        province: "",
        description: "",
        categories: "",
        latitude: "",
        longitude: "",
      });
      selectedFiles.value = [];
      imagePreviews.value = [];
      return;
    }
    form.name = trip.title;
    form.province = trip.province;
    form.description = trip.description;
    // Exclude the first tag (index 0) when populating categories for editing
    if (trip.tags && trip.tags.length > 1) {
      form.categories = trip.tags.slice(1).join(", ");
    } else {
      form.categories = "";
    }
    
    // Extract latitude และ longitude จาก mapEmbedUrl
    const { lat, lng } = extractLatLngFromMapUrl(trip.mapEmbedUrl);
    form.latitude = lat !== null ? String(lat) : "";
    form.longitude = lng !== null ? String(lng) : "";
    
    // ถ้าเป็นโหมดแก้ไข ให้โหลดรูปเดิมจาก URLs
    if (trip.photos && trip.photos.length > 0) {
      imagePreviews.value = [...trip.photos];
      // ไม่ต้องเก็บไฟล์สำหรับรูปเดิม เพราะเป็น URLs อยู่แล้ว
      selectedFiles.value = [];
    } else {
      selectedFiles.value = [];
      imagePreviews.value = [];
    }
  },
  { immediate: true }
);

function handleSubmit() {
  // ใช้ preview URLs ทั้งหมด (รวมทั้งรูปใหม่และรูปเดิม)
  const imageUrls = imagePreviews.value;

  // แปลง latitude และ longitude เป็น number หรือ null
  const latitudeStr = typeof form.latitude === 'string' ? form.latitude : String(form.latitude || '');
  const longitudeStr = typeof form.longitude === 'string' ? form.longitude : String(form.longitude || '');
  const latitude = latitudeStr.trim() ? parseFloat(latitudeStr.trim()) : null;
  const longitude = longitudeStr.trim() ? parseFloat(longitudeStr.trim()) : null;

  emit("submit", {
    name: form.name.trim(),
    province: form.province.trim(),
    description: form.description.trim(),
    categories: form.categories
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    images: imageUrls,
    latitude: latitude,
    longitude: longitude,
    files: selectedFiles.value,
  });
}
</script>

<template>
  <form
    class="space-y-4 rounded-3xl bg-white p-6 shadow-card"
    @submit.prevent="handleSubmit"
  >

    <div>
      <label class="text-sm font-semibold text-slate-600">ชื่อทริป</label>
      <input
        v-model="form.name"
        type="text"
        required
        class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="text-sm font-semibold text-slate-600">จังหวัด</label>
        <input
          v-model="form.province"
          type="text"
          required
          class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      <div>
        <label class="text-sm font-semibold text-slate-600">หมวดหมู่ (คั่นด้วย ,)</label>
        <input
          v-model="form.categories"
          type="text"
          placeholder="ทะเล, จุดถ่ายรูป"
          class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
    </div>

    <div>
      <label class="text-sm font-semibold text-slate-600">รายละเอียด</label>
      <textarea
        v-model="form.description"
        rows="5"
        required
        class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>

    <div>
      <label class="text-sm font-semibold text-slate-600">
        ภาพประกอบ (สูงสุด {{ maxImages }} รูป)
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        :disabled="imagePreviews.length >= maxImages"
        @change="handleFileSelect"
        class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3
              focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30
              disabled:bg-slate-100 disabled:cursor-not-allowed"
      />
      <p v-if="imagePreviews.length >= maxImages" class="mt-1 text-xs text-rose-600">
        ถึงขีดจำกัดสูงสุด {{ maxImages }} รูปแล้ว
      </p>
      <p v-else class="mt-1 text-xs text-slate-500">
        เลือกได้อีก {{ maxImages - imagePreviews.length }} รูป
      </p>

      <!-- Preview Images -->
      <div v-if="imagePreviews.length > 0" class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="(preview, index) in imagePreviews"
          :key="index"
          class="relative group"
        >
          <img
            :src="preview"
            :alt="`Preview ${index + 1}`"
            class="h-32 w-full rounded-xl object-cover border-2 border-slate-200"
          />
          <button
            type="button"
            @click="removeImage(index)"
            class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-600"
            title="ลบรูป"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="text-sm font-semibold text-slate-600">Latitude</label>
        <input
          v-model="form.latitude"
          type="number"
          step="any"
          placeholder="18.7883"
          class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      <div>
        <label class="text-sm font-semibold text-slate-600">Longitude</label>
        <input
          v-model="form.longitude"
          type="number"
          step="any"
          placeholder="98.9853"
          class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
    </div>

    <button
      type="submit"
      class="w-full rounded-2xl bg-brand px-4 py-3 text-center text-base font-semibold text-white shadow-card transition hover:bg-brand-dark"
    >
      {{ submitLabel ?? "บันทึกทริป" }}
    </button>
  </form>
</template>

