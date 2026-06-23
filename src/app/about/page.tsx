import { About } from "../../components/About";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  let milestones = [];
  
  try {
    const { data, error } = await supabase
      .from("portfolio_data")
      .select("items")
      .eq("key", "milestones")
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        throw error;
      }
    } else {
      milestones = data?.items || [];
    }
  } catch (e) {
    console.error("Failed to load milestones data from Supabase", e);
  }

  return <About milestones={milestones} />;
}

