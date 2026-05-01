import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

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

async function seed() {
  const galleryPath = path.join(process.cwd(), "src", "data", "gallery.json");
  const tagsPath = path.join(process.cwd(), "src", "data", "tags.json");
  const timelinePath = path.join(process.cwd(), "src", "data", "timeline.json");

  const galleryData = JSON.parse(await fs.readFile(galleryPath, "utf-8"));
  const tagsData = JSON.parse(await fs.readFile(tagsPath, "utf-8"));
  const timelineData = JSON.parse(await fs.readFile(timelinePath, "utf-8"));

  console.log("Setting gallery...");
  await setDoc(doc(db, "portfolio_data", "gallery"), { items: galleryData });
  
  console.log("Setting tags...");
  await setDoc(doc(db, "portfolio_data", "tags"), { items: tagsData });

  console.log("Setting timeline...");
  await setDoc(doc(db, "portfolio_data", "timeline"), { items: timelineData });

  console.log("Done!");
  process.exit(0);
}

seed().catch(console.error);
