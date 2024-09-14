import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as postgres from "postgres";

const migrationClient = postgres(process.env.DATABASE_URL as string, { max: 1 })

async function Main() {
    await migrate(drizzle(migrationClient), {
        migrationsFolder: "./src/database/database"
    })

    await migrationClient.end()
}

Main()