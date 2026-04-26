import fs from "fs/promises";
import path from "path";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const TAGS_FILE = path.join(process.cwd(), "src/data/tags.json");
  const GALLERY_FILE = path.join(process.cwd(), "src/data/gallery.json");
  
  let tags: string[] = [];
  let images: any[] = [];
  
  try {
    const tagsData = await fs.readFile(TAGS_FILE, "utf-8");
    tags = JSON.parse(tagsData) as string[];
    
    const galleryData = await fs.readFile(GALLERY_FILE, "utf-8");
    images = JSON.parse(galleryData);
  } catch(e) {
    console.error("Could not read data files", e);
  }

  return <AdminDashboard initialTags={tags} initialImages={images} />;
}
