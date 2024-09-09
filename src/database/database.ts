import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/schema"
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!)

export const database = drizzle(client, { schema, logger: false })