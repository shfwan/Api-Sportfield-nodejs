import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/database/schema/schema.ts"
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL as string)

export const database = drizzle(client, { schema, logger: false })