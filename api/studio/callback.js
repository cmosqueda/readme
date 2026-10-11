import { clearState, createSession, github, setSession, siteUrl, validState } from "../../lib/studio-auth.js";

export default async function handler(request, response) {
  const baseUrl = siteUrl();
  const code = Array.isArray(request.query.code) ? request.query.code[0] : request.query.code;
  const state = Array.isArray(request.query.state) ? request.query.state[0] : request.query.state;
  clearState(response);
  if (!baseUrl || !code || !validState(request, state)) return response.status(400).send("Invalid studio sign-in request.");
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: process.env.GITHUB_OAUTH_CLIENT_ID, client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET, code, redirect_uri: `${baseUrl}/api/studio/callback` }) });
    const result = await tokenResponse.json();
    if (!tokenResponse.ok || !result.access_token) throw new Error("GitHub did not return an access token.");
    const user = await github("/user", result.access_token);
    if (user.login !== (process.env.CMS_ADMIN_GITHUB_LOGIN || "cmosqueda")) return response.status(403).send("This GitHub account is not authorized to access the studio.");
    setSession(response, createSession(result.access_token, user.login));
    response.redirect(302, `${baseUrl}/studio`);
  } catch (error) { console.error("Studio OAuth failed", error); response.status(502).send("Unable to sign in to the studio."); }
}
