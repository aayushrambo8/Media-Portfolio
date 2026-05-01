import fs from "fs/promises";
import path from "path";

async function shuffleGallery() {
  const galleryPath = path.join(process.cwd(), "src", "data", "gallery.json");
  
  try {
    const data = await fs.readFile(galleryPath, "utf-8");
    const images = JSON.parse(data);
    
    // Fisher-Yates shuffle
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }
    
    await fs.writeFile(galleryPath, JSON.stringify(images, null, 2), "utf-8");
    console.log(`Successfully shuffled ${images.length} images.`);
  } catch (error) {
    console.error("Error shuffling gallery:", error);
  }
}

shuffleGallery();
