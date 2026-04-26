"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 w-[500px] h-[500px] bg-[#F59E0B]/20 rounded-full blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-[700px] relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-[160px] font-serif leading-none mb-6 bg-gradient-to-br from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-4xl mb-6 text-[#F8FAFC] font-semibold">Page Not Found</h2>
          <p className="text-xl text-[#94A3B8] leading-relaxed mb-12">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <Link href="/">
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#0A0E1A] rounded-[16px] font-semibold text-lg shadow-xl transition-all duration-300 group"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </motion.button>
          </Link>

          <Link href="/gallery">
            <motion.button
              whileHover={{
                scale: 1.03,
                backgroundColor: "rgba(26, 31, 46, 0.9)",
                borderColor: "#F59E0B",
              }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#1A1F2E]/60 backdrop-blur-sm border-2 border-white/20 text-[#F8FAFC] rounded-[16px] font-semibold text-lg transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>View Gallery</span>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
