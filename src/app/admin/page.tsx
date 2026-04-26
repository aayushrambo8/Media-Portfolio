import fs from "fs/promises";
import path from "path";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const TAGS_FILE = path.join(process.cwd(), "src/data/tags.json");
  let tags: string[] = [];
  try {
    const data = await fs.readFile(TAGS_FILE, "utf-8");
    tags = JSON.parse(data) as string[];
  } catch(e) {
    console.error("Could not read tags file", e);
  }

  return <AdminDashboard initialTags={tags} />;
}
