"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  writeBatch,
  getDoc,
  addDoc
} from "firebase/firestore";

// Helper for reordering and fetching
async function getOrderedGallery() {
  const q = query(collection(db, "gallery"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function autoPruneTags() {
  try {
    const images = await getOrderedGallery();
    const activeTags = new Set<string>();
    
    images.forEach((img: any) => {
      if (img.tags) {
        img.tags.split(",").forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) activeTags.add(trimmed);
        });
      }
    });

    const tagsDoc = await getDoc(doc(db, "config", "tags"));
    const currentTags = (tagsDoc.exists() ? tagsDoc.data().list : []) as string[];
    const newTags = currentTags.filter(tag => activeTags.has(tag));

    if (newTags.length !== currentTags.length) {
      await setDoc(doc(db, "config", "tags"), { list: newTags.sort() });
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

  try {
    const tagsDoc = await getDoc(doc(db, "config", "tags"));
    const tags = (tagsDoc.exists() ? tagsDoc.data().list : []) as string[];
    const formattedTag = tag.trim();
    
    if (formattedTag && !tags.includes(formattedTag)) {
      tags.push(formattedTag);
      tags.sort();
      await setDoc(doc(db, "config", "tags"), { list: tags });
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
    const tagsDoc = await getDoc(doc(db, "config", "tags"));
    const tags = (tagsDoc.exists() ? tagsDoc.data().list : []) as string[];
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
      await setDoc(doc(db, "config", "tags"), { list: tags });
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
    // Update tags list
    const tagsDoc = await getDoc(doc(db, "config", "tags"));
    const tags = (tagsDoc.exists() ? tagsDoc.data().list : []) as string[];
    const index = tags.indexOf(oldName);
    if (index !== -1) {
      tags[index] = newName.trim();
      await setDoc(doc(db, "config", "tags"), { list: tags.sort() });
    }

    // Update tags in gallery documents
    const q = query(collection(db, "gallery"));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    let count = 0;

    snapshot.docs.forEach(d => {
      const img = d.data();
      if (img.tags) {
        const tagList = img.tags.split(",").map((t: string) => t.trim());
        const tagIndex = tagList.indexOf(oldName);
        if (tagIndex !== -1) {
          tagList[tagIndex] = newName.trim();
          batch.update(d.ref, { tags: tagList.join(", ") });
          count++;
        }
      }
    });

    if (count > 0) await batch.commit();
    
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
    const q = query(collection(db, "gallery"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    const minOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order - 1;

    await addDoc(collection(db, "gallery"), {
      ...image,
      order: minOrder
    });

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
    const q = query(collection(db, "gallery"));
    const snapshot = await getDocs(q);
    const docToUpdate = snapshot.docs.find(d => d.data().url === originalUrl);
    
    if (docToUpdate) {
      await setDoc(docToUpdate.ref, { ...updatedImage }, { merge: true });
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
    const q = query(collection(db, "gallery"));
    const snapshot = await getDocs(q);
    const docToDelete = snapshot.docs.find(d => d.data().url === url);

    if (docToDelete) {
      await deleteDoc(docToDelete.ref);
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
    await setDoc(doc(db, "config", "timeline"), { events });
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
    await setDoc(doc(db, "config", "milestones"), { list: milestones });
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
    const batch = writeBatch(db);
    newImages.forEach((img, idx) => {
      if (img.id) {
        batch.update(doc(db, "gallery", img.id), { order: idx });
      }
    });
    await batch.commit();
    revalidatePath("/gallery");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error in reorderImages:", error);
    return { success: false, error: "Failed to reorder images" };
  }
}
