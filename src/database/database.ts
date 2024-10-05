import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/schema"
import * as postgres from "postgres";
import * as dotenv from 'dotenv'
dotenv.config()


const client = postgres(process.env.DATABASE_URL!)

export const database = drizzle(client, { schema, logger: false })