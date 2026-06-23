import { Gallery } from "../../components/Gallery";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  let tags: string[] = [];
  let images: any[] = [];

  try {
    const [tagsResult, galleryResult] = await Promise.all([
      supabase.from("portfolio_data").select("items").eq("key", "tags").single(),
      supabase.from("portfolio_data").select("items").eq("key", "gallery").single(),
    ]);

    if (tagsResult.error && tagsResult.error.code !== "PGRST116") throw tagsResult.error;
    if (galleryResult.error && galleryResult.error.code !== "PGRST116") throw galleryResult.error;

    tags = tagsResult.data?.items || [];
    images = galleryResult.data?.items || [];
  } catch (e) {
    console.error("Could not fetch gallery data from Supabase", e);
  }

  return <Gallery initialImages={images} initialTags={tags} />;
}
