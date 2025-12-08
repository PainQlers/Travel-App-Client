// src/services/authService.ts
const BASE_URL = "https://travel-app-server-ehuz.onrender.com";

async function handleError(res: Response) {
  let message = "เกิดข้อผิดพลาด";

  try {
    const data = await res.json();
    if (data?.message) message = data.message;
    if (data?.error) message = data.error;
  } catch {
    // ถ้า JSON parse ไม่ได้ ให้ใช้ statusText
    message = res.statusText || message;
  }

  throw new Error(message);
}

export async function register(email: string, displayName: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, displayName, password }),
  });

  const raw = await res.text();
  console.log("RAW RESPONSE:", raw);

  if (!res.ok) {
    try {
      const data = JSON.parse(raw);
      throw new Error(data.message || data.error || "เกิดข้อผิดพลาด");
    } catch {
      throw new Error(raw || "เกิดข้อผิดพลาด");
    }
  }

  try {
    return JSON.parse(raw); // กรณี backend ส่ง JSON
  } catch {
    return { message: raw }; // fallback กรณี backend ส่ง plain text
  }
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) return handleError(res);

  return res.json();
}

export async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token available");

  const res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) return handleError(res);
  return res.json();
}
