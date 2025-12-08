<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useTripStore } from "../stores/trips";
import { useAuthStore } from "../stores/auth";
import TripForm from "../components/dashboard/TripForm.vue";
import TripCard from "../components/TripCard.vue";
import type { Trip } from "../data/trips";

const tripStore = useTripStore();
const auth = useAuthStore();

onMounted(async () => {
  // Ensure profile is restored before loading trips so authorId is available
  await auth.restoreUser();
  if (!tripStore.isLoaded) {
    await tripStore.loadTrips();
  }
});

const editingTrip = ref<Trip | null>(null);
const message = ref("");
const error = ref("");

const userTrips = computed(() =>
  tripStore.trips.filter((trip) => trip.authorId === auth.currentUser?.id)
);

async function handleCreate(payload: {
  name: string;
  province: string;
  description: string;
  categories: string[];
  images: string[];
  latitude: number | null;
  longitude: number | null;
  files?: File[];
}) {
  try {
    error.value = "";
    message.value = "";
    
    // แปลง payload จาก TripForm format เป็น TripFormPayload format
    const tripPayload = {
      title: payload.name,
      province: payload.province,
      description: payload.description,
      tags: [payload.province, ...payload.categories],
      photos: payload.images, // data URLs ของรูปเดิม
      photosToUpload: payload.files, // ไฟล์ใหม่ที่เลือก
      latitude: payload.latitude,
      longitude: payload.longitude,
    };
    
    if (editingTrip.value) {
      await tripStore.updateTrip(editingTrip.value.id, tripPayload);
      message.value = "อัปเดตทริปเรียบร้อยแล้ว";
      editingTrip.value = null;
    } else {
      // Server handles author_id from JWT token
      await tripStore.createTrip(tripPayload);
      message.value = "สร้างทริปใหม่สำเร็จ";
    }
  } catch (err) {
    error.value = (err as Error).message;
    console.error("Error in handleCreate:", err);
  }
}

function handleEdit(trip: Trip) {
  editingTrip.value = trip;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleDelete(id: string) {
  if (!confirm("ยืนยันการลบทริปนี้หรือไม่?")) {
    return;
  }
  try {
    await tripStore.deleteTrip(id);
    message.value = "ลบทริปเรียบร้อย";
  } catch (err) {
    error.value = (err as Error).message;
    console.error("Error in handleDelete:", err);
  }
}

function resetEditing() {
  editingTrip.value = null;
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <div class="rounded-[40px] bg-white p-10 shadow-card">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-[0.4em] text-slate-400">Dashboard</p>
          <h1 class="text-3xl font-bold text-slate-900">จัดการทริป</h1>
          <p class="text-slate-500">
            คุณสามารถสร้าง ดู แก้ไข และลบทริปที่คุณสร้างไว้ได้ที่นี่
          </p>
        </div>
        <div class="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-600">
          {{ auth.currentUser?.email }}
        </div>
      </header>

      <div class="mt-6 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900">
              {{ editingTrip ? "แก้ไขทริป" : "สร้างทริปใหม่" }}
            </h2>
            <button
              v-if="editingTrip"
              type="button"
              class="text-sm font-semibold text-brand"
              @click="resetEditing"
            >
              + สร้างทริปใหม่
            </button>
          </div>

          <p v-if="message" class="mt-4 text-sm font-semibold text-emerald-600">
            {{ message }}
          </p>
          <p v-if="error" class="mt-4 text-sm font-semibold text-rose-600">
            {{ error }}
          </p>

          <div class="mt-4">
            <TripForm
              :trip="editingTrip"
              :submit-label="editingTrip ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างทริป'"
              @submit="handleCreate"
            />
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-slate-900">
            ทริปของฉัน ({{ userTrips.length }})
          </h2>
          <p v-if="!userTrips.length" class="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">
            เริ่มแชร์ทริปแรกของคุณได้เลย!
          </p>

          <div class="space-y-4">
            <TripCard
              v-for="trip in userTrips"
              :key="trip.id"
              :trip="trip"
              :show-owner="false"
              :show-actions="true"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

