import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
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
  const collectionsToTest = ["gallery", "tags", "timeline", "milestones"];
  for (const col of collectionsToTest) {
    console.log(`\nCollection: ${col}`);
    try {
      const snap = await getDocs(collection(db, col));
      if (snap.empty) {
        console.log("  (empty)");
      } else {
        snap.forEach(doc => {
          console.log(`  Doc [${doc.id}]:`, doc.data());
        });
      }
    } catch (e) {
      console.error("  Error:", e.message);
    }
  }
}

main().catch(console.error);
