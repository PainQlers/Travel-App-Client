<script setup lang="ts">
import { reactive, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  email: "",
  displayName: "",
  password: "",
  confirmPassword: "",
});

const error = ref("");

async function handleSubmit() {
  if (form.password !== form.confirmPassword) {
    error.value = "รหัสผ่านไม่ตรงกัน";
    return;
  }

  try {
    error.value = "";
    await auth.register(form.email, form.displayName, form.password);
    router.push({ name: "dashboard" });
  } catch (err) {
    error.value = (err as Error).message;
  }
}
</script>

<template>
  <section class="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-12 md:px-6">
    <div class="w-full rounded-[40px] bg-white p-10 text-center shadow-card">
      <p class="text-sm uppercase tracking-[0.4em] text-slate-400">Join us</p>
      <h1 class="mt-3 text-3xl font-bold text-slate-900">สร้างบัญชีใหม่</h1>
      <p class="mt-2 text-slate-500">
        แชร์ทริปสุดโปรด และเก็บไอเดียการเดินทางไว้ที่เดียว
      </p>

      <form class="mx-auto mt-8 max-w-md space-y-4 text-left" @submit.prevent="handleSubmit">
        <div>
          <label class="text-sm font-semibold text-slate-600">อีเมล</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-600">ชื่อผู้ใช้งาน</label>
          <input
            v-model="form.displayName"
            type="name"
            required
            class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-600">รหัสผ่าน</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-600">ยืนยันรหัสผ่าน</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <p v-if="error" class="text-sm font-semibold text-rose-500">
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-dark"
        >
          สมัครสมาชิก
        </button>
      </form>

      <p class="mt-6 text-sm text-slate-500">
        มีบัญชีอยู่แล้ว?
        <router-link :to="{ name: 'login' }" class="font-semibold text-brand">
          เข้าสู่ระบบ
        </router-link>
      </p>
    </div>
  </section>
</template>

