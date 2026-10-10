import { timingSafeEqual } from "node:crypto";

const cookieName = "portfolio_cms_oauth_state";

function siteUrl() {
  return process.env.CMS_SITE_URL?.replace(/\/$/, "");
}

function readCookie(header, name) {
  return header?.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
}

function matchesState(expected, received) {
  if (!expected || !received || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function popupResponse(response, origin, status, message) {
  const payload = JSON.stringify(message).replace(/</g, "\\u003c");
  const targetOrigin = JSON.stringify(origin);
  const success = message.startsWith("authorization:github:success:");
  const script = success
    ? `const parentWindow=window.opener;if(parentWindow){const completeAuthorization=(event)=>{if(event.origin!==${targetOrigin}||event.source!==parentWindow)return;parentWindow.postMessage(${payload},event.origin);window.close();};window.addEventListener("message",completeAuthorization,false);parentWindow.postMessage("authorizing:github",${targetOrigin});}`
    : `if(window.opener){window.opener.postMessage(${payload},${targetOrigin});}window.close();`;

  response.status(status).setHeader("Content-Type", "text/html; charset=utf-8").send(`<!doctype html><title>Portfolio editor</title><script>${script}</script><p>You can close this window.</p>`);
}

export default async function handler(request, response) {
  const baseUrl = siteUrl();
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  const state = Array.isArray(request.query.state) ? request.query.state[0] : request.query.state;
  const code = Array.isArray(request.query.code) ? request.query.code[0] : request.query.code;
  const storedState = readCookie(request.headers.cookie, cookieName);
  const secure = baseUrl?.startsWith("https://") ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${cookieName}=; Path=/api/callback; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);

  if (!baseUrl || !clientId || !clientSecret) {
    popupResponse(response, baseUrl ?? "https://cmosqueda.vercel.app", 500, "authorization:github:error:CMS OAuth is not configured.");
    return;
  }
  if (!code || !matchesState(storedState, state)) {
    popupResponse(response, baseUrl, 400, "authorization:github:error:Invalid OAuth state. Please try again.");
    return;
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: `${baseUrl}/api/callback` }),
    });
    const result = await tokenResponse.json();
    if (!tokenResponse.ok || !result.access_token) throw new Error(result.error_description || "GitHub did not return an access token.");

    popupResponse(response, baseUrl, 200, `authorization:github:success:${JSON.stringify({ token: result.access_token, provider: "github" })}`);
  } catch (error) {
    console.error("Decap CMS OAuth callback failed", error);
    popupResponse(response, baseUrl, 502, "authorization:github:error:Unable to complete GitHub sign-in. Please try again.");
  }
}
