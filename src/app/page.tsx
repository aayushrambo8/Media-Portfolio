import { Home } from "../components/Home";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export default async function Page() {
  const TIMELINE_FILE = path.join(process.cwd(), "src/data/timeline.json");
  let timelineEvents = [];
  
  try {
    const timelineData = await fs.readFile(TIMELINE_FILE, "utf-8");
    timelineEvents = JSON.parse(timelineData);
  } catch (e) {
    console.error("Failed to load timeline data from JSON", e);
  }

  return <Home timelineEvents={timelineEvents} />;
}

