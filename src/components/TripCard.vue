<script setup lang="ts">
import { ref } from "vue";
import type { Trip } from "../data/trips";

interface Props {
  trip: Trip;
  showOwner?: boolean;
  showActions?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", trip: Trip): void;
  (e: "delete", tripId: string): void;
}>();

const imageErrors = ref<Set<number>>(new Set());

function handleEdit() {
  emit("edit", props.trip);
}

function handleDelete() {
  emit("delete", props.trip.id);
}

function onImageError(index: number) {
  imageErrors.value.add(index);
  // eslint-disable-next-line no-console
  console.warn(`Image failed to load at index ${index}: "${props.trip.photos[index]}"`);
}

function isValidImageUrl(url: string): boolean {
  // Check if it's a valid URL (starts with http/https or data:)
  return /^(https?:|data:)/.test(url);
}
</script>

<template>
  <article
    class="flex gap-4 rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-2xl"
  >
    <div class="relative h-44 w-44 flex-none rounded-2xl overflow-hidden bg-slate-100">
      <img
        v-if="trip.photos[0] && isValidImageUrl(trip.photos[0])"
        :src="trip.photos[0]"
        :alt="trip.title"
        @error="onImageError(0)"
        class="h-full w-full object-cover"
      />
      <div v-else class="h-full w-full flex items-center justify-center text-slate-400 text-sm text-center p-2">
        <span>{{ trip.photos[0] || "ไม่มีรูป" }}</span>
      </div>
    </div>

    <div class="flex flex-1 flex-col">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-brand/60">
            {{ trip.province }}
          </p>
          <h3 class="text-xl font-semibold text-slate-900">
            {{ trip.title }}
          </h3>
        </div>
        <router-link
          :to="{ name: 'trip-detail', params: { id: trip.id } }"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-brand hover:border-brand"
          aria-label="ดูรายละเอียด"
        >
          <span class="text-lg">↗</span>
        </router-link>
      </div>

      <p class="mt-2 line-clamp-2 text-sm text-slate-600">
        {{ trip.description }}
      </p>

      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="category in trip.tags"
          :key="category"
          class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
        >
          {{ category }}
        </span>
      </div>

      <div class="mt-4 flex flex-1 items-end justify-between text-xs text-slate-500">
        <div v-if="showOwner" class="font-medium">
          โดย {{ trip.ownerEmail }}
        </div>

        <div class="flex gap-3" v-if="showActions">
          <button
            type="button"
            class="text-sm font-semibold text-brand"
            @click="handleEdit"
          >
            แก้ไข
          </button>
          <button
            type="button"
            class="text-sm font-semibold text-rose-500"
            @click="handleDelete"
          >
            ลบ
          </button>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-4 gap-2">
        <div
          v-for="(image, index) in trip.photos.slice(0, 4)"
          :key="image + index"
          class="h-16 w-full rounded-xl overflow-hidden bg-slate-100"
        >
          <img
            v-if="isValidImageUrl(image)"
            :src="image"
            :alt="`ภาพที่ ${index + 1}`"
            @error="onImageError(index)"
            class="h-full w-full object-cover"
          />
          <div v-else class="h-full w-full flex items-center justify-center text-slate-400 text-xs text-center p-1">
            <span>{{ image }}</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

