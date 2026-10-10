import { randomBytes } from "node:crypto";

const cookieName = "portfolio_cms_oauth_state";

function siteUrl() {
  const value = process.env.CMS_SITE_URL;
  return value?.replace(/\/$/, "");
}

export default function handler(request, response) {
  const baseUrl = siteUrl();
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;

  if (!baseUrl || !clientId) {
    response.status(500).send("CMS OAuth is not configured. Set CMS_SITE_URL and GITHUB_OAUTH_CLIENT_ID in Vercel.");
    return;
  }

  const state = randomBytes(32).toString("hex");
  const secure = baseUrl.startsWith("https://") ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${cookieName}=${state}; Path=/api/callback; HttpOnly; SameSite=Lax; Max-Age=600${secure}`);

  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", `${baseUrl}/api/callback`);
  authorizationUrl.searchParams.set("scope", "repo");
  authorizationUrl.searchParams.set("state", state);
  response.redirect(302, authorizationUrl.toString());
}
