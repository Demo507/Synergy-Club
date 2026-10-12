/* eslint-disable @typescript-eslint/no-explicit-any */
export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let jwt = "";
export const setToken = (t: string) => {
  jwt = t;
};
export const getToken = () => jwt;

// GET when no body is given, POST (JSON) otherwise.
export async function api(path: string, body?: unknown): Promise<any> {
  const res = await fetch(API + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
