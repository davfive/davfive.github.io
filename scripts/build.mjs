#!/usr/bin/env node
// Assembles dist/: copies the landing page from site/, builds or copies each
// course under courses/, and injects a generated course list into index.html.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const coursesDir = join(rootDir, "courses");
const distDir = join(rootDir, "dist");

function listCourseDirs() {
  return readdirSync(coursesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();
}

function readCourseMeta(name, coursePath) {
  const metaPath = join(coursePath, "course.json");
  const defaults = { title: name, description: "" };
  if (!existsSync(metaPath)) return { ...defaults, slug: name };
  const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
  return { ...defaults, ...meta, slug: name };
}

function buildCourse(name, coursePath, outDir) {
  const hasPackageJson = existsSync(join(coursePath, "package.json"));

  if (!hasPackageJson) {
    cpSync(coursePath, outDir, { recursive: true, filter: (src) => !src.endsWith("course.json") });
    return;
  }

  const installCmd = existsSync(join(coursePath, "package-lock.json")) ? "ci" : "install";
  execFileSync("npm", [installCmd], { cwd: coursePath, stdio: "inherit" });
  execFileSync("npm", ["run", "build"], { cwd: coursePath, stdio: "inherit" });

  const builtDir = ["dist", "build"].map((d) => join(coursePath, d)).find((d) => existsSync(d));
  if (!builtDir) {
    throw new Error(`Course "${name}" has a package.json but no dist/ or build/ output after "npm run build".`);
  }
  cpSync(builtDir, outDir, { recursive: true });
}

function renderCourseCard({ slug, title, description }) {
  return `      <li class="course-card">
        <a href="./courses/${slug}/">
          <h2>${title}</h2>
          ${description ? `<p>${description}</p>` : ""}
        </a>
      </li>`;
}

function main() {
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });
  cpSync(join(rootDir, "site"), distDir, { recursive: true });
  writeFileSync(join(distDir, ".nojekyll"), "");

  const courseNames = existsSync(coursesDir) ? listCourseDirs() : [];
  const meta = [];

  for (const name of courseNames) {
    const coursePath = join(coursesDir, name);
    if (!statSync(coursePath).isDirectory()) continue;
    const outDir = join(distDir, "courses", name);
    mkdirSync(outDir, { recursive: true });
    buildCourse(name, coursePath, outDir);
    meta.push(readCourseMeta(name, coursePath));
  }

  const indexPath = join(distDir, "index.html");
  const cardsHtml = meta.length
    ? meta.map(renderCourseCard).join("\n")
    : `      <li class="course-card course-card--empty">No courses published yet.</li>`;
  const index = readFileSync(indexPath, "utf-8").replace("<!-- COURSES_LIST -->", cardsHtml);
  writeFileSync(indexPath, index);

  console.log(`Built ${meta.length} course(s) into ${distDir}`);
}

main();
