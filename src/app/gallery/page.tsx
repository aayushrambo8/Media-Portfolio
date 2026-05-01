import { Gallery } from "../../components/Gallery";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export default async function Page() {
  let tags: string[] = [];
  let images: any[] = [];

  try {
    const dataDir = path.join(process.cwd(), "src/data");
    const tagsData = await fs.readFile(path.join(dataDir, "tags.json"), "utf-8");
    tags = JSON.parse(tagsData);

    const galleryData = await fs.readFile(path.join(dataDir, "gallery.json"), "utf-8");
    images = JSON.parse(galleryData);
  } catch (e) {
    console.error("Could not fetch gallery data from JSON", e);
  }

  return <Gallery initialImages={images} initialTags={tags} />;
}
