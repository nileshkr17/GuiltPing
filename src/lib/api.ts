const BASE_URL = import.meta.env.VITE_API_URL || ""; // empty means use /api via proxy

function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = BASE_URL ? `${BASE_URL}${path}` : path;
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  signup: (email: string, password: string, name?: string) =>
    apiFetch("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  myCheckins: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/api/checkins/me${qs}`);
  },
  checkinToday: () => apiFetch("/api/checkins", { method: "POST" }),
  pushPublicKey: () => apiFetch("/api/notifications/public-key"),
  pushTest: () => apiFetch("/api/notifications/test", { method: "POST", body: JSON.stringify({}) }),
  
  // Groups
  createGroup: (name: string, maxMembers: number, isPublic: boolean, description?: string) =>
    apiFetch("/api/groups", { method: "POST", body: JSON.stringify({ name, maxMembers, isPublic, description }) }),
  joinGroup: (inviteCode: string) =>
    apiFetch("/api/groups/join", { method: "POST", body: JSON.stringify({ inviteCode }) }),
  myGroup: () => apiFetch("/api/groups"),
  getGroup: (id: string) => apiFetch(`/api/groups/${id}`),
  leaveGroup: () => apiFetch("/api/groups/leave", { method: "POST", body: JSON.stringify({}) }),
  discoverGroups: () => apiFetch("/api/groups/discover"),

  // Account
  deleteAccount: (password?: string) =>
    apiFetch("/api/auth/account", { method: "DELETE", body: JSON.stringify({ password }) }),

  // Profile
  getProfile: () => apiFetch("/api/profile/me"),
  updateProfile: (data: { name?: string; avatar?: string }) =>
    apiFetch("/api/profile/me", { method: "PATCH", body: JSON.stringify(data) }),
  
  // Group Settings
  updateGroupSettings: (data: { notificationTime?: number }) =>
    apiFetch("/api/groups/settings", { method: "PATCH", body: JSON.stringify(data) }),
};
