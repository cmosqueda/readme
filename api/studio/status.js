import { github, session, siteUrl } from "../../lib/studio-auth.js";

const owner = "cmosqueda";
const repo = "readme";
const shortSha = (sha) => (typeof sha === "string" ? sha.slice(0, 7) : null);

async function vercelLatest() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return null;
  const team = process.env.VERCEL_TEAM_ID ? `&teamId=${process.env.VERCEL_TEAM_ID}` : "";
  const response = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1${team}`,
    { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) return { configured: true, error: `Vercel responded ${response.status}.` };
  const { deployments } = await response.json();
  const latest = deployments?.[0];
  if (!latest) return { configured: true, error: "No deployments found." };
  return {
    configured: true,
    state: latest.state,
    commit: latest.meta?.githubCommitSha ?? null,
    url: latest.url ? `https://${latest.url}` : null,
    createdAt: latest.createdAt ? new Date(latest.createdAt).toISOString() : null,
  };
}

// Compares repo HEAD against the commit baked into the deployed site so the
// Studio can show whether committed content is already live.
export default async function handler(request, response) {
  const current = session(request);
  if (!current) return response.status(401).json({ error: "Sign in required." });
  if (request.method !== "GET") return response.status(405).end();
  try {
    const [branch, contentCommits] = await Promise.all([
      github(`/repos/${owner}/${repo}/branches/main`, current.token),
      github(`/repos/${owner}/${repo}/commits?sha=main&path=src/content&per_page=1`, current.token),
    ]);
    const head = branch?.commit?.sha ?? null;
    const latestContent = contentCommits?.[0];
    const contentCommit = latestContent
      ? { sha: latestContent.sha, message: latestContent.commit?.message?.split("\n")[0] ?? "", date: latestContent.commit?.author?.date ?? null }
      : null;

    let manifest = null;
    let manifestError = null;
    const site = siteUrl();
    if (site) {
      try {
        const manifestResponse = await fetch(`${site}/content-manifest.json`, {
          headers: { "Cache-Control": "no-cache" },
          signal: AbortSignal.timeout(8000),
        });
        if (manifestResponse.ok) manifest = await manifestResponse.json();
        else manifestError = `Deployed site responded ${manifestResponse.status}.`;
      } catch {
        manifestError = "Could not reach the deployed site.";
      }
    } else {
      manifestError = "CMS_SITE_URL is not configured.";
    }

    const vercel = await vercelLatest().catch(() => ({ configured: true, error: "Could not reach Vercel." }));
    const deployedCommit = manifest?.commit ?? vercel?.commit ?? null;
    const inSync = Boolean(head && deployedCommit && head === deployedCommit);

    return response.status(200).json({
      head: head ? { sha: head, short: shortSha(head) } : null,
      contentCommit: contentCommit ? { ...contentCommit, short: shortSha(contentCommit.sha) } : null,
      deployed: manifest ? { commit: manifest.commit, short: shortSha(manifest.commit), builtAt: manifest.builtAt ?? null } : null,
      manifestError,
      vercel,
      inSync,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Studio status failed", error);
    return response.status(502).json({ error: "Could not check deploy status." });
  }
}
