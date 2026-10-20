import { defineConfig } from "vitest/config";
const TEST_DB_URL = "file:./data/test.db"

export default defineConfig({
    test: {
        env: { DATABASE_URL: TEST_DB_URL },
        globalSetup: ["./tests/setup/global-setup.ts"],
        fileParallelism: false,
    },
});