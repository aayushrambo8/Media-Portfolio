"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");
const GALLERY_FILE = path.join(DATA_DIR, "gallery.json");
const TAGS_FILE = path.join(DATA_DIR, "tags.json");
const TIMELINE_FILE = path.join(DATA_DIR, "timeline.json");
const MILESTONES_FILE = path.join(DATA_DIR, "milestones.json");

async function readJson(file: string) {
  try {
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
    return [];
  }
}

async function writeJson(file: string, data: any) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
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
      const sortedTags = newTags.sort();
      await writeJson(TAGS_FILE, sortedTags);
      return sortedTags;
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

  try {
    const tags = await readJson(TAGS_FILE) as string[];
    const formattedTag = tag.trim();
    
    if (formattedTag && !tags.includes(formattedTag)) {
      tags.push(formattedTag);
      tags.sort();
      await writeJson(TAGS_FILE, tags);
      revalidatePath("/admin");
      revalidatePath("/gallery");
      return { success: true };
    }
    return { success: false, error: "Tag already exists or is empty" };
  } catch (error) {
    console.error("Error in addTag:", error);
    return { success: false, error: "Failed to add tag" };
  }
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

export async function updateTag(oldName: string, newName: string) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const tags = await readJson(TAGS_FILE) as string[];
    const index = tags.indexOf(oldName);
    if (index !== -1) {
      tags[index] = newName.trim();
      await writeJson(TAGS_FILE, tags.sort());
    }

    const images = await readJson(GALLERY_FILE);
    let changed = false;
    const updatedImages = images.map((img: any) => {
      if (img.tags) {
        const tagList = img.tags.split(",").map((t: string) => t.trim());
        const tagIndex = tagList.indexOf(oldName);
        if (tagIndex !== -1) {
          tagList[tagIndex] = newName.trim();
          changed = true;
          return { ...img, tags: tagList.join(", ") };
        }
      }
      return img;
    });

    if (changed) {
      await writeJson(GALLERY_FILE, updatedImages);
    }
    
    revalidatePath("/admin");
    revalidatePath("/gallery");
    return { success: true };
  } catch (error) {
    console.error("Error in updateTag:", error);
    return { success: false, error: "Failed to update tag" };
  }
}

export async function addImage(image: { url: string; label: string; category: string; tags: string }) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const images = await readJson(GALLERY_FILE);
    // Add to the beginning
    const newImages = [image, ...images];
    await writeJson(GALLERY_FILE, newImages);

    revalidatePath("/admin");
    revalidatePath("/gallery");
    return { success: true };
  } catch (error) {
    console.error("Error in addImage:", error);
    return { success: false, error: "Failed to add image" };
  }
}

export async function updateImage(originalUrl: string, updatedImage: { url: string; label: string; category: string; tags: string }) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const images = await readJson(GALLERY_FILE);
    const index = images.findIndex((img: any) => img.url === originalUrl);
    
    if (index !== -1) {
      images[index] = { ...updatedImage };
      await writeJson(GALLERY_FILE, images);
      const latestTags = await autoPruneTags();
      revalidatePath("/admin");
      revalidatePath("/gallery");
      return { success: true, tags: latestTags };
    }
    return { success: false, error: "Original image not found" };
  } catch (error) {
    console.error("Error in updateImage:", error);
    return { success: false, error: "Failed to update image" };
  }
}

export async function deleteImage(url: string) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const images = await readJson(GALLERY_FILE);
    const newImages = images.filter((img: any) => img.url !== url);

    if (newImages.length !== images.length) {
      await writeJson(GALLERY_FILE, newImages);
      const latestTags = await autoPruneTags();
      revalidatePath("/admin");
      revalidatePath("/gallery");
      return { success: true, tags: latestTags };
    }
    return { success: false, error: "Image not found" };
  } catch (error) {
    console.error("Error in deleteImage:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

export async function updateTimeline(events: any[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await writeJson(TIMELINE_FILE, events);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error in updateTimeline:", error);
    return { success: false, error: "Failed to update timeline" };
  }
}

export async function updateMilestones(milestones: any[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await writeJson(MILESTONES_FILE, milestones);
    revalidatePath("/about");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error in updateMilestones:", error);
    return { success: false, error: "Failed to update milestones" };
  }
}

export async function reorderImages(newImages: any[]) {
  const session = (await cookies()).get("admin_session");
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    // For local JSON, reorder just means saving the array as is
    await writeJson(GALLERY_FILE, newImages);
    revalidatePath("/gallery");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error in reorderImages:", error);
    return { success: false, error: "Failed to reorder images" };
  }
}
