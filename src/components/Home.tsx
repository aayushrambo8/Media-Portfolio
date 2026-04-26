"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { Award, Camera, Music, Users, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const timelineEvents = [
  {
    title: "Anwesha IIT Patna 2026",
    description: "Official photographer for IIT Patna's premier tech and cultural festival",
    type: "event",
    icon: Award,
    color: "#F59E0B",
    image: "https://ik.imagekit.io/aayushrambo8/Anwesha'26.webp?updatedAt=1775391839991",
  },
  {
    title: "Kaizen AIIMS Patna 2026",
    description: "Complete event coverage for AIIMS Patna's annual medical college fest",
    type: "event",
    icon: Camera,
    color: "#FBBF24",
    image: "https://ik.imagekit.io/aayushrambo8/compressed_DSC_6107.jpg",
  },
  {
    title: "Raftaar",
    description: "Official photographer for live concerts and performances",
    type: "artist",
    icon: Music,
    color: "#F59E0B",
    image: "https://ik.imagekit.io/aayushrambo8/compressed_DSC_6099.jpg",
  },
  {
    title: "Darshan Rawal",
    description: "Captured iconic moments from concert tours",
    type: "artist",
    icon: Music,
    color: "#FBBF24",
    image: "https://ik.imagekit.io/aayushrambo8/compressed_DSC_0130.jpg",
  },
  {
    title: "Chaar Diwari",
    description: "Professional photography collaboration",
    type: "artist",
    icon: Users,
    color: "#F59E0B",
    image: "https://ik.imagekit.io/aayushrambo8/compressed_DSC_9981.jpg",
  },
  {
    title: "Md. Irfaan Ali",
    description: "Coverage of live performances and musical events",
    type: "artist",
    icon: Music,
    color: "#FBBF24",
    image: "https://ik.imagekit.io/aayushrambo8/compressed_DSC_4685.jpg",
  },
  {
    title: "Shaan",
    description: "Professional photography for concerts and live shows",
    type: "artist",
    icon: Music,
    color: "#F59E0B",
    image: "https://ik.imagekit.io/aayushrambo8/compressed_DSC_6554.jpg",
  },
  {
    title: "Sunanda Sharma",
    description: "Professional photography for concerts and live shows",
    type: "artist",
    icon: Music,
    color: "#F59E0B",
    image: "https://ik.imagekit.io/aayushrambo8/compressed_DSC_1208.jpg",
  },
];

export function Home() {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(timelineEvents.length).fill(false)
  );
  const [lineHeight, setLineHeight] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = itemRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1 && entry.isIntersecting) {
            setVisibleItems((prev) => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const visibleCount = visibleItems.filter(Boolean).length;
    const totalCount = timelineEvents.length;
    const percentage = (visibleCount / totalCount) * 100;
    setLineHeight(percentage);
  }, [visibleItems]);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-12 relative overflow-hidden pt-24 md:pt-32">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-[500px] h-[500px] bg-[#F59E0B]/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-[#8B5CF6]/15 rounded-full blur-[120px]"
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-[1400px] w-full relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-8 px-6 py-2 rounded-full bg-gradient-to-r from-[#F59E0B]/10 to-[#8B5CF6]/10 border border-[#F59E0B]/20 backdrop-blur-sm"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
                Professional Photography Portfolio
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-6 md:mb-10 leading-[1.1] px-2 md:px-4">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="block font-serif text-[#F8FAFC]"
              >
                Engineering the Code.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="block font-sans bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent mt-4"
              >
                Capturing the Moment.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-base md:text-xl text-[#94A3B8] mb-10 md:mb-14 max-w-[650px] mx-auto leading-relaxed px-4"
            >
              A hybrid identity bridging technical precision and visual storytelling
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-5 justify-center px-4"
            >
              <Link href="/gallery">
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#0A0E1A] rounded-[16px] font-semibold text-lg shadow-xl flex items-center justify-center gap-3"
                >
                  View Work
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/about">
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    backgroundColor: "rgba(26, 31, 46, 0.9)",
                    borderColor: "#F59E0B",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-10 py-5 bg-[#1A1F2E]/60 backdrop-blur-sm border-2 border-white/20 text-[#F8FAFC] rounded-[16px] font-semibold text-lg transition-all duration-300"
                >
                  Get in Touch
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Highlight Ribbon */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mt-24 lg:mt-32 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/20 via-[#8B5CF6]/10 to-[#F59E0B]/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-[#1A1F2E]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 md:p-8 lg:p-12 shadow-2xl">
              <div className="flex items-start gap-4 md:gap-6 lg:gap-8">
                <div className="flex-shrink-0 w-1 md:w-1.5 h-20 md:h-24 lg:h-32 bg-gradient-to-b from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] rounded-full" />
                <div>
                  <p className="text-sm md:text-base lg:text-lg leading-relaxed text-[#CBD5E1]" style={{ lineHeight: 1.8 }}>
                    <span className="text-[#F59E0B] font-bold text-base md:text-lg lg:text-xl">2+ Years</span> of
                    Professional Photography. Photographer for{" "}
                    <span className="text-[#F8FAFC] font-semibold">Raftaar</span>,{" "}
                    <span className="text-[#F8FAFC] font-semibold">Chaar Diwari</span>,{" "}
                    <span className="text-[#F8FAFC] font-semibold">Darshan Rawal</span>,{" "}
                    <span className="text-[#F8FAFC] font-semibold">Little Bhatia</span>,{" "}
                    <span className="text-[#F8FAFC] font-semibold">Shaan, ETC</span>. Coverage of{" "}
                    <span className="text-[#FBBF24] font-semibold">Anwesha'26 IIT-P </span>, {" "}
                    <span className="text-[#FBBF24] font-semibold">Kaizen'26 AIIMS Patna </span>, {" "}
                    <span className="text-[#FBBF24] font-semibold">Amiphoria'26 Amity University Patna</span>.{" "}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Vertical Timeline Section */}
      <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-12 bg-gradient-to-b from-transparent via-[#0F1419]/50 to-transparent mt-10 md:mt-20">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 md:mb-20 lg:mb-24 text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6 font-serif text-[#F8FAFC]">Journey</h2>
            <p className="text-base md:text-lg lg:text-xl text-[#94A3B8] max-w-[600px] mx-auto px-4">
              Events and collaborations that shaped my photography career
            </p>
          </motion.div>

          <div className="relative">
            {/* Animated timeline line */}
            <div className="absolute left-[23px] md:left-[31px] top-0 w-[3px] md:w-[4px] h-full bg-white/5 rounded-full" />
            <motion.div
              className="absolute left-[23px] md:left-[31px] top-0 w-[3px] md:w-[4px] bg-gradient-to-b from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]"
              style={{ height: `${lineHeight}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />

            <div className="space-y-12 md:space-y-20">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={index}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={
                    visibleItems[index]
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -50 }
                  }
                  transition={{
                    duration: 0.7,
                    delay: index * 0.1,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="flex items-start gap-6 md:gap-10 group"
                >
                  {/* Glowing dot */}
                  <div className="relative mt-2 md:mt-4 flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={visibleItems[index] ? { scale: 1 } : { scale: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1 + 0.2,
                        ease: "backOut",
                      }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center relative z-10 bg-[#1A1F2E] border-2 group-hover:border-4 transition-all duration-300"
                      style={{
                        borderColor: event.color,
                        boxShadow: `0 0 0 6px ${event.color}15, 0 0 20px ${event.color}40`,
                      }}
                    >
                      <event.icon className="w-5 h-5 md:w-7 md:h-7" style={{ color: event.color }} />
                    </motion.div>
                  </div>

                  {/* Content card */}
                  <motion.div
                    whileHover={{
                      y: -8,
                      scale: 1.01,
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[20px] overflow-hidden border border-white/10 shadow-xl"
                  >
                    {/* Image */}
                    <div className="relative h-[200px] md:h-[300px] overflow-hidden group/img">
                      <ImageWithFallback
                        src={event.image}
                        alt={event.title}
                        className={`w-full h-full object-cover ${event.title === "Sunanda Sharma" ? "object-center" : "object-top"} transition-transform duration-700 group-hover/img:scale-110`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/50 to-transparent opacity-80" />
                      <div
                        className="absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(to top, ${event.color}30, transparent)`,
                        }}
                      />
                    </div>

                    {/* Text Content */}
                    <div className="p-5 md:p-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <h3 className="text-2xl md:text-3xl text-[#F8FAFC] font-serif group-hover:text-[#FBBF24] transition-colors duration-300">
                          {event.title}
                        </h3>
                        <span
                          className="px-3 md:px-4 py-1 md:py-1.5 text-[10px] md:text-xs font-bold rounded-full flex-shrink-0 uppercase tracking-wider"
                          style={{
                            backgroundColor: `${event.color}20`,
                            color: event.color,
                            border: `1px solid ${event.color}40`,
                          }}
                        >
                          {event.type}
                        </span>
                      </div>
                      <p className="text-[#94A3B8] leading-relaxed text-base md:text-lg">
                        {event.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}