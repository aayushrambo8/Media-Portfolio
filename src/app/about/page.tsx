import { About } from "../../components/About";
import fs from "fs/promises";
import path from "path";

export default async function Page() {
  const MILESTONES_FILE = path.join(process.cwd(), "src/data/milestones.json");
  let milestones = [];
  
  try {
    const data = await fs.readFile(MILESTONES_FILE, "utf-8");
    milestones = JSON.parse(data);
  } catch (e) {
    console.error("Failed to load milestones data", e);
  }

  return <About milestones={milestones} />;
}
