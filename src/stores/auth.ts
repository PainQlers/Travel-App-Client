import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authService from "../services/authService";

export const useAuthStore = defineStore("auth", () => {
  const currentUser = ref<any>(null);
  const token = ref<string | null>(localStorage.getItem("token"));

  const isAuthenticated = computed(() => !!token.value);

  // Function เพื่อ decode JWT token และดึงข้อมูล user
  function decodeJWT(token: string) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const base64Url = parts[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // Restore user จาก token เมื่อ app โหลด
  // Returns a promise that resolves when profile fetch completes (or immediately if no token)
  function restoreUser(): Promise<void> {
    if (!token.value) return Promise.resolve();
    const decoded = decodeJWT(token.value);
    // Immediately set a provisional user object from the decoded token (if present)
    // This prevents UI from seeing `null` while async profile fetch completes.
    if (decoded) {
      const idCandidate = decoded.id || decoded.userId;
      currentUser.value = {
        id: idCandidate && /^\d+$/.test(String(idCandidate)) ? String(idCandidate) : "",
        email: decoded.email || decoded.sub || decoded.emailAddress || "",
        displayName: decoded.displayName || decoded.name || "",
      };
    }

    // Then try to fetch the authoritative profile from the backend and update
    return authService.getProfile()
      .then((res: any) => {
        // eslint-disable-next-line no-console
        console.debug("getProfile response:", res);

        // Response format 1: nested user object
        if (res.user && typeof res.user === 'object') {
          currentUser.value = {
            id: String(res.user.id || res.user.userId || ""),
            email: res.user.email || "",
            displayName: res.user.displayName || res.user.name || "",
          };
          return;
        }

        // Response format 2: flat structure with id at top level
        if (res.id) {
          currentUser.value = {
            id: String(res.id),
            email: res.email || "",
            displayName: res.displayName || res.name || "",
          };
          return;
        }

        // Response format 3: minimal info, just update email/displayName
        if (currentUser.value && (res.email || res.displayName)) {
          if (res.email) currentUser.value.email = res.email;
          if (res.displayName) currentUser.value.displayName = res.displayName;
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("getProfile failed:", err);
        // Resolve despite error so promise chain doesn't break
      });
  }

  // เรียก restoreUser เมื่อ store ถูกสร้าง
  restoreUser();

  async function register(email: string, displayName: string, password: string) {
    const res = await authService.register(email, displayName, password);
    
    // eslint-disable-next-line no-console
    console.debug("Register response:", res);

    // Save token first
    if (res.token) {
      token.value = res.token;
      localStorage.setItem("token", res.token);
    }

    // ตรวจสอบ structure ของ response และ set currentUser
    if (res.user && typeof res.user === 'object') {
      // If response has nested 'user' object
      currentUser.value = {
        id: String(res.user.id || res.user.userId || ""),
        email: res.user.email || "",
        displayName: res.user.displayName || res.user.name || displayName || "",
      };
    } else if (res.id || res.userId) {
      // If response has user fields at top level
      currentUser.value = {
        id: String(res.id || res.userId),
        email: res.email || "",
        displayName: res.displayName || res.name || displayName || "",
      };
    } else if (res.token) {
      // Fallback: decode from token
      restoreUser();
    }
  }

  async function login(email: string, password: string) {
    try {
      const res = await authService.login(email, password);
      
      // eslint-disable-next-line no-console
      console.debug("Login response:", res);

      // Save token first
      if (res.token) {
        token.value = res.token;
        localStorage.setItem("token", res.token);
      }

      // ตรวจสอบ structure ของ response และ set currentUser
      if (res.user && typeof res.user === 'object') {
        // If response has nested 'user' object
        currentUser.value = {
          id: String(res.user.id || res.user.userId || ""),
          email: res.user.email || "",
          displayName: res.user.displayName || res.user.name || "",
        };
      } else if (res.id || res.userId) {
        // If response has user fields at top level
        currentUser.value = {
          id: String(res.id || res.userId),
          email: res.email || "",
          displayName: res.displayName || res.name || "",
        };
      } else if (res.token) {
        // Fallback: decode from token
        restoreUser();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Login error:", error);
      throw error; // Re-throw so UI can catch and display error
    }
  }

  function logout() {
    token.value = null;
    currentUser.value = null;
    localStorage.removeItem("token");
  }

  return {
    currentUser,
    token,
    isAuthenticated,
    register,
    login,
    logout,
    restoreUser,
  };
});
