import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as userService from "../services/userService";

export type User = {
  id: string;
  email: string;
  displayName: string;
};

export const useUserStore = defineStore("users", () => {
  const users = ref<User[]>([]);
  const isLoaded = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const userMap = computed(() => {
    const m = new Map<string, User>();
    users.value.forEach((u) => m.set(String(u.id), u));
    return m;
  });

  /**
   * Load all users from the API and cache them in the store.
   * @param force - if true, always refetch from server
   */
  async function loadUsers(force = false) {
    if (isLoaded.value && !force) return users.value;
    loading.value = true;
    error.value = null;
    try {
      const { data } = await userService.fetchUsers();
      users.value = data.map((u: any) => ({ id: String(u.id), email: u.email, displayName: u.displayName }));
      isLoaded.value = true;
      return users.value;
    } catch (err) {
      console.error("Error loading users:", err);
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Load a single user by id. Will return cached value if present unless force=true.
   */
  async function loadUser(id: string, force = false) {
    const idStr = String(id);
    const cached = userMap.value.get(idStr);
    if (cached && !force) return cached;

    loading.value = true;
    error.value = null;
    try {
      const { data } = await userService.fetchUser(idStr);
      const u: User = { id: String(data.id), email: data.email, displayName: data.displayName };
      const idx = users.value.findIndex((x) => x.id === u.id);
      if (idx === -1) users.value.push(u);
      else users.value[idx] = u;
      return u;
    } catch (err) {
      console.error("Error loading user:", err);
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getById(id: string) {
    return userMap.value.get(String(id)) ?? null;
  }

  return {
    users,
    isLoaded,
    loading,
    error,
    loadUsers,
    loadUser,
    getById,
  };
});
