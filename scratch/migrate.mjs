import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;
const connectionString = "postgresql://postgres:admin1234!!!@db.pjdxiihwfbdvgffkvkyv.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to new database.");

  // Clean start for public schema
  console.log("Cleaning up public schema...");
  await client.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
  await client.query("GRANT ALL ON SCHEMA public TO postgres;");
  await client.query("GRANT ALL ON SCHEMA public TO public;");
  await client.query("GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;");
  await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;");
  await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;");
  await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;");

  const migrationsDir = './supabase/migrations';
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
    }
  }
  
  // Also need to grant access to existing objects
  await client.query("GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;");
  await client.query("GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;");
  await client.query("GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;");

  await client.end();
  console.log("All migrations applied successfully.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
