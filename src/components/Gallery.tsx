"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useMemo, useEffect } from "react";
import { ResponsiveMasonry } from "react-responsive-masonry";
import Masonry from "react-responsive-masonry";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Camera, Filter, X, Check, ChevronLeft, ChevronRight, Maximize2, Share2 } from "lucide-react";
/* ================= TYPES ================= */
type GalleryImage = {
    url: string;
    label: string;
    category: string;
    tags: string;
};

/* ================= COMPONENT ================= */
export function Gallery({ initialImages = [], initialTags = [] }: { initialImages?: GalleryImage[], initialTags?: string[] }) {
    const galleryImages = initialImages;
    const allTags = initialTags;
    const [mounted, setMounted] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tapIndex, setTapIndex] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    /* ================= KEYBOARD NAV ================= */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === "Escape") setLightboxIndex(null);
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex]);

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

    const nextImage = () => {
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    };

    const prevImage = () => {
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
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
            {mounted ? (
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                    <Masonry gutter="16px">
                        {filteredImages.map((image, index) => (
                            <motion.div
                                key={image.url} // ✅ FIXED KEY
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => setLightboxIndex(index)}
                            >
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-0">
                    {galleryImages.slice(0, 6).map((img, i) => (
                        <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            )}

            {/* ================= LIGHTBOX ================= */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center select-none"
                    >
                        {/* Background Overlay to close */}
                        <div className="absolute inset-0" onClick={() => setLightboxIndex(null)} />

                        {/* Controls */}
                        <div className="absolute top-6 right-6 flex items-center gap-4 z-[110]">
                            <button 
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: filteredImages[lightboxIndex].label,
                                            url: filteredImages[lightboxIndex].url
                                        });
                                    }
                                }}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setLightboxIndex(null)}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <button 
                            onClick={prevImage}
                            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-[110] hidden md:block"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button 
                            onClick={nextImage}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-[110] hidden md:block"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        {/* Image Container */}
                        <motion.div 
                            key={lightboxIndex}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative max-w-[90vw] max-h-[85vh] z-[105] flex flex-col items-center"
                        >
                            <div className="relative group/lb overflow-hidden rounded-2xl shadow-2xl">
                                <ImageWithFallback
                                    src={filteredImages[lightboxIndex].url}
                                    alt={filteredImages[lightboxIndex].label}
                                    className="max-w-full max-h-[75vh] object-contain"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/lb:opacity-100 transition-opacity duration-500" />
                            </div>

                            {/* Image Info */}
                            <div className="mt-8 text-center">
                                <motion.h3 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-2xl md:text-4xl font-serif text-white mb-2"
                                >
                                    {filteredImages[lightboxIndex].label}
                                </motion.h3>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-[#94A3B8] uppercase tracking-widest font-medium">
                                        {filteredImages[lightboxIndex].category}
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                                    <div className="flex gap-2">
                                        {filteredImages[lightboxIndex].tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-xs text-[#F59E0B]">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Index Indicator */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#94A3B8] text-sm font-medium">
                            {lightboxIndex + 1} / {filteredImages.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================= EMPTY STATE ================= */}
            {filteredImages.length === 0 && (
                <div className="text-center py-40">
                    <Camera className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-xl text-[#94A3B8] font-serif">
                        No captures found in this category
                    </p>
                </div>
            )}
        </div>
    );
}