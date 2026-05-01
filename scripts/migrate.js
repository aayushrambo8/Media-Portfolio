import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
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

async function migrate() {
  console.log("Starting migration...");

  try {
    // 1. Migrate Tags
    const tagsPath = path.join(process.cwd(), "src/data/tags.json");
    if (fs.existsSync(tagsPath)) {
      const tags = JSON.parse(fs.readFileSync(tagsPath, "utf-8"));
      await setDoc(doc(db, "config", "tags"), { list: tags });
      console.log("✅ Tags migrated.");
    }

    // 2. Migrate Gallery
    const galleryPath = path.join(process.cwd(), "src/data/gallery.json");
    if (fs.existsSync(galleryPath)) {
      const gallery = JSON.parse(fs.readFileSync(galleryPath, "utf-8"));
      for (let i = 0; i < gallery.length; i++) {
        await addDoc(collection(db, "gallery"), {
          ...gallery[i],
          order: i
        });
      }
      console.log(`✅ Gallery migrated (${gallery.length} images).`);
    }

    // 3. Migrate Timeline
    const timelinePath = path.join(process.cwd(), "src/data/timeline.json");
    if (fs.existsSync(timelinePath)) {
      const timeline = JSON.parse(fs.readFileSync(timelinePath, "utf-8"));
      await setDoc(doc(db, "config", "timeline"), { events: timeline });
      console.log("✅ Timeline migrated.");
    }

    // 4. Migrate Milestones
    const milestonesPath = path.join(process.cwd(), "src/data/milestones.json");
    if (fs.existsSync(milestonesPath)) {
      const milestones = JSON.parse(fs.readFileSync(milestonesPath, "utf-8"));
      await setDoc(doc(db, "config", "milestones"), { list: milestones });
      console.log("✅ Milestones migrated.");
    }

    console.log("\n🚀 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
