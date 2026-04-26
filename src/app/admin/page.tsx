import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const session = (await cookies()).get("admin_session");
  if (!session) {
    redirect("/login");
  }

  const TAGS_FILE = path.join(process.cwd(), "src/data/tags.json");
  const GALLERY_FILE = path.join(process.cwd(), "src/data/gallery.json");
  const TIMELINE_FILE = path.join(process.cwd(), "src/data/timeline.json");
  const MILESTONES_FILE = path.join(process.cwd(), "src/data/milestones.json");
  
  let tags: string[] = [];
  let images: any[] = [];
  let timeline: any[] = [];
  let milestones: any[] = [];
  
  try {
    const tagsData = await fs.readFile(TAGS_FILE, "utf-8");
    tags = JSON.parse(tagsData) as string[];
    
    const galleryData = await fs.readFile(GALLERY_FILE, "utf-8");
    images = JSON.parse(galleryData);

    const timelineData = await fs.readFile(TIMELINE_FILE, "utf-8");
    timeline = JSON.parse(timelineData);

    const milestonesData = await fs.readFile(MILESTONES_FILE, "utf-8");
    milestones = JSON.parse(milestonesData);
  } catch(e) {
    console.error("Could not read data files", e);
  }

  return (
    <AdminDashboard 
      initialTags={tags} 
      initialImages={images} 
      initialTimeline={timeline}
      initialMilestones={milestones}
    />
  );
}
