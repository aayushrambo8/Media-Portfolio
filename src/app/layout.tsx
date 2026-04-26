import { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "Professional Portfolio Design",
  description: "A professional portfolio design showcasing the skills and projects of a software developer. The portfolio includes sections for about me, projects, skills, and contact information. It is designed to be visually appealing and easy to navigate, with a clean and modern layout.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://ik.imagekit.io/aayushrambo8/logo.jpg" />
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0F1419] to-[#0A0E1A] text-[#F8FAFC]">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
