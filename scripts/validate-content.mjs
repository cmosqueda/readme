import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentDirectory = path.join(root, "src", "content");
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const errors = [];

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function validateCommon({ data, content, file, directory }) {
  const slug = file.replace(/\.md$/, "");
  const label = `src/content/${directory}/${file}`;

  if (!slugPattern.test(slug)) errors.push(`${label}: filename must be a lowercase kebab-case slug.`);
  if (data.draft !== undefined && typeof data.draft !== "boolean") errors.push(`${label}: draft must be true or false.`);
  if (data.coverImage !== undefined && (typeof data.coverImage !== "string" || !data.coverImage.startsWith("/uploads/"))) {
    errors.push(`${label}: coverImage must reference an uploaded image under /uploads/.`);
  }
  if (!content.trim()) errors.push(`${label}: content body cannot be empty.`);

  return label;
}

async function getEntries(directory) {
  const directoryPath = path.join(contentDirectory, directory);
  const files = (await readdir(directoryPath)).filter((file) => file.endsWith(".md"));
  const entries = await Promise.all(files.map(async (file) => {
    const { data, content } = matter(await readFile(path.join(directoryPath, file), "utf8"));
    return { data, content, file, directory };
  }));
  return entries;
}

function requireFields(data, fields, label) {
  for (const field of fields) {
    if (!present(data[field])) errors.push(`${label}: missing required frontmatter field "${field}".`);
  }
}

function validTextList(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim());
}

const blogs = await getEntries("blogs");
for (const entry of blogs) {
  const { data } = entry;
  const label = validateCommon(entry);
  requireFields(data, ["title", "date", "category", "readTime", "summary", "tags"], label);

  if (present(data.date) && (typeof data.date !== "string" || !datePattern.test(data.date))) errors.push(`${label}: date must use YYYY-MM-DD.`);
  if (present(data.updatedAt) && (typeof data.updatedAt !== "string" || !datePattern.test(data.updatedAt))) errors.push(`${label}: updatedAt must use YYYY-MM-DD.`);
  if (present(data.tags) && !validTextList(data.tags)) errors.push(`${label}: tags must be a non-empty list of text values.`);
}

const projects = await getEntries("projects");
for (const entry of projects) {
  const { data } = entry;
  const label = validateCommon(entry);
  requireFields(data, ["title", "category", "role", "status", "description", "tools", "workflow", "stats"], label);

  if (present(data.tools) && !validTextList(data.tools)) errors.push(`${label}: tools must be a non-empty list of text values.`);
  if (present(data.workflow) && !validTextList(data.workflow)) errors.push(`${label}: workflow must be a non-empty list of text values.`);
  if (present(data.stats) && (!Array.isArray(data.stats) || data.stats.length === 0 || data.stats.some((stat) => !stat || typeof stat.label !== "string" || !stat.label.trim() || typeof stat.value !== "string" || !stat.value.trim()))) {
    errors.push(`${label}: stats must be a non-empty list of label/value pairs.`);
  }
  if (present(data.order) && (!Number.isInteger(data.order) || data.order < 0)) errors.push(`${label}: order must be a whole number greater than or equal to zero.`);
}

if (errors.length) {
  console.error("Content validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log(`Validated ${blogs.length} blog post${blogs.length === 1 ? "" : "s"} and ${projects.length} featured project${projects.length === 1 ? "" : "s"}.`);
