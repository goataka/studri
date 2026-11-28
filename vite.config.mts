import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

// Vite でビルドするアプリ。ここにないアプリは、静的なファイルとしてそのままコピーする
const builtApps: string[] = ["apps/japanese/kanji-g3"];
const staticEntries = [
  "index.html",
  "studri.jpeg",
  "og-image.png",
  "favicon.ico",
  "favicon-16.png",
  "favicon-32.png",
  "apple-touch-icon.png",
  "apps",
];
const outDir = "dist";

// 環境名。学習記録の保存名に付け、環境ごとに記録を分ける。決まりは specs/environments.md
const envNames = ["local", "staging", "production"];
const envName = process.env.STUDRI_ENV ?? "local";
if (!envNames.includes(envName)) throw new Error(`STUDRI_ENV は ${envNames.join("、")} のどれか：${envName}`);

// Vite でビルドするアプリがないときは、トップページをビルドの入口にする
const builtPages = builtApps.length > 0 ? builtApps : ["."];

function isExcluded(source: string): boolean {
  const relative = path.relative(process.cwd(), source);
  if (builtApps.length === 0 && relative === "index.html") return true;
  if (relative.split(path.sep).includes("e2e") || relative.endsWith(".ts")) return true;
  return builtApps.some((app) => relative === app || relative.startsWith(`${app}${path.sep}`));
}

function copyStaticSite(): Plugin {
  return {
    name: "copy-static-site",
    apply: "build",
    async closeBundle() {
      for (const entry of staticEntries) {
        await cp(entry, path.join(outDir, entry), { recursive: true, filter: (source) => !isExcluded(source) });
      }
      await markEnv(outDir);
    },
  };
}

// dist の html すべての <html> に data-env を入れる
async function markEnv(dir: string): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const file = path.join(entry.parentPath, entry.name);
    const html = await readFile(file, "utf8");
    if (!/<html[\s>]/.test(html)) throw new Error(`${file} に <html> がない`);
    await writeFile(file, html.replace(/<html(?=[\s>])/, `<html data-env="${envName}"`));
  }
}

function buildVersion(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
  const [date, time] = now.slice(0, 23).split("T");
  return `Ver. ${date.replaceAll("-", "")}.${time.replaceAll(":", "")}`;
}

async function inputs(): Promise<Record<string, string>> {
  const entries = await Promise.all(
    builtPages.map(async (app) => {
      const files = await readdir(app);
      if (!files.includes("index.html")) throw new Error(`${app}/index.html がない`);
      return [app === "." ? "home" : app.replaceAll("/", "-"), path.resolve(app, "index.html")];
    }),
  );
  return Object.fromEntries(entries);
}

export default defineConfig(async () => ({
  base: "./",
  define: { __BUILD_VERSION__: JSON.stringify(buildVersion()) },
  build: { outDir, emptyOutDir: true, rollupOptions: { input: await inputs() } },
  plugins: [copyStaticSite()],
  test: { include: ["apps/**/*.test.ts", "scripts/**/*.test.ts"] },
}));
