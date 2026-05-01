import { Gallery } from "../../components/Gallery";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export default async function Page() {
  const TAGS_FILE = path.join(process.cwd(), "src/data/tags.json");
  const GALLERY_FILE = path.join(process.cwd(), "src/data/gallery.json");
  
  let tags: string[] = [];
  let images: any[] = [];
  
  try {
    const tagsData = await fs.readFile(TAGS_FILE, "utf-8");
    tags = JSON.parse(tagsData);
    
    const galleryData = await fs.readFile(GALLERY_FILE, "utf-8");
    images = JSON.parse(galleryData);
  } catch(e) {
    console.error("Could not fetch gallery data from JSON", e);
  }

  return <Gallery initialImages={images} initialTags={tags} />;
}

