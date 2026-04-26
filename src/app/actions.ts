"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const GALLERY_FILE = path.join(process.cwd(), "src/data/gallery.json");
const TAGS_FILE = path.join(process.cwd(), "src/data/tags.json");
const TIMELINE_FILE = path.join(process.cwd(), "src/data/timeline.json");
const MILESTONES_FILE = path.join(process.cwd(), "src/data/milestones.json");

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
  const envUser = process.env.ADMIN_USERNAME || "admin";
  const envPass = process.env.ADMIN_PASSWORD || "admin123";

  if (username === envUser && password === envPass) {
    (await cookies()).set("admin_session", "true", { httpOnly: true, path: "/" });
    return { success: true };
  }
  return { success: false, error: "Invalid username or password" };
}

export async function logout() {
  (await cookies()).delete("admin_session");
  return { success: true };
}

export async function updateCredentials(oldUser: string, oldPass: string, newUser: string, newPass: string) {
  // Since we are using Environment Variables, we can't easily update them at runtime on Vercel.
  // We recommend updating them in your Vercel Dashboard or .env file.
  return { 
    success: false, 
    error: "Credential changes must now be made in your environment variables (Vercel Dashboard or .env file) for security." 
  };
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
    return { success: true, tags: undefined as string[] | undefined };
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

export async function updateTimeline(events: any[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await fs.writeFile(TIMELINE_FILE, JSON.stringify(events, null, 2));
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, tags: undefined as string[] | undefined };
  } catch (error) {
    return { success: false, error: "Failed to update timeline" };
  }
}

export async function updateMilestones(milestones: any[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await fs.writeFile(MILESTONES_FILE, JSON.stringify(milestones, null, 2));
    revalidatePath("/about");
    revalidatePath("/admin");
    return { success: true, tags: undefined as string[] | undefined };
  } catch (error) {
    return { success: false, error: "Failed to update milestones" };
  }
}

export async function reorderImages(newImages: any[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await fs.writeFile(GALLERY_FILE, JSON.stringify(newImages, null, 2));
    revalidatePath("/gallery");
    revalidatePath("/admin");
    return { success: true, tags: undefined as string[] | undefined };
  } catch (error) {
    return { success: false, error: "Failed to reorder images" };
  }
}
