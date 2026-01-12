<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { THAI_PROVINCES } from "../../data/thai-provinces";
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

const errors = reactive({
  name: "",
  description: "",
  province: "",
  categories: "",
  latitude: "",
  longitude: "",
});

const touched = reactive({
  name: false,
  description: false,
  province: false,
  categories: false,
  latitude: false,
  longitude: false,
});

const MIN_NAME_LENGTH = 20;
const MIN_DESCRIPTION_LENGTH = 150;

function validate() {
  errors.name = "";
  errors.description = "";
  errors.province = "";
  errors.categories = "";
  errors.latitude = "";
  errors.longitude = "";

  const name = (form.name || "").trim();
  const description = (form.description || "").trim();

  if (name.length < MIN_NAME_LENGTH) {
    errors.name = `ชื่อทริปต้องมีอย่างน้อย ${MIN_NAME_LENGTH} ตัวอักษร`;
  }

  if (description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `รายละเอียดต้องมีอย่างน้อย ${MIN_DESCRIPTION_LENGTH} ตัวอักษร`;
  }

  // validate province as well
  if (!validateProvince()) {
    // errors.province is set by validateProvince
  }

  // validate categories
  if (!validateCategories()) {
    // errors.categories set in validateCategories
  }

  // validate latitude/longitude
  validateLatitude();
  validateLongitude();

  return !errors.name && !errors.description && !errors.province && !errors.categories && !errors.latitude && !errors.longitude;
}

function validateProvince() {
  errors.province = "";
  const value = (form.province || "").trim();
  if (!value) {
    errors.province = "กรุณาเลือกจังหวัด";
    return false;
  }

  // Exact case-insensitive match
  const exact = THAI_PROVINCES.find((p) => p.toLowerCase() === value.toLowerCase());
  if (exact) {
    form.province = exact; // normalize
    return true;
  }

  // Try contains match (user typed part of province)
  const contains = THAI_PROVINCES.find((p) => p.toLowerCase().includes(value.toLowerCase()) || value.toLowerCase().includes(p.toLowerCase()));
  if (contains) {
    form.province = contains; // normalize to canonical name
    return true;
  }

  errors.province = "กรุณาเลือกจังหวัดจากรายการ";
  return false;
}

// Show validation messages when the user interacts with inputs
function validateName() {
  errors.name = "";
  const name = (form.name || "").trim();
  if (name.length < MIN_NAME_LENGTH) {
    errors.name = `ชื่อทริปต้องมีอย่างน้อย ${MIN_NAME_LENGTH} ตัวอักษร`;
    return false;
  }
  return true;
}

function validateDescription() {
  errors.description = "";
  const description = (form.description || "").trim();
  if (description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `รายละเอียดต้องมีอย่างน้อย ${MIN_DESCRIPTION_LENGTH} ตัวอักษร`;
    return false;
  }
  return true;
}

function validateCategories() {
  errors.categories = "";
  const raw = (form.categories || "").trim();
  if (!raw) {
    errors.categories = "กรุณากรอกหมวดหมู่อย่างน้อย 1 รายการ";
    return false;
  }
  const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (arr.length === 0) {
    errors.categories = "กรุณากรอกหมวดหมู่อย่างน้อย 1 รายการ";
    return false;
  }
  return true;
}

function validateLatitude() {
  errors.latitude = "";
  const val = (form.latitude ?? "").toString().trim();
  if (!val) {
    errors.latitude = "กรุณากรอกค่า Latitude";
    return false;
  }
  const n = Number(val);
  if (Number.isNaN(n)) {
    errors.latitude = "Latitude ต้องเป็นตัวเลข";
    return false;
  }
  if (n < -90 || n > 90) {
    errors.latitude = "Latitude ต้องอยู่ระหว่าง -90 ถึง 90";
    return false;
  }
  return true;
}

function validateLongitude() {
  errors.longitude = "";
  const val = (form.longitude ?? "").toString().trim();
  if (!val) {
    errors.longitude = "กรุณากรอกค่า Longitude";
    return false;
  }
  const n = Number(val);
  if (Number.isNaN(n)) {
    errors.longitude = "Longitude ต้องเป็นตัวเลข";
    return false;
  }
  if (n < -180 || n > 180) {
    errors.longitude = "Longitude ต้องอยู่ระหว่าง -180 ถึง 180";
    return false;
  }
  return true;
}

// Province dropdown state & helpers (custom dropdown to match input width)
const showProvinceDropdown = ref(false);
const provinceInputRef = ref<HTMLInputElement | null>(null);
const provinceDropdownRef = ref<HTMLElement | null>(null);
const highlightedIndex = ref<number>(-1);

const filteredProvinces = computed(() => {
  const q = (form.province || "").trim().toLowerCase();
  if (!q) return THAI_PROVINCES.slice();
  return THAI_PROVINCES.filter((p) => p.toLowerCase().includes(q));
});

function onProvinceFocus() {
  showProvinceDropdown.value = true;
  highlightedIndex.value = -1;
}

function onProvinceInput() {
  showProvinceDropdown.value = true;
  highlightedIndex.value = -1;
}

function selectProvince(p: string) {
  form.province = p;
  showProvinceDropdown.value = false;
  touched.province = true;
  validateProvince();
}

function highlightNext() {
  const len = filteredProvinces.value.length;
  if (len === 0) return;
  highlightedIndex.value = (highlightedIndex.value + 1 + len) % len;
}

function highlightPrev() {
  const len = filteredProvinces.value.length;
  if (len === 0) return;
  highlightedIndex.value = (highlightedIndex.value - 1 + len) % len;
}

function selectHighlighted() {
  const idx = highlightedIndex.value;
  if (idx >= 0 && idx < filteredProvinces.value.length) {
    selectProvince(filteredProvinces.value[idx]);
  } else if (filteredProvinces.value.length === 1) {
    selectProvince(filteredProvinces.value[0]);
  } else {
    // No selection, validate current text
    touched.province = true;
    validateProvince();
    showProvinceDropdown.value = false;
  }
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (
    provinceInputRef.value && provinceDropdownRef.value &&
    !provinceInputRef.value.contains(target as Node) &&
    !provinceDropdownRef.value.contains(target as Node)
  ) {
    showProvinceDropdown.value = false;
    // validate on close
    touched.province = true;
    validateProvince();
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));

// validate on changes only when the user has already interacted with the field
watch(
  () => form.name,
  () => {
    if (touched.name) validateName();
  }
);

watch(
  () => form.description,
  () => {
    if (touched.description) validateDescription();
  }
);

watch(
  () => form.categories,
  () => {
    if (touched.categories) validateCategories();
  }
);

watch(
  () => form.latitude,
  () => {
    if (touched.latitude) validateLatitude();
  }
);

watch(
  () => form.longitude,
  () => {
    if (touched.longitude) validateLongitude();
  }
);

const isValid = computed(() => {
  const name = (form.name || "").trim();
  const description = (form.description || "").trim();
  const categoriesOk = (form.categories || "").split(",").map(s => s.trim()).filter(Boolean).length > 0;
  const latVal = (form.latitude ?? "").toString().trim();
  const lngVal = (form.longitude ?? "").toString().trim();
  const latOk = latVal !== "" && !Number.isNaN(Number(latVal));
  const lngOk = lngVal !== "" && !Number.isNaN(Number(lngVal));
  const provinceVal = (form.province || "").trim();
  const provinceOk = provinceVal ? THAI_PROVINCES.some(p => p.toLowerCase() === provinceVal.toLowerCase() || p.toLowerCase().includes(provinceVal.toLowerCase()) || provinceVal.toLowerCase().includes(p.toLowerCase())) : false;
  return name.length >= MIN_NAME_LENGTH && description.length >= MIN_DESCRIPTION_LENGTH && categoriesOk && latOk && lngOk && provinceOk;
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
  // Validate inputs first
  // mark touched so errors are visible after submit attempt
  touched.name = true;
  touched.description = true;
  touched.province = true;
  touched.categories = true;
  touched.latitude = true;
  touched.longitude = true;

  if (!validate()) {
    // prevent submission if validation fails
    return;
  }

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
        @blur="() => { touched.name = true; validateName(); }"
        class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <p v-if="touched.name && errors.name" class="mt-1 text-xs text-rose-600">{{ errors.name }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div>
          <label class="text-sm font-semibold text-slate-600">จังหวัด</label>
          <!-- Custom dropdown (matches input width) -->
          <div class="relative">
            <input
              v-model="form.province"
              ref="provinceInputRef"
              type="text"
              placeholder="พิมพ์เพื่อค้นหาหรือเลือกจังหวัด"
              required
              @focus="onProvinceFocus"
              @input="onProvinceInput"
              @keydown.down.prevent="highlightNext"
              @keydown.up.prevent="highlightPrev"
              @keydown.enter.prevent="selectHighlighted"
              class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />

            <ul
              v-if="showProvinceDropdown && filteredProvinces.length > 0"
              ref="provinceDropdownRef"
              class="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl border bg-white shadow-lg"
            >
              <li
                v-for="(p, idx) in filteredProvinces"
                :key="p"
                @mousedown.prevent="() => selectProvince(p)"
                @mousemove="() => highlightedIndex = idx"
                :class="['px-4 py-2 text-sm cursor-pointer', highlightedIndex === idx ? 'bg-slate-100' : '']"
              >
                {{ p }}
              </li>
            </ul>
          </div>
          <p v-if="touched.province && errors.province" class="mt-1 text-xs text-rose-600">{{ errors.province }}</p>
      </div>
      <div>
        <label class="text-sm font-semibold text-slate-600">หมวดหมู่ (คั่นด้วย ,)</label>
        <input
          v-model="form.categories"
          type="text"
          placeholder="ทะเล, จุดถ่ายรูป"
          @blur="() => { touched.categories = true; validateCategories(); }"
          class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p v-if="touched.categories && errors.categories" class="mt-1 text-xs text-rose-600">{{ errors.categories }}</p>
      </div>
    </div>

    <div>
      <label class="text-sm font-semibold text-slate-600">รายละเอียด</label>
      <textarea
        v-model="form.description"
        rows="5"
        required
        @blur="() => { touched.description = true; validateDescription(); }"
        class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <p v-if="touched.description && errors.description" class="mt-1 text-xs text-rose-600">{{ errors.description }}</p>
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
          @blur="() => { touched.latitude = true; validateLatitude(); }"
          class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p v-if="touched.latitude && errors.latitude" class="mt-1 text-xs text-rose-600">{{ errors.latitude }}</p>
      </div>
      <div>
        <label class="text-sm font-semibold text-slate-600">Longitude</label>
        <input
          v-model="form.longitude"
          type="number"
          step="any"
          placeholder="98.9853"
          @blur="() => { touched.longitude = true; validateLongitude(); }"
          class="mt-1 w-full rounded-2xl border border-slate-400 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p v-if="touched.longitude && errors.longitude" class="mt-1 text-xs text-rose-600">{{ errors.longitude }}</p>
      </div>
    </div>

    <button
      type="submit"
      :disabled="!isValid"
      class="w-full rounded-2xl bg-brand px-4 py-3 text-center text-base font-semibold text-white shadow-card transition hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ submitLabel ?? "บันทึกทริป" }}
    </button>
  </form>
</template>

