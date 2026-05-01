"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const GALLERY_FILE = path.join(process.cwd(), "src/data/gallery.json");
const TAGS_FILE = path.join(process.cwd(), "src/data/tags.json");
const TIMELINE_FILE = path.join(process.cwd(), "src/data/timeline.json");
const MILESTONES_FILE = path.join(process.cwd(), "src/data/milestones.json");

async function readJson(file: string) {
  try {
    const data = await fs.readFile(file, "utf-8");
    if (!data.trim()) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
}

async function writeJson(file: string, data: any) {
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${file}:`, error);
    return false;
  }
}

async function autoPruneTags() {
  try {
    const images = await readJson(GALLERY_FILE);
    const activeTags = new Set<string>();
    
    images.forEach((img: any) => {
      if (img.tags) {
        img.tags.split(",").forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) activeTags.add(trimmed);
        });
      }
    });

    const currentTags = await readJson(TAGS_FILE) as string[];
    const newTags = currentTags.filter(tag => activeTags.has(tag));

    if (newTags.length !== currentTags.length) {
      await writeJson(TAGS_FILE, newTags.sort());
      return newTags.sort();
    }
    return currentTags;
  } catch (error) {
    console.error("Error in autoPruneTags:", error);
    return [];
  }
}


export async function login(username: string, password: string) {
  const envUser = process.env.ADMIN_USERNAME || "admin";
  const envPassHash = process.env.ADMIN_PASSWORD || "$2a$10$YourDefaultHashHere"; 

  const isHash = envPassHash.startsWith("$2a$");

  if (username === envUser) {
    const isValid = isHash
      ? await bcrypt.compare(password, envPassHash)
      : password === envPassHash;

    if (isValid) {
      (await cookies()).set("admin_session", "true", { httpOnly: true, path: "/" });
      return { success: true };
    }
  }
  return { success: false, error: "Invalid username or password" };
}

export async function logout() {
  (await cookies()).delete("admin_session");
  return { success: true };
}

export async function updateCredentials(oldUser: string, oldPass: string, newUser: string, newPass: string) {
  return {
    success: false,
    error: "Credential changes must now be made in your environment variables (Vercel Dashboard or .env file) for security."
  };
}

export async function addTag(tag: string) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  const tags = await readJson(TAGS_FILE) as string[];
  const formattedTag = tag.trim();
  
  if (formattedTag && !tags.includes(formattedTag)) {
    tags.push(formattedTag);
    tags.sort();
    const success = await writeJson(TAGS_FILE, tags);
    if (success) {
      revalidatePath("/admin");
      revalidatePath("/gallery");
      return { success: true };
    }
  }
  return { success: false, error: "Failed to add tag" };
}

export async function addTags(newTags: string[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const tags = await readJson(TAGS_FILE) as string[];
    let changed = false;

    newTags.forEach(tag => {
      const formatted = tag.trim();
      if (formatted && !tags.includes(formatted)) {
        tags.push(formatted);
        changed = true;
      }
    });

    if (changed) {
      tags.sort();
      await writeJson(TAGS_FILE, tags);
      revalidatePath("/admin");
      revalidatePath("/gallery");
    }
    return { success: true };
  } catch (error) {
    console.error("Error in addTags:", error);
    return { success: false, error: "Failed to add tags" };
  }
}

export async function addImage(image: { url: string; label: string; category: string; tags: string }) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  const images = await readJson(GALLERY_FILE);
  images.unshift(image);

  const success = await writeJson(GALLERY_FILE, images);
  if (success) {
    revalidatePath("/admin");
    revalidatePath("/gallery");
    return { success: true };
  }
  return { success: false, error: "Failed to add image" };
}

export async function updateImage(originalUrl: string, updatedImage: { url: string; label: string; category: string; tags: string }) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  const images = await readJson(GALLERY_FILE);
  const index = images.findIndex((img: any) => img.url === originalUrl);
  
  if (index !== -1) {
    images[index] = updatedImage;
    const writeSuccess = await writeJson(GALLERY_FILE, images);
    if (writeSuccess) {
      const latestTags = await autoPruneTags();
      revalidatePath("/admin");
      revalidatePath("/gallery");
      return { success: true, tags: latestTags };
    }
    return { success: false, error: "Failed to write gallery data" };
  }
  return { success: false, error: "Original image not found" };
}

export async function deleteImage(url: string) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  let images = await readJson(GALLERY_FILE);
  images = images.filter((img: any) => img.url !== url);
  
  const success = await writeJson(GALLERY_FILE, images);
  if (success) {
    const latestTags = await autoPruneTags();
    revalidatePath("/admin");
    revalidatePath("/gallery");
    return { success: true, tags: latestTags };
  }
  return { success: false, error: "Failed to delete image" };
}

export async function updateTimeline(events: any[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  const success = await writeJson(TIMELINE_FILE, events);
  if (success) {
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  }
  return { success: false, error: "Failed to update timeline" };
}

export async function updateMilestones(milestones: any[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  const success = await writeJson(MILESTONES_FILE, milestones);
  if (success) {
    revalidatePath("/about");
    revalidatePath("/admin");
    return { success: true };
  }
  return { success: false, error: "Failed to update milestones" };
}

export async function reorderImages(newImages: any[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  const success = await writeJson(GALLERY_FILE, newImages);
  if (success) {
    revalidatePath("/gallery");
    revalidatePath("/admin");
    return { success: true };
  }
  return { success: false, error: "Failed to reorder images" };
}
