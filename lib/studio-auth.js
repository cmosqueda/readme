import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const sessionName = "portfolio_studio_session";
const stateName = "portfolio_studio_oauth_state";

export function siteUrl() {
  return process.env.CMS_SITE_URL?.replace(/\/$/, "");
}

export function cookieValue(header, name) {
  return header?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);
}

function options(maxAge, path = "/") {
  return `Path=${path}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`;
}

export function beginLogin(response) {
  const state = randomBytes(32).toString("hex");
  response.setHeader("Set-Cookie", `${stateName}=${state}; ${options(600, "/api/studio/callback")}`);
  return state;
}

export function validState(request, received) {
  const expected = cookieValue(request.headers.cookie, stateName);
  if (!expected || !received || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export function clearState(response) {
  response.setHeader("Set-Cookie", `${stateName}=; ${options(0, "/api/studio/callback")}`);
}

export function createSession(token, login) {
  const secret = process.env.CMS_SESSION_SECRET;
  if (!secret) throw new Error("CMS_SESSION_SECRET is not configured.");
  const payload = Buffer.from(JSON.stringify({ token, login, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function setSession(response, value) {
  const existing = response.getHeader("Set-Cookie");
  const cookies = existing ? (Array.isArray(existing) ? existing : [existing]) : [];
  response.setHeader("Set-Cookie", [...cookies, `${sessionName}=${value}; ${options(8 * 60 * 60)}`]);
}

export function clearSession(response) {
  response.setHeader("Set-Cookie", `${sessionName}=; ${options(0)}`);
}

export function session(request) {
  const secret = process.env.CMS_SESSION_SECRET;
  const raw = cookieValue(request.headers.cookie, sessionName);
  if (!secret || !raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return value.exp > Date.now() && typeof value.token === "string" ? value : null;
  } catch { return null; }
}

export async function github(path, token, init = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", ...init.headers },
  });
  if (!response.ok) throw new Error(`GitHub request failed (${response.status}).`);
  return response.status === 204 ? null : response.json();
}
