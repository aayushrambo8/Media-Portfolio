"use client";
import { motion } from "motion/react";
import { useState, useRef, useMemo } from "react";
import { ResponsiveMasonry } from "react-responsive-masonry";
import Masonry from "react-responsive-masonry";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Camera, Filter, X, Check } from "lucide-react";

/* ================= TYPES ================= */
type GalleryImage = {
    url: string;
    label: string;
    category: "Artist" | "Event";
    tags: string;
};

/* ================= DATA ================= */
const galleryImages: GalleryImage[] = [
    {
        url: "https://ik.imagekit.io/aayushrambo8/compressed_DSC_1247.jpg",
        label: "Live at Amiphoria'26",
        category: "Artist",
        tags: "live, artist, amiphoria, 2026",
    },
    {
        url: "https://ik.imagekit.io/aayushrambo8/compressed_DSC_1233.jpg",
        label: "Live at Amiphoria'26",
        category: "Event",
        tags: "live, event, amiphoria, 2026",
    },
    // 👉 keep rest of your data here (unchanged)
];

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
    const allTags = useMemo(() => {
        const tags = new Set<string>();

        galleryImages.forEach((img) => {
            img.tags.split(",").forEach((t: string) => {
                tags.add(t.trim());
            });
        });

        return Array.from(tags).sort();
    }, []);

    /* ================= FILTER ================= */
    const filteredImages = useMemo(() => {
        if (selectedTags.length === 0) return galleryImages;

        return galleryImages.filter((img) => {
            const imgTags = img.tags.split(",").map((t: string) => t.trim());

            return selectedTags.every((tag: string) =>
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
        <div className="pt-24 pb-20 px-4 relative">
            {/* ================= FILTER MODAL ================= */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isFilterOpen ? 1 : 0,
                    pointerEvents: isFilterOpen ? "auto" : "none",
                    y: isFilterOpen ? 0 : 50,
                }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
            >
                <div className="w-full max-w-2xl bg-[#1A1F2E] rounded-2xl p-6">
                    <div className="flex justify-between mb-6">
                        <h2 className="text-xl text-white">Filter Gallery</h2>
                        <button onClick={() => setIsFilterOpen(false)}>
                            <X />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1 rounded ${
                                    selectedTags.includes(tag)
                                        ? "bg-yellow-400 text-black"
                                        : "bg-gray-700 text-white"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full bg-yellow-400 py-2 rounded"
                    >
                        Show {filteredImages.length} Results
                    </button>
                </div>
            </motion.div>

            {/* ================= HEADER ================= */}
            <div className="text-center mb-10">
                <h1 className="text-4xl text-white mb-4">Gallery</h1>
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 mx-auto bg-gray-800 px-4 py-2 rounded"
                >
                    <Filter /> Filter
                </button>
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
                                <div className="absolute bottom-0 w-full bg-black/60 p-3">
                                    <p className="text-white text-sm">{image.label}</p>
                                </div>
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