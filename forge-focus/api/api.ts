import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ??
  "https://focus-forge-cst438-38b937c199bc.herokuapp.com";

async function authHeader() {
  const jwt = await SecureStore.getItemAsync("jwt");
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

/* ========== AUTH ENDPOINTS ========== */

// 1️⃣ Verify Google token and get backend JWT
export const verifyGoogleToken = async (googleIdToken: string) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/google`, {
    token: googleIdToken,
  });

  return data;
};
export async function verifyGithubToken(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/github`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    throw new Error("GitHub token verification failed");
  }

  return res.json(); // { access_token }
}

// 2️⃣ Sign in or create a user (no body, only JWT header)
export const signInOrCreateUser = async () => {
  const headers = await authHeader();
  const { data } = await axios.post(`${API_BASE_URL}/users/signin`, {}, { headers });
  return data;
};

/* ========== PROTECTED EXAMPLES ========== */

export const getCurrentUser = async () => {
  const headers = await authHeader();
  const { data } = await axios.get(`${API_BASE_URL}/users/me`, { headers });
  return data;
};

export const getAllUsers = async () => {
  const headers = await authHeader();
  const { data } = await axios.get(`${API_BASE_URL}/users`, { headers });
  return data;
};

export const deleteUser = async (id: number) => {
  const headers = await authHeader();
  const { data } = await axios.delete(`${API_BASE_URL}/users/${id}`, { headers });
  return data;
};
