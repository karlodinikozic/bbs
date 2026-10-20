import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

export default function setup() {
    mkdirSync("data", { recursive: true });

    execSync("npx prisma migrate deploy", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: "file:./data/test.db" },
    });
}