import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const blogsDirectory = path.join(root, "src", "content", "blogs");
const requiredFields = ["title", "date", "category", "readTime", "summary", "tags"];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const errors = [];

const files = (await readdir(blogsDirectory)).filter((file) => file.endsWith(".md"));

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const label = `src/content/blogs/${file}`;

  if (!slugPattern.test(slug)) errors.push(`${label}: filename must be a lowercase kebab-case slug.`);

  const { data, content } = matter(await readFile(path.join(blogsDirectory, file), "utf8"));
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === "") errors.push(`${label}: missing required frontmatter field "${field}".`);
  }

  if (data.date && (typeof data.date !== "string" || !datePattern.test(data.date))) {
    errors.push(`${label}: date must use YYYY-MM-DD.`);
  }
  if (data.updatedAt && (typeof data.updatedAt !== "string" || !datePattern.test(data.updatedAt))) {
    errors.push(`${label}: updatedAt must use YYYY-MM-DD.`);
  }
  if (data.tags && (!Array.isArray(data.tags) || data.tags.length === 0 || data.tags.some((tag) => typeof tag !== "string" || !tag.trim()))) {
    errors.push(`${label}: tags must be a non-empty list of text values.`);
  }
  if (data.draft !== undefined && typeof data.draft !== "boolean") {
    errors.push(`${label}: draft must be true or false.`);
  }
  if (data.coverImage !== undefined && (typeof data.coverImage !== "string" || !data.coverImage.startsWith("/uploads/"))) {
    errors.push(`${label}: coverImage must reference an uploaded image under /uploads/.`);
  }
  if (!content.trim()) errors.push(`${label}: article body cannot be empty.`);
}

if (errors.length) {
  console.error("Content validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log(`Validated ${files.length} blog post${files.length === 1 ? "" : "s"}.`);
