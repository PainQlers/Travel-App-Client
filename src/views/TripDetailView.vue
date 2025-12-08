<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTripStore } from "../stores/trips";

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();

const trip = computed(() =>
  tripStore.getTrip(route.params.id as string)
);

onMounted(async () => {
  // ถ้ายังไม่ได้โหลดทริป ให้โหลดจาก API ก่อน
  if (!tripStore.isLoaded) {
    await tripStore.loadTrips();
  }

  // ถ้าโหลดแล้วแต่ยังไม่พบทริป (id ไม่ถูกต้อง) ค่อย redirect กลับหน้าแรก
  if (!trip.value) {
    router.replace({ name: "home" });
  }
});
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-10 md:px-6" v-if="trip">
    <button
      class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand"
      type="button"
      @click="$router.back()"
    >
      ← กลับสู่หน้าหลัก
    </button>

    <div class="rounded-[40px] bg-white p-10 shadow-card">
      <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
        {{ trip.province }}
      </p>
      <h1 class="mt-2 text-4xl font-bold text-slate-900">
        {{ trip.title }}
      </h1>
      <p class="mt-3 text-sm text-slate-500">
        โดย {{ trip.ownerEmail }}
      </p>

      <div class="mt-8 grid gap-4 md:grid-cols-4">
        <img
          v-for="(image, index) in trip.photos"
          :key="index"
          :src="image"
          :alt="trip.title"
          class="h-48 w-full rounded-3xl object-cover"
        />
      </div>

      <div class="mt-8 grid gap-10 md:grid-cols-[3fr,2fr]">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">รายละเอียดทริป</h2>
          <p class="mt-4 whitespace-pre-line text-lg leading-relaxed text-slate-600">
            {{ trip.description }}
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <span
              v-for="category in trip.tags"
              :key="category"
              class="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600"
            >
              #{{ category }}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-slate-900">แผนที่</h2>
          <iframe
            :src="trip.mapEmbedUrl"
            width="100%"
            height="320"
            style="border:0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            class="rounded-3xl"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
</template>

