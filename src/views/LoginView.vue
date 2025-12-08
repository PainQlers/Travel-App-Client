<script setup lang="ts">
import { reactive, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  email: "",
  password: "",
});

const error = ref("");

async function handleSubmit() {
  try {
    error.value = "";
    await auth.login(form.email, form.password);
    router.push({ name: "home" });
  } catch (err) {
    error.value = (err as Error).message;
  }
}
</script>

<template>
  <section class="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-12 md:px-6">
    <div class="w-full rounded-[40px] bg-white p-10 text-center shadow-card">
      <p class="text-sm uppercase tracking-[0.4em] text-slate-400">Welcome</p>
      <h1 class="mt-3 text-3xl font-bold text-slate-900">เข้าสู่ระบบ</h1>
      <p class="mt-2 text-slate-500">
        จัดการทริปของคุณ สร้างไอเดียใหม่ และบันทึกสถานที่โปรด
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
          <label class="text-sm font-semibold text-slate-600">รหัสผ่าน</label>
          <input
            v-model="form.password"
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
          เข้าสู่ระบบ
        </button>
      </form>

      <p class="mt-6 text-sm text-slate-500">
        ยังไม่มีบัญชี?
        <router-link :to="{ name: 'register' }" class="font-semibold text-brand">
          สมัครสมาชิก
        </router-link>
      </p>
    </div>
  </section>
</template>

