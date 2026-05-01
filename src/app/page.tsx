import { Home } from "../components/Home";
import { db } from "@/lib/firebase";
export const dynamic = "force-dynamic";
import { getDoc, doc } from "firebase/firestore";

export default async function Page() {
  let timelineEvents = [];
  
  try {
    const timelineDoc = await getDoc(doc(db, "config", "timeline"));
    if (timelineDoc.exists()) timelineEvents = timelineDoc.data().events;
  } catch (e) {
    console.error("Failed to load timeline data", e);
  }

  return <Home timelineEvents={timelineEvents} />;
}
