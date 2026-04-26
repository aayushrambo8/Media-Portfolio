"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const GALLERY_FILE = path.join(process.cwd(), "src/data/gallery.json");
const TAGS_FILE = path.join(process.cwd(), "src/data/tags.json");
const ADMIN_FILE = path.join(process.cwd(), "src/data/admin.json");

async function autoPruneTags() {
  const galleryData = await fs.readFile(GALLERY_FILE, "utf-8");
  const images = JSON.parse(galleryData);
  
  const activeTags = new Set<string>();
  images.forEach((img: any) => {
    if (img.tags) {
      img.tags.split(",").forEach((t: string) => {
        const trimmed = t.trim();
        if (trimmed) activeTags.add(trimmed);
      });
    }
  });

  const tagsData = await fs.readFile(TAGS_FILE, "utf-8");
  const currentTags = JSON.parse(tagsData) as string[];
  
  const newTags = currentTags.filter(tag => activeTags.has(tag));
  
  if (newTags.length !== currentTags.length) {
    await fs.writeFile(TAGS_FILE, JSON.stringify(newTags.sort(), null, 2));
    return newTags.sort();
  }
  return currentTags;
}

export async function login(username: string, password: string) {
  try {
    const data = await fs.readFile(ADMIN_FILE, "utf-8");
    const admin = JSON.parse(data);
    
    if (admin.username === username && admin.password === password) {
      (await cookies()).set("admin_session", "true", { httpOnly: true, path: "/" });
      return { success: true };
    }
    return { success: false, error: "Invalid username or password" };
  } catch (error) {
    return { success: false, error: "Authentication system error" };
  }
}

export async function updateCredentials(oldUser: string, oldPass: string, newUser: string, newPass: string) {
  try {
    const data = await fs.readFile(ADMIN_FILE, "utf-8");
    const admin = JSON.parse(data);
    
    if (admin.username === oldUser && admin.password === oldPass) {
      await fs.writeFile(ADMIN_FILE, JSON.stringify({ username: newUser, password: newPass }, null, 2));
      return { success: true };
    }
    return { success: false, error: "Invalid current username or password" };
  } catch (error) {
    return { success: false, error: "Failed to update credentials" };
  }
}

export async function addTag(tag: string) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const data = await fs.readFile(TAGS_FILE, "utf-8");
    const tags = JSON.parse(data) as string[];
    
    const formattedTag = tag.trim();
    if (formattedTag && !tags.includes(formattedTag)) {
      tags.push(formattedTag);
      tags.sort();
      await fs.writeFile(TAGS_FILE, JSON.stringify(tags, null, 2));
      revalidatePath("/admin");
      revalidatePath("/gallery");
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to add tag" };
  }
}

export async function addImage(image: { url: string; label: string; category: string; tags: string }) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const data = await fs.readFile(GALLERY_FILE, "utf-8");
    const images = JSON.parse(data);
    
    images.unshift(image);
    
    await fs.writeFile(GALLERY_FILE, JSON.stringify(images, null, 2));
    revalidatePath("/admin");
    revalidatePath("/gallery");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to add image" };
  }
}

export async function updateImage(originalUrl: string, updatedImage: { url: string; label: string; category: string; tags: string }) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const data = await fs.readFile(GALLERY_FILE, "utf-8");
    let images = JSON.parse(data);
    
    const index = images.findIndex((img: any) => img.url === originalUrl);
    if (index !== -1) {
      images[index] = updatedImage;
      await fs.writeFile(GALLERY_FILE, JSON.stringify(images, null, 2));
      const latestTags = await autoPruneTags();
      revalidatePath("/admin");
      revalidatePath("/gallery");
      return { success: true, tags: latestTags };
    }
    return { success: false, error: "Original image not found" };
  } catch (error) {
    return { success: false, error: "Failed to update image" };
  }
}

export async function deleteImage(url: string) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const data = await fs.readFile(GALLERY_FILE, "utf-8");
    let images = JSON.parse(data);
    
    images = images.filter((img: any) => img.url !== url);
    await fs.writeFile(GALLERY_FILE, JSON.stringify(images, null, 2));
    const latestTags = await autoPruneTags();
    revalidatePath("/admin");
    revalidatePath("/gallery");
    return { success: true, tags: latestTags };
  } catch (error) {
    return { success: false, error: "Failed to delete image" };
  }
}
