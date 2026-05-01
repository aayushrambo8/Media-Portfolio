import { Gallery } from "../../components/Gallery";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export const dynamic = "force-dynamic";

export default async function Page() {
  let tags: string[] = [];
  let images: any[] = [];
  
  try {
    const tagsDoc = await getDoc(doc(db, "portfolio_data", "tags"));
    if (tagsDoc.exists()) {
      tags = tagsDoc.data().items || [];
    }

    const galleryDoc = await getDoc(doc(db, "portfolio_data", "gallery"));
    if (galleryDoc.exists()) {
      images = galleryDoc.data().items || [];
    }
  } catch(e) {
    console.error("Could not fetch gallery data from Firestore", e);
  }

  return <Gallery initialImages={images} initialTags={tags} />;
}
