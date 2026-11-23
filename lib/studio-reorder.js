import matter from "gray-matter";
import { github } from "./studio-auth.js";

const owner = "cmosqueda";
const repo = "readme";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class ReorderValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

export function isReorderValidationError(error) {
  return error instanceof ReorderValidationError || error?.status === 400;
}

export async function reorderContent({
  directory,
  kind,
  slugs,
  token,
  formatMarkdown,
  syncLocal = false,
}) {
  if (!Array.isArray(slugs) || slugs.length === 0) {
    throw new ReorderValidationError("Provide a non-empty ordered list of slugs.");
  }

  const seen = new Set();
  for (const slug of slugs) {
    if (typeof slug !== "string" || !slugPattern.test(slug)) {
      throw new ReorderValidationError("All items must have a valid lowercase kebab-case slug.");
    }
    if (seen.has(slug)) {
      throw new ReorderValidationError(`Duplicate slug "${slug}" in reorder payload.`);
    }
    seen.add(slug);
  }

  const ref = await github(`/repos/${owner}/${repo}/git/ref/heads/main`, token);
  const baseCommitSha = ref?.object?.sha;
  if (!baseCommitSha) {
    throw new Error("Could not resolve main branch HEAD.");
  }

  const baseCommit = await github(
    `/repos/${owner}/${repo}/git/commits/${baseCommitSha}`,
    token,
  );
  const baseTreeSha = baseCommit?.tree?.sha;
  if (!baseTreeSha) {
    throw new Error("Could not resolve base Git tree.");
  }

  const files = await Promise.all(
    slugs.map(async (slug, index) => {
      const file = await github(
        `/repos/${owner}/${repo}/contents/${directory}/${slug}.md?ref=${baseCommitSha}`,
        token,
      );
      const raw = Buffer.from(file.content, "base64").toString("utf8");
      const parsed = matter(raw);
      const currentOrder = parsed.data?.order;
      const changed = currentOrder !== index;
      const nextData = { ...parsed.data, order: index };
      const nextMarkdown = formatMarkdown(nextData, parsed.content.trim());

      return {
        slug,
        path: `${directory}/${slug}.md`,
        changed,
        nextMarkdown,
      };
    }),
  );

  const updates = files.filter((file) => file.changed);
  if (updates.length === 0) {
    return { ok: true, updated: 0 };
  }

  const treeEntries = await Promise.all(
    updates.map(async (file) => {
      const blob = await github(`/repos/${owner}/${repo}/git/blobs`, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: file.nextMarkdown, encoding: "utf-8" }),
      });
      return {
        path: file.path,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      };
    }),
  );

  const newTree = await github(`/repos/${owner}/${repo}/git/trees`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });

  const newCommit = await github(`/repos/${owner}/${repo}/git/commits`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `studio: reorder ${kind}`,
      tree: newTree.sha,
      parents: [baseCommitSha],
    }),
  });

  await github(`/repos/${owner}/${repo}/git/refs/heads/main`, token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha: newCommit.sha }),
  });

  if (syncLocal) {
    try {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const localDir = path.resolve(process.cwd(), directory);
      await fs.mkdir(localDir, { recursive: true });
      await Promise.all(
        updates.map((file) =>
          fs.writeFile(path.join(localDir, `${file.slug}.md`), file.nextMarkdown, "utf8"),
        ),
      );
    } catch {
      // Best-effort local sync in read-only/serverless environments.
    }
  }

  return { ok: true, updated: updates.length, sha: newCommit.sha };
}
