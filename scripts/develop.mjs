import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "package.json");
const rayPath = path.join(root, "node_modules", ".bin", "ray");
const previewCommand = {
  name: "preview-wallet",
  title: "Preview Test Wallet",
  subtitle: "BIP39 to 1Password",
  description:
    "Generate and display a test wallet locally without connecting to 1Password",
  mode: "view",
};

const productionManifest = await readFile(manifestPath, "utf8");
const developmentManifest = JSON.parse(productionManifest);
developmentManifest.commands = [
  previewCommand,
  ...developmentManifest.commands.filter(
    (command) => command.name !== previewCommand.name,
  ),
];

let restored = false;
async function restoreProductionManifest() {
  if (restored) return;
  restored = true;
  await writeFile(manifestPath, productionManifest);
}

await writeFile(
  manifestPath,
  `${JSON.stringify(developmentManifest, null, 2)}\n`,
);

if (process.argv.includes("--dry-run")) {
  console.log(developmentManifest.commands.map((command) => command.name));
  await restoreProductionManifest();
} else {
  const child = spawn(rayPath, ["develop"], {
    cwd: root,
    stdio: "inherit",
  });

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.once(signal, () => child.kill(signal));
  }

  child.once("error", async (error) => {
    await restoreProductionManifest();
    console.error(error);
    process.exitCode = 1;
  });

  child.once("close", async (code, signal) => {
    await restoreProductionManifest();
    process.exitCode = code ?? (signal === "SIGINT" ? 0 : 1);
  });
}
