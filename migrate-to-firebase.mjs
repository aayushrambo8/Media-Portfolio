import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs/promises";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const files = {
    gallery: "src/data/gallery.json",
    tags: "src/data/tags.json",
    timeline: "src/data/timeline.json",
    milestones: "src/data/milestones.json",
  };

  for (const [key, path] of Object.entries(files)) {
    try {
      const dataStr = await fs.readFile(path, "utf-8");
      const dataObj = JSON.parse(dataStr);
      
      // We store the array under the 'items' field
      await setDoc(doc(db, "portfolio_data", key), { items: dataObj });
      console.log(`Successfully migrated ${key} to Firestore!`);
    } catch (e) {
      console.error(`Error migrating ${key}:`, e.message);
    }
  }
}

main().catch(console.error);
