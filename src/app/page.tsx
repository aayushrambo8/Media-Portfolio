import { Home } from "../components/Home";
import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  let timelineEvents = [];
  
  try {
    const { data, error } = await supabase
      .from("portfolio_data")
      .select("items")
      .eq("key", "timeline")
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        throw error;
      }
    } else {
      timelineEvents = data?.items || [];
    }
  } catch (e) {
    console.error("Failed to load timeline data from Supabase", e);
  }

  return <Home timelineEvents={timelineEvents} />;
}
