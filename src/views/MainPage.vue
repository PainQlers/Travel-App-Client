<script setup lang="ts">
import { computed, ref } from "vue";
import { useTripStore } from "../stores/trips";
import TripCard from "../components/TripCard.vue";
import { onMounted } from "vue";
import { useAuthStore } from "../stores/auth";

const tripStore = useTripStore();
const auth = useAuthStore();


onMounted(async () => {
  // Ensure profile is loaded before proceeding
  await auth.restoreUser();
  
  if (!tripStore.isLoaded) {
    tripStore.loadTrips();
    // eslint-disable-next-line no-console
    console.log("Auth currentUser:", auth.currentUser);
  }
});

const search = ref("");
const province = ref("");

const provinces = computed(() => tripStore.provinces);

const filteredTrips = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  const provinceFilter = province.value.toLowerCase();

  return tripStore.trips.filter((trip) => {
    const matchKeyword =
      !keyword ||
      trip.title.toLowerCase().includes(keyword) ||
      trip.province.toLowerCase().includes(keyword);

    const matchProvince =
      !provinceFilter ||
      trip.province.toLowerCase() === provinceFilter;

    return matchKeyword && matchProvince;
  });
});

const heroImages = computed(() =>
  tripStore.trips.slice(0, 4).map((trip) => ({
    id: trip.id,
    caption: trip.title,
    image: trip.photos[0],
  }))
);

function clearFilters() {
  search.value = "";
  province.value = "";
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <div class="rounded-[40px] bg-gradient-to-r from-cyan-100 via-white to-blue-50 p-10 shadow-card">
      <div class="grid gap-10 md:grid-cols-2">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.4em] text-brand">
            Where to GO
          </p>
          <h1 class="mt-2 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
            เที่ยวไหนดี
          </h1>
          <p class="mt-4 text-lg text-slate-600">
            รวมทุกไอเดียเที่ยวไทย ทั้งสายธรรมชาติ คาเฟ่ และที่เที่ยวใกล้กรุงเทพฯ
            พร้อมแผนการเดินทางคร่าว ๆ ให้หยิบไปใช้ได้เลย
          </p>

          <div class="mt-6 space-y-3">
            <div class="relative">
              <span class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                v-model="search"
                type="text"
                placeholder="ค้นหาชื่อทริปหรือจังหวัด ..."
                class="w-full rounded-3xl border border-transparent bg-white/80 px-12 py-4 text-base shadow-lg focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/20"
              />
            </div>
            <div class="flex flex-wrap gap-3">
              <select
                v-model="province"
                class="min-w-[180px] rounded-3xl border border-transparent bg-white/80 px-5 py-3 text-sm shadow"
              >
                <option value="">ทุกจังหวัด</option>
                <option v-for="item in provinces" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
              <button
                type="button"
                class="rounded-full border border-white/60 px-5 py-3 text-sm font-semibold text-brand"
                @click="clearFilters"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <router-link
          :to="{ name: 'trip-detail', params: { id: image.id } }"
            v-for="image in heroImages"
            :key="image.id"
            class="rounded-3xl bg-white p-3 shadow-lg"
          >
            <img
              :src="image.image"
              :alt="image.caption"
              class="h-32 w-full rounded-2xl object-cover"
            />
            <p class="mt-3 text-sm font-semibold text-slate-700 line-clamp-2">
              {{ image.caption }}
            </p>
          </router-link>
        </div>
      </div>
    </div>

    <div class="mt-10 space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm uppercase tracking-[0.4em] text-slate-400">เลือกจากไอเดีย</p>
          <h2 class="text-2xl font-bold text-slate-900">ทริปล่าสุด</h2>
        </div>
        <p class="text-sm text-slate-500">
          พบ {{ filteredTrips.length }} ทริปจากทั้งหมด {{ tripStore.trips.length }} รายการ
        </p>
      </header>

      <div class="space-y-5">
        <TripCard
          v-for="trip in filteredTrips"
          :key="trip.id"
          :trip="trip"
          :show-owner="true"
        />
        <p
          v-if="filteredTrips.length === 0"
          class="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-card"
        >
          ไม่พบผลลัพธ์ ลองคำค้นใหม่อีกครั้งนะ
        </p>
      </div>
    </div>
  </section>
</template>
