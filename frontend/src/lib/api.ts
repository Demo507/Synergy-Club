/* eslint-disable @typescript-eslint/no-explicit-any */
export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let jwt = "";
export const setToken = (t: string) => {
  jwt = t;
};
export const getToken = () => jwt;

// Retries network failures (for example while the free server wakes up)
async function request(path: string, init: RequestInit): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetch(API + path, init);
    } catch {
      if (attempt < 2) await new Promise((r) => setTimeout(r, 6000));
    }
  }
  throw new Error(`Cannot reach the server at ${API}. Check your connection or try again in a minute.`);
}

// GET when no body is given, POST (JSON) otherwise.
export async function api(path: string, body?: unknown): Promise<any> {
  const res = await request(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
