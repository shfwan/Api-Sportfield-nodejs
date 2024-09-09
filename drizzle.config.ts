import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dbCredentials: {
        url: process.env.DATABASE_URL as string
    },
    dialect: "postgresql",
    schema: "./src/database/schema/schema.ts",
    out: "./drizzle",
});