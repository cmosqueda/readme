import { beginLogin, siteUrl } from "../../lib/studio-auth.js";

export default function handler(request, response) {
  const baseUrl = siteUrl();
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!baseUrl || !clientId) return response.status(500).send("Studio OAuth is not configured.");
  const state = beginLogin(response);
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${baseUrl}/api/studio/callback`);
  url.searchParams.set("scope", "repo read:user");
  url.searchParams.set("state", state);
  response.redirect(302, url.toString());
}
