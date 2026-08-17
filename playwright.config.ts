import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/showroom/";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  snapshotPathTemplate: "{testDir}/../../design/acceptance/{projectName}.png",
  use: { baseURL },
  webServer: {
    command: "bun run build && bun run preview --host 127.0.0.1 --port 4173",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "landscape", use: { browserName: "chromium", viewport: { width: 1280, height: 800 } } },
    { name: "portrait", use: { browserName: "chromium", viewport: { width: 800, height: 1280 } } },
  ],
});
