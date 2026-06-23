import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key if available, otherwise fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const files = {
    gallery: "src/data/gallery.json",
    tags: "src/data/tags.json",
    timeline: "src/data/timeline.json",
    milestones: "src/data/milestones.json",
  };

  console.log("Starting migration to Supabase...");
  console.log("Please ensure you have created the table 'portfolio_data' in your Supabase SQL editor:");
  console.log(`
    create table if not exists public.portfolio_data (
      key text primary key,
      items jsonb default '[]'::jsonb not null
    );
  `);

  for (const [key, path] of Object.entries(files)) {
    try {
      const dataStr = await fs.readFile(path, "utf-8");
      const dataObj = JSON.parse(dataStr);
      
      const { error } = await supabase
        .from("portfolio_data")
        .upsert({ key: key, items: dataObj });

      if (error) {
        throw error;
      }

      console.log(`Successfully migrated ${key} to Supabase!`);
    } catch (e) {
      console.error(`Error migrating ${key}:`, e.message);
    }
  }
}

main().catch(console.error);
