"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleContactClick = () => {
    // Navigate to about page, then scroll to contact section
    if (pathname !== '/about') {
      window.location.href = '/about#contact';
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Gallery", path: "/gallery" },
    { name: "About", path: "/about" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="px-4 md:px-6 lg:px-12 py-4 md:py-6 flex justify-center">
        <motion.div
          animate={{
            backgroundColor: scrolled 
              ? "rgba(15, 20, 25, 0.95)" 
              : "rgba(15, 20, 25, 0.7)",
            borderColor: scrolled ? "rgba(245, 158, 11, 0.3)" : "rgba(248, 250, 252, 0.1)",
            boxShadow: scrolled 
              ? "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(245, 158, 11, 0.1)" 
              : "0 4px 24px rgba(0, 0, 0, 0.3)",
            padding: scrolled ? "0.5rem 1rem" : "1rem 2rem",
            borderRadius: scrolled ? "50px" : "20px",
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="mx-auto backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between border overflow-hidden"
          style={{ width: scrolled ? "max-content" : "100%", maxWidth: "1600px" }}
        >
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3"
              >
                <motion.div 
                  animate={{ 
                    borderRadius: scrolled ? "50px" : "12px",
                    scale: scrolled ? 0.9 : 1
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-12 h-12 flex items-center justify-center shadow-lg overflow-hidden bg-white/5"
                >
                  <img className="w-full h-full object-contain p-1" src="https://ik.imagekit.io/aayushrambo8/logo.jpg" alt="Logo" />
                </motion.div>
                <motion.div
                  layout
                  initial={false}
                  animate={{ 
                    maxWidth: scrolled ? 0 : 300, 
                    opacity: scrolled ? 0 : 1,
                    marginLeft: scrolled ? 0 : "0.75rem"
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <div className="text-lg font-bold tracking-[0.15em] text-[#F8FAFC]">
                    AAYUSH BABU
                  </div>
                  <div className="text-xs text-[#94A3B8] tracking-wider">
                    PHOTOGRAPHY
                  </div>
                </motion.div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link, index) => {
                // Check if active: exact match for home, startsWith for others to handle sub-pages
                const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
                
                return (
                  <Link key={index} href={link.path}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="relative px-6 py-3"
                    >
                      <span
                        className={`text-base font-medium transition-colors duration-300 ${
                          isActive
                            ? "text-[#F59E0B]"
                            : "text-[#94A3B8] hover:text-[#F8FAFC]"
                        }`}
                      >
                        {link.name}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full"
                          transition={{ 
                            type: "spring", 
                            stiffness: 350, 
                            damping: 30,
                            layout: { duration: 0.3 } // Explicitly control layout transition speed
                          }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
              
              {/* CTA Button */}
              <motion.button
                layout
                onClick={handleContactClick}
                initial={false}
                animate={{ 
                  maxWidth: scrolled ? 0 : 200, 
                  opacity: scrolled ? 0 : 1,
                  paddingLeft: scrolled ? 0 : "1.5rem",
                  paddingRight: scrolled ? 0 : "1.5rem",
                  marginLeft: scrolled ? 0 : "1rem"
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#0A0E1A] rounded-[12px] font-semibold text-sm shadow-lg whitespace-nowrap py-3"
              >
                Get in Touch
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#F8FAFC]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-6 pt-6 border-t border-white/10"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link
                      key={index}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={`px-4 py-3 rounded-[12px] transition-colors ${
                          isActive
                            ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                            : "text-[#94A3B8] hover:bg-white/5"
                        }`}
                      >
                        {link.name}
                      </div>
                    </Link>
                  );
                })}
                <button
                  onClick={handleContactClick}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#0A0E1A] rounded-[12px] font-semibold"
                >
                  Get in Touch
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.nav>
  );
}