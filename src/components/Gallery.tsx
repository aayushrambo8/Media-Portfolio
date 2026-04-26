"use client";
import { motion } from "motion/react";
import { useState, useRef, useMemo } from "react";
import { ResponsiveMasonry } from "react-responsive-masonry";
import Masonry from "react-responsive-masonry";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Camera, Filter, X, Check } from "lucide-react";
import galleryData from "../data/gallery.json";
import tagsData from "../data/tags.json";

/* ================= TYPES ================= */
type GalleryImage = {
    url: string;
    label: string;
    category: string;
    tags: string;
};

/* ================= DATA ================= */
const galleryImages: GalleryImage[] = galleryData;

/* ================= COMPONENT ================= */
export function Gallery() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tapIndex, setTapIndex] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ================= INTERACTION ================= */
    const handleInteraction = (index: number) => {
        if (tapIndex === index) {
            setTapIndex(null);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else {
            setTapIndex(index);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                setTapIndex(null);
            }, 2500);
        }
    };

    const isVisible = (index: number) =>
        hoveredIndex === index || tapIndex === index;

    /* ================= TAG EXTRACTION ================= */
    const allTags = tagsData;

    /* ================= FILTER ================= */
    const filteredImages = useMemo(() => {
        if (selectedTags.length === 0) return galleryImages;

        return galleryImages.filter((img) => {
            const imgTags = img.tags.split(",").map((t: string) => t.trim());

            return selectedTags.some((tag: string) =>
                imgTags.includes(tag)
            );
        });
    }, [selectedTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    /* ================= UI ================= */
    return (
        <div className="pt-40 pb-20 px-4 relative">
            {/* ================= FILTER MODAL ================= */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isFilterOpen ? 1 : 0,
                    pointerEvents: isFilterOpen ? "auto" : "none",
                }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.3)_0%,_rgba(0,0,0,0.95)_100%)] backdrop-blur-xl p-4"
            >
                <motion.div 
                    initial={false}
                    animate={{
                        scale: isFilterOpen ? 1 : 0.95,
                        y: isFilterOpen ? 0 : 20,
                    }}
                    className="w-full max-w-md bg-[#1A1F2E]/95 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl flex flex-col max-h-[85vh]"
                >
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 flex-shrink-0">
                        <h2 className="text-2xl font-serif text-white">Filters</h2>
                        <div className="flex items-center gap-4">
                            {selectedTags.length > 0 && (
                                <button 
                                    onClick={() => setSelectedTags([])}
                                    className="text-sm text-[#94A3B8] hover:text-white transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                            <button 
                                onClick={() => setIsFilterOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-8 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {allTags.map((tag) => (
                            <label
                                key={tag}
                                className="flex items-center gap-4 cursor-pointer group p-3 hover:bg-white/5 rounded-xl transition-all duration-200"
                            >
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all duration-200 ${
                                    selectedTags.includes(tag) 
                                        ? "bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] border-transparent shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                                        : "border-white/20 group-hover:border-white/40 bg-black/20"
                                }`}>
                                    {selectedTags.includes(tag) && <Check className="w-4 h-4 text-[#0A0E1A]" strokeWidth={3} />}
                                </div>
                                <span className={`text-lg transition-colors ${
                                    selectedTags.includes(tag) ? "text-white font-medium" : "text-[#94A3B8] group-hover:text-white"
                                }`}>
                                    {tag}
                                </span>
                                <input 
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => toggleTag(tag)}
                                />
                            </label>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:shadow-[0_8px_24px_rgba(245,158,11,0.3)] text-[#0A0E1A] py-4 rounded-[16px] font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
                    >
                        Show {filteredImages.length} Results
                    </button>
                </motion.div>
            </motion.div>

            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                {/* Spacer for perfect center alignment */}
                <div className="flex-1 hidden md:block"></div>
                
                <h1 className="text-4xl text-white tracking-widest font-serif text-center flex-1">GALLERY</h1>
                
                <div className="flex-1 flex justify-end">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full backdrop-blur-md transition-all duration-300 border border-white/10"
                    >
                        <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filter</span>
                    </button>
                </div>
            </div>

            {/* ================= GRID ================= */}
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                <Masonry gutter="16px">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.url} // ✅ FIXED KEY
                            whileHover={{ y: -10 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="relative rounded-xl overflow-hidden cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => handleInteraction(index)}
                        >
                            <ImageWithFallback
                                src={image.url}
                                alt={image.label}
                                className="w-full"
                                loading="lazy"
                            />

                            {isVisible(index) && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-0 w-full p-4 pt-16 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/80 to-transparent flex flex-col justify-end"
                                >
                                    <p className="text-white font-serif text-lg md:text-xl mb-2 drop-shadow-md">{image.label}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {image.tags.split(",").map(t => t.trim()).filter(Boolean).map((tag, i) => (
                                            <span 
                                                key={i} 
                                                className="text-[10px] md:text-xs font-medium px-2.5 py-1 bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#FBBF24] rounded-full backdrop-blur-md"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </Masonry>
            </ResponsiveMasonry>

            {/* ================= EMPTY STATE ================= */}
            {filteredImages.length === 0 && (
                <p className="text-center text-gray-400 mt-10">
                    No images found
                </p>
            )}
        </div>
    );
}