import "server-only";

const BASE_URL = process.env.GLS_BASE_URL;
const API_VERSION = process.env.GLS_API_VERSION || "1.0";

function authHeader() {
  const u = process.env.GLS_USERNAME;
  const p = process.env.GLS_PASSWORD;
  if (!u || !p) throw new Error("Missing GLS credentials");
  return "Basic " + Buffer.from(`${u}:${p}`).toString("base64");
}

export async function createGlsLabel(payload) {
  const res = await fetch(
    `${BASE_URL}/Label/Create?api-version=${API_VERSION}`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        Accept: "application/json",
        "Content-Type": "application/json-patch+json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "GLS error");
  return data;
}
