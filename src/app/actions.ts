"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const GALLERY_FILE = path.join(process.cwd(), "src/data/gallery.json");
const TAGS_FILE = path.join(process.cwd(), "src/data/tags.json");

export async function login(password: string) {
  if (password === "admin123") {
    (await cookies()).set("admin_session", "true", { httpOnly: true, path: "/" });
    return { success: true };
  }
  return { success: false, error: "Invalid password" };
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
