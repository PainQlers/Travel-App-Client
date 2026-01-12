import axios from "axios";

const api = axios.create({
    baseURL: "https://travel-app-server-ehuz.onrender.com/",
  });

  interface User {
    id: string;
    email: string;
    displayName: string;
  }

  export async function fetchUsers() {
    const res = await api.get<User[]>("/api/users");
    // eslint-disable-next-line no-console
    console.log("API response:", res.data);
  
    return res;
  }

  export async function fetchUser(id: string) {
    const res = await api.get<User>(`/api/users/${id}`);
  
    return res;
  }