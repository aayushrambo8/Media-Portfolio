import { About } from "../../components/About";
import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";

export default async function Page() {
  let milestones = [];
  
  try {
    const milestonesDoc = await getDoc(doc(db, "config", "milestones"));
    if (milestonesDoc.exists()) milestones = milestonesDoc.data().list;
  } catch (e) {
    console.error("Failed to load milestones data", e);
  }

  return <About milestones={milestones} />;
}
