import * as SecureStore from "expo-secure-store";

const API = process.env.EXPO_PUBLIC_API_URL;

export async function updateSession(id: number, updates: any) {
  const jwt = await SecureStore.getItemAsync("jwt");

  const res = await fetch(`${API}/sessions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt ? `Bearer ${jwt}` : "",
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteSession(id: number) {
  const jwt = await SecureStore.getItemAsync("jwt");

  const res = await fetch(`${API}/sessions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: jwt ? `Bearer ${jwt}` : "",
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return true;
}
