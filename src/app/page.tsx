import { Home } from "../components/Home";
import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  let timelineEvents = [];
  let showcaseImages: any[] = [];
  
  try {
    const [timelineRes, galleryRes] = await Promise.all([
      supabase.from("portfolio_data").select("items").eq("key", "timeline").single(),
      supabase.from("portfolio_data").select("items").eq("key", "gallery").single(),
    ]);

    if (timelineRes.data?.items) {
      timelineEvents = timelineRes.data.items;
    }
    if (galleryRes.data?.items) {
      showcaseImages = galleryRes.data.items;
    }
  } catch (e) {
    console.error("Failed to load portfolio data from Supabase", e);
  }

  return <Home timelineEvents={timelineEvents} showcaseImages={showcaseImages} />;
}
