<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

function handleLogout() {
  auth.logout();
  router.push({ name: "home" });
}
</script>

<template>
  <header class="bg-white shadow-sm">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <router-link
        :to="{ name: 'home' }"
        class="text-2xl font-bold tracking-wide text-brand"
      >
        เที่ยวไหนดี
      </router-link>

      <div class="flex items-center gap-4">
        <template v-if="auth.isAuthenticated">
          <router-link v-if="auth.currentUser" :to="{ name: 'dashboard' }" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {{ auth.currentUser?.email }}
          </router-link>
          <button
            class="text-sm font-semibold text-brand"
            type="button"
            @click="handleLogout"
          >
            ออกจากระบบ
          </button>
        </template>
        <template v-else>
          <router-link
            :to="{ name: 'login' }"
            class="text-sm font-semibold text-brand"
          >
            เข้าสู่ระบบ
          </router-link>
          <router-link
            :to="{ name: 'register' }"
            class="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-dark"
          >
            สมัครสมาชิก
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

