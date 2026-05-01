import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { db } from "@/lib/firebase";
export const dynamic = "force-dynamic";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";

export default async function AdminPage() {
  const session = (await cookies()).get("admin_session");
  if (!session) {
    redirect("/login");
  }

  let tags: string[] = [];
  let images: any[] = [];
  let timeline: any[] = [];
  let milestones: any[] = [];
  
  try {
    // Fetch Tags
    const tagsDoc = await getDoc(doc(db, "config", "tags"));
    if (tagsDoc.exists()) tags = tagsDoc.data().list;
    
    // Fetch Gallery (Ordered)
    const galleryQuery = query(collection(db, "gallery"), orderBy("order", "asc"));
    const gallerySnapshot = await getDocs(galleryQuery);
    images = gallerySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Fetch Timeline
    const timelineDoc = await getDoc(doc(db, "config", "timeline"));
    if (timelineDoc.exists()) timeline = timelineDoc.data().events;

    // Fetch Milestones
    const milestonesDoc = await getDoc(doc(db, "config", "milestones"));
    if (milestonesDoc.exists()) milestones = milestonesDoc.data().list;

  } catch(e) {
    console.error("Could not fetch data from Firestore", e);
  }

  return (
    <AdminDashboard 
      initialTags={tags} 
      initialImages={images} 
      initialTimeline={timeline}
      initialMilestones={milestones}
    />
  );
}
