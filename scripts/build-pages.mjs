import { rename } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const apiDirectory = path.join(root, "apps/web/app/api");
const parkedApiDirectory = path.join(root, "apps/web/.pages-build-api");

await rename(apiDirectory, parkedApiDirectory);

try {
  const result = spawnSync("npm", ["run", "build", "--workspace", "@wci/web"], {
    cwd: root,
    env: {
      ...process.env,
      STATIC_EXPORT: "true",
      NEXT_PUBLIC_BASE_PATH: "/soccer-intelligence"
    },
    stdio: "inherit"
  });

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rename(parkedApiDirectory, apiDirectory);
}
