import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

export function Root() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0F1419] to-[#0A0E1A] text-[#F8FAFC]">
      <Navbar />
      <Outlet />
    </div>
  );
}
