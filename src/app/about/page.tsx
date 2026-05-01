import { About } from "../../components/About";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export default async function Page() {
  const MILESTONES_FILE = path.join(process.cwd(), "src/data/milestones.json");
  let milestones = [];
  
  try {
    const milestonesData = await fs.readFile(MILESTONES_FILE, "utf-8");
    milestones = JSON.parse(milestonesData);
  } catch (e) {
    console.error("Failed to load milestones data from JSON", e);
  }

  return <About milestones={milestones} />;
}

