import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error("Error: Firebase configuration missing in .env file.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName) {
  const q = collection(db, collectionName);
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function migrate() {
  console.log("🚀 Starting Clean-Slate Migration...");

  try {
    // 1. Clear existing Gallery
    console.log("🧹 Clearing existing gallery data...");
    await clearCollection("gallery");

    // 2. Migrate Tags
    const tagsPath = path.join(process.cwd(), "src/data/tags.json");
    if (fs.existsSync(tagsPath)) {
      const tags = JSON.parse(fs.readFileSync(tagsPath, "utf-8"));
      await setDoc(doc(db, "config", "tags"), { list: tags });
      console.log("✅ Tags synced.");
    }

    // 3. Migrate Gallery
    const galleryPath = path.join(process.cwd(), "src/data/gallery.json");
    if (fs.existsSync(galleryPath)) {
      const gallery = JSON.parse(fs.readFileSync(galleryPath, "utf-8"));
      for (let i = 0; i < gallery.length; i++) {
        await addDoc(collection(db, "gallery"), {
          ...gallery[i],
          order: i
        });
      }
      console.log(`✅ Gallery synced (${gallery.length} images).`);
    }

    // 4. Migrate Timeline
    const timelinePath = path.join(process.cwd(), "src/data/timeline.json");
    if (fs.existsSync(timelinePath)) {
      const timeline = JSON.parse(fs.readFileSync(timelinePath, "utf-8"));
      await setDoc(doc(db, "config", "timeline"), { events: timeline });
      console.log("✅ Timeline synced.");
    }

    // 5. Migrate Milestones
    const milestonesPath = path.join(process.cwd(), "src/data/milestones.json");
    if (fs.existsSync(milestonesPath)) {
      const milestones = JSON.parse(fs.readFileSync(milestonesPath, "utf-8"));
      await setDoc(doc(db, "config", "milestones"), { list: milestones });
      console.log("✅ Milestones synced.");
    }

    console.log("\n✨ Database is now perfectly consistent with your JSON files!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
