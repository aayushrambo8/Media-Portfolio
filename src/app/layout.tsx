import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { DisableRightClick } from "@/components/DisableRightClick";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "Aayush Babu | Visual Storyteller & Technologist",
  description: "Photography portfolio and professional work of Aayush Babu. Capturing iconic moments for artists and events with engineering precision.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <DisableRightClick />
        <CustomCursor />
        <div className="grain-overlay" aria-hidden="true" />
        <div className="min-h-screen bg-[#0A0E1A] text-[#F8FAFC]">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
