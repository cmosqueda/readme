import { github, session } from "../../lib/studio-auth.js";

const owner = "cmosqueda";
const repo = "readme";
const filePath = "src/data/status.json";

export default async function handler(request, response) {
  const current = session(request);
  if (!current) return response.status(401).json({ error: "Sign in required." });

  try {
    if (request.method === "GET") {
      try {
        const file = await github(`/repos/${owner}/${repo}/contents/${filePath}?ref=main`, current.token);
        const raw = Buffer.from(file.content, "base64").toString("utf8");
        const parsed = JSON.parse(raw);
        return response.status(200).json({
          emoji: typeof parsed?.emoji === "string" ? parsed.emoji : "",
          message: typeof parsed?.message === "string" ? parsed.message : "",
          sha: file.sha,
        });
      } catch (err) {
        // Fallback to local default if remote file not fetched
        return response.status(200).json({
          emoji: "☕",
          message: "nabubuang",
          sha: null,
        });
      }
    }

    if (request.method === "PUT") {
      const { emoji = "", message = "", sha } = request.body ?? {};

      const sanitizedEmoji = String(emoji ?? "").trim();
      const sanitizedMessage = String(message ?? "").trim();

      const newContent = JSON.stringify(
        {
          emoji: sanitizedEmoji,
          message: sanitizedMessage,
        },
        null,
        2,
      ) + "\n";

      let fileSha = sha;
      if (!fileSha) {
        try {
          const existing = await github(`/repos/${owner}/${repo}/contents/${filePath}?ref=main`, current.token);
          fileSha = existing?.sha;
        } catch {
          // New file creation if it didn't exist
        }
      }

      const commitMessage = sanitizedMessage || sanitizedEmoji
        ? `studio: update profile status (${[sanitizedEmoji, sanitizedMessage].filter(Boolean).join(" ")})`
        : "studio: clear profile status";

      const payload = {
        message: commitMessage,
        content: Buffer.from(newContent).toString("base64"),
        branch: "main",
        ...(fileSha ? { sha: fileSha } : {}),
      };

      const result = await github(`/repos/${owner}/${repo}/contents/${filePath}`, current.token, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Best effort update on local disk when available
      try {
        const fs = await import("node:fs/promises");
        const path = await import("node:path");
        const localPath = path.resolve(process.cwd(), filePath);
        await fs.writeFile(localPath, newContent, "utf8");
      } catch {
        // Ignored in read-only serverless lambdas
      }

      return response.status(200).json({
        ok: true,
        sha: result?.content?.sha ?? null,
        emoji: sanitizedEmoji,
        message: sanitizedMessage,
      });
    }

    return response.status(405).end();
  } catch (error) {
    console.error("Studio profile status failed", error);
    return response.status(502).json({ error: "GitHub could not complete that request." });
  }
}
