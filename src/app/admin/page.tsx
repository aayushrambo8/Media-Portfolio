import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { supabase } from "../../lib/supabase";

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
    const [tagsRes, galleryRes, timelineRes, milestonesRes] = await Promise.all([
      supabase.from("portfolio_data").select("items").eq("key", "tags").single(),
      supabase.from("portfolio_data").select("items").eq("key", "gallery").single(),
      supabase.from("portfolio_data").select("items").eq("key", "timeline").single(),
      supabase.from("portfolio_data").select("items").eq("key", "milestones").single(),
    ]);

    if (tagsRes.error && tagsRes.error.code !== "PGRST116") throw tagsRes.error;
    if (galleryRes.error && galleryRes.error.code !== "PGRST116") throw galleryRes.error;
    if (timelineRes.error && timelineRes.error.code !== "PGRST116") throw timelineRes.error;
    if (milestonesRes.error && milestonesRes.error.code !== "PGRST116") throw milestonesRes.error;

    tags = tagsRes.data?.items || [];
    images = galleryRes.data?.items || [];
    timeline = timelineRes.data?.items || [];
    milestones = milestonesRes.data?.items || [];
  } catch(e) {
    console.error("Could not read portfolio data from Supabase", e);
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
