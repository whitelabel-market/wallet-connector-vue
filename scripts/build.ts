import path from "path";
import assert from "assert";
import { execSync as exec } from "child_process";
import fs from "fs-extra";
import fg from "fast-glob";
import consola from "consola";

const rootDir = path.resolve(__dirname, "..");
const watch = process.argv.includes("--watch");

const FILES_COPY_ROOT = ["LICENSE"];

const FILES_COPY_LOCAL = [
  "README.md",
  "index.json",
  "*.cjs",
  "*.mjs",
  "*.d.ts",
];

assert(process.cwd() !== __dirname);

async function buildMetaFiles() {
  const packageRoot = path.resolve(__dirname, "..");
  const packageDist = path.resolve(packageRoot, "dist");

  await fs.copyFile(
    path.join(rootDir, "README.md"),
    path.join(packageDist, "README.md")
  );

  for (const file of FILES_COPY_ROOT)
    await fs.copyFile(path.join(rootDir, file), path.join(packageDist, file));

  const files = await fg(FILES_COPY_LOCAL, { cwd: packageRoot });
  for (const file of files)
    await fs.copyFile(
      path.join(packageRoot, file),
      path.join(packageDist, file)
    );

  const packageJSON = await fs.readJSON(path.join(packageRoot, "package.json"));

  if (packageJSON) {
    delete packageJSON.devDependencies;
    delete packageJSON.publishConfig;
    delete packageJSON["simple-git-hooks"];
    delete packageJSON.config;
    delete packageJSON.pnpm;
  }

  await fs.writeJSON(path.join(packageDist, "package.json"), packageJSON, {
    spaces: 2,
  });

  replaceInFile(path.join(packageDist, "package.json"), "./dist/", "./");
}

function replaceInFile(file: string, search: string, replace: string): void {
  const fileContent = fs
    .readFileSync(file, "utf8")
    .replace(new RegExp(search, "g"), replace);

  fs.writeFileSync(file, fileContent, "utf8");
}

async function build() {
  consola.info("Clean up");
  exec("pnpm run clean", { stdio: "inherit" });

  consola.info("Rollup");
  exec(`pnpm run build:rollup${watch ? " --watch" : ""}`, {
    stdio: "inherit",
  });

  await buildMetaFiles();
}

async function cli() {
  try {
    await build();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

export { build };

if (require.main === module) cli();
