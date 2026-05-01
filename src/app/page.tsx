import { Home } from "../components/Home";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export const dynamic = "force-dynamic";

export default async function Page() {
  let timelineEvents = [];
  
  try {
    const timelineDoc = await getDoc(doc(db, "portfolio_data", "timeline"));
    if (timelineDoc.exists()) {
      timelineEvents = timelineDoc.data().items || [];
    }
  } catch (e) {
    console.error("Failed to load timeline data from Firestore", e);
  }

  return <Home timelineEvents={timelineEvents} />;
}
