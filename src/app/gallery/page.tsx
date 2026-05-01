import { Gallery } from "../../components/Gallery";
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

export default async function Page() {
  let tags: string[] = [];
  let images: any[] = [];
  
  try {
    const tagsDoc = await getDoc(doc(db, "config", "tags"));
    if (tagsDoc.exists()) tags = tagsDoc.data().list;
    
    const galleryQuery = query(collection(db, "gallery"), orderBy("order", "asc"));
    const gallerySnapshot = await getDocs(galleryQuery);
    images = gallerySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.error("Could not fetch gallery data", e);
  }

  return <Gallery initialImages={images} initialTags={tags} />;
}
