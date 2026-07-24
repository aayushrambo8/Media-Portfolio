"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useMemo, useEffect } from "react";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Camera, Filter, X, Check, ChevronLeft, ChevronRight, Maximize2, Share2, Music, Calendar, Folder, ArrowLeft, Layers } from "lucide-react";
/* ================= TYPES ================= */
type GalleryImage = {
    url: string;
    label: string;
    category: string;
    tags: string;
    album: "Concerts" | "Events" | string;
};

type EventSubAlbum = {
    name: string;
    images: GalleryImage[];
    coverUrl: string;
};

/* ================= COMPONENT ================= */
export function Gallery({ initialImages = [], initialTags = [] }: { initialImages?: GalleryImage[], initialTags?: string[] }) {
    // Process initial images to ensure strict album property exists
    const galleryImages: GalleryImage[] = useMemo(() => {
        return initialImages.map(img => {
            let albumVal: "Concerts" | "Events" = "Concerts";
            if (img.album) {
                albumVal = img.album.toLowerCase().includes("event") ? "Events" : "Concerts";
            } else {
                const cat = (img.category || "").toLowerCase();
                const tags = (img.tags || "").toLowerCase();
                if (cat === "events" || cat === "event" || tags.includes("event")) {
                    albumVal = "Events";
                }
            }
            return { ...img, album: albumVal };
        });
    }, [initialImages]);

    const allTags = initialTags;
    const [mounted, setMounted] = useState(false);
    const [activeAlbum, setActiveAlbum] = useState<"Concerts" | "Events">("Concerts");
    const [selectedSubAlbum, setSelectedSubAlbum] = useState<string | null>(null);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tapIndex, setTapIndex] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [numCols, setNumCols] = useState(3);
    const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setMounted(true);
        const updateCols = () => {
            if (window.innerWidth >= 1024) setNumCols(3);
            else if (window.innerWidth >= 768) setNumCols(2);
            else setNumCols(1);
        };
        updateCols();
        window.addEventListener('resize', updateCols);
        return () => window.removeEventListener('resize', updateCols);
    }, []);

    /* ================= ALBUMS & SUB-ALBUMS ================= */
    const concertImages = useMemo(() => {
        return galleryImages.filter(img => img.album === "Concerts");
    }, [galleryImages]);

    const eventImages = useMemo(() => {
        return galleryImages.filter(img => img.album === "Events");
    }, [galleryImages]);

    // Group Events into Event Name Sub-Albums derived from event tags (e.g. Kaizen'25, Anwesha'26, etc.)
    const eventSubAlbums = useMemo(() => {
        const subMap: Record<string, GalleryImage[]> = {};

        eventImages.forEach(img => {
            const tagList = img.tags.split(",").map(t => t.trim()).filter(Boolean);
            // Find event name tag (exclude generic 'Event' tag if present)
            const eventNameTag = tagList.find(t => t.toLowerCase() !== "event") || img.label || "General Events";
            if (!subMap[eventNameTag]) {
                subMap[eventNameTag] = [];
            }
            subMap[eventNameTag].push(img);
        });

        return Object.entries(subMap).map(([name, images]): EventSubAlbum => ({
            name,
            images,
            coverUrl: images[0]?.url || ""
        }));
    }, [eventImages]);

    const currentAlbumImages = useMemo(() => {
        if (activeAlbum === "Concerts") return concertImages;
        if (selectedSubAlbum) {
            const sub = eventSubAlbums.find(s => s.name === selectedSubAlbum);
            return sub ? sub.images : eventImages;
        }
        return eventImages;
    }, [activeAlbum, selectedSubAlbum, concertImages, eventImages, eventSubAlbums]);

    /* ================= FILTER (UNIFIED BASE FILTER) ================= */
    const isTagFilterActive = selectedTags.length > 0;

    const filteredImages = useMemo(() => {
        // If filter tags selected, search across ALL images (common base across Concerts and Events)
        const sourcePool = isTagFilterActive ? galleryImages : currentAlbumImages;

        if (!isTagFilterActive) return currentAlbumImages;

        return sourcePool.filter((img) => {
            const imgTags = img.tags.split(",").map((t: string) => t.trim());
            return selectedTags.some((tag: string) => imgTags.includes(tag));
        });
    }, [isTagFilterActive, galleryImages, currentAlbumImages, selectedTags]);

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

    /* ================= KEYBOARD NAV ================= */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (lightboxIndex !== null) {
                    setLightboxIndex(null);
                } else if (isFilterOpen) {
                    setIsFilterOpen(false);
                }
            }
            if (lightboxIndex !== null) {
                if (e.key === "ArrowRight") nextImage();
                if (e.key === "ArrowLeft") prevImage();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex, isFilterOpen]);

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

    const handleImageLoad = (url: string, e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth && naturalHeight) {
            setAspectRatios(prev => {
                if (prev[url]) return prev;
                return { ...prev, [url]: naturalWidth / naturalHeight };
            });
        }
    };

    /* ================= UI ================= */
    return (
        <div className="pt-40 pb-20 px-4 relative">
            {/* ================= FILTER MODAL ================= */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.3)_0%,_rgba(0,0,0,0.95)_100%)] backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-[#1A1F2E]/95 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl flex flex-col max-h-[85vh]"
                        >
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 flex-shrink-0">
                                <h2 className="text-2xl font-serif text-white">
                                    Filter Tags {isTagFilterActive ? "(Global)" : `(${activeAlbum})`}
                                </h2>
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
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all duration-200 ${selectedTags.includes(tag)
                                            ? "bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] border-transparent shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                                            : "border-white/20 group-hover:border-white/40 bg-black/20"
                                            }`}>
                                            {selectedTags.includes(tag) && <Check className="w-4 h-4 text-[#0A0E1A]" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-lg transition-colors ${selectedTags.includes(tag) ? "text-white font-medium" : "text-[#94A3B8] group-hover:text-white"
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
                )}
            </AnimatePresence>

            {/* ================= HEADER & BREADCRUMBS ================= */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
                <div>
                    {/* BREADCRUMB DIRECTORY TREE NAV */}
                    <div className="flex items-center gap-2 text-sm text-[#94A3B8] mb-2 font-mono">
                        <span 
                            onClick={() => { setSelectedSubAlbum(null); setSelectedTags([]); }}
                            className="hover:text-white cursor-pointer transition-colors"
                        >
                            Gallery
                        </span>
                        <span>/</span>
                        <span 
                            onClick={() => { setSelectedSubAlbum(null); setSelectedTags([]); }}
                            className={`hover:text-white cursor-pointer transition-colors ${!selectedSubAlbum ? "text-[#F59E0B] font-semibold" : ""}`}
                        >
                            {activeAlbum}
                        </span>
                        {activeAlbum === "Events" && selectedSubAlbum && (
                            <>
                                <span>/</span>
                                <span className="text-[#3B82F6] font-semibold">{selectedSubAlbum}</span>
                            </>
                        )}
                    </div>

                    <h1 className="text-4xl text-white tracking-widest font-serif flex items-center gap-3">
                        {activeAlbum === "Events" && selectedSubAlbum ? selectedSubAlbum.toUpperCase() : activeAlbum.toUpperCase()}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {activeAlbum === "Events" && selectedSubAlbum && (
                        <button
                            onClick={() => setSelectedSubAlbum(null)}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-full border border-white/10 text-white text-sm transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Events
                        </button>
                    )}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-md transition-all duration-300 border ${
                            isTagFilterActive 
                                ? "bg-[#F59E0B] text-[#0A0E1A] border-[#F59E0B] font-semibold shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                                : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                        }`}
                    >
                        <Filter className="w-4 h-4" /> 
                        <span>Filter Tags {isTagFilterActive && `(${selectedTags.length})`}</span>
                    </button>
                </div>
            </div>

            {/* ================= UNIFIED TAG FILTER INDICATOR BANNER ================= */}
            {isTagFilterActive && (
                <div className="max-w-4xl mx-auto mb-8 p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[#FBBF24]">
                        <Layers className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            Showing results across all albums for selected tags: {selectedTags.join(", ")}
                        </span>
                    </div>
                    <button 
                        onClick={() => setSelectedTags([])}
                        className="text-xs text-white/80 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Clear Filter
                    </button>
                </div>
            )}

            {/* ================= TOP-LEVEL ALBUMS SELECTOR ================= */}
            {!isTagFilterActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
                    {/* CONCERTS ALBUM CARD */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setActiveAlbum("Concerts");
                            setSelectedSubAlbum(null);
                            setSelectedTags([]);
                        }}
                        className={`relative rounded-3xl p-6 cursor-pointer overflow-hidden border transition-all duration-300 ${
                            activeAlbum === "Concerts"
                                ? "bg-gradient-to-br from-[#F59E0B]/20 via-[#1A1F2E] to-[#1A1F2E] border-[#F59E0B] shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                                : "bg-[#1A1F2E]/60 hover:bg-[#1A1F2E]/90 border-white/10 hover:border-white/20"
                        }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${activeAlbum === "Concerts" ? "bg-[#F59E0B] text-[#0A0E1A]" : "bg-white/10 text-white"}`}>
                                    <Music className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif text-white">Concerts</h3>
                                    <p className="text-xs text-[#94A3B8]">{concertImages.length} Photos</p>
                                </div>
                            </div>
                            {activeAlbum === "Concerts" && (
                                <span className="bg-[#F59E0B]/20 border border-[#F59E0B]/50 text-[#FBBF24] text-xs font-semibold px-3 py-1 rounded-full">
                                    Active Folder
                                </span>
                            )}
                        </div>
                        {/* Preview Images Stack */}
                        <div className="flex gap-2 h-20 rounded-xl overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
                            {concertImages.slice(0, 3).map((img, idx) => (
                                <div key={idx} className="flex-1 relative overflow-hidden rounded-lg bg-black/40">
                                    <ImageWithFallback src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* EVENTS ALBUM CARD */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setActiveAlbum("Events");
                            setSelectedSubAlbum(null);
                            setSelectedTags([]);
                        }}
                        className={`relative rounded-3xl p-6 cursor-pointer overflow-hidden border transition-all duration-300 ${
                            activeAlbum === "Events"
                                ? "bg-gradient-to-br from-[#3B82F6]/20 via-[#1A1F2E] to-[#1A1F2E] border-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                                : "bg-[#1A1F2E]/60 hover:bg-[#1A1F2E]/90 border-white/10 hover:border-white/20"
                        }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${activeAlbum === "Events" ? "bg-[#3B82F6] text-white" : "bg-white/10 text-white"}`}>
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif text-white">Events</h3>
                                    <p className="text-xs text-[#94A3B8]">{eventImages.length} Photos ({eventSubAlbums.length} Albums)</p>
                                </div>
                            </div>
                            {activeAlbum === "Events" && (
                                <span className="bg-[#3B82F6]/20 border border-[#3B82F6]/50 text-[#60A5FA] text-xs font-semibold px-3 py-1 rounded-full">
                                    Active Folder
                                </span>
                            )}
                        </div>
                        {/* Preview Images Stack */}
                        <div className="flex gap-2 h-20 rounded-xl overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
                            {eventImages.slice(0, 3).map((img, idx) => (
                                <div key={idx} className="flex-1 relative overflow-hidden rounded-lg bg-black/40">
                                    <ImageWithFallback src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* ================= EVENTS > SUB-ALBUMS GRID (EVENTS ROOT VIEW) ================= */}
            {activeAlbum === "Events" && !selectedSubAlbum && !isTagFilterActive && (
                <div className="mb-12">
                    <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                        <Folder className="w-5 h-5 text-[#3B82F6]" /> Events Directory
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventSubAlbums.map((subAlbum) => (
                            <motion.div
                                key={subAlbum.name}
                                whileHover={{ scale: 1.03, y: -4 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedSubAlbum(subAlbum.name)}
                                className="bg-[#1A1F2E]/80 border border-white/10 hover:border-[#3B82F6]/50 rounded-2xl overflow-hidden cursor-pointer p-4 group transition-all duration-300 shadow-lg"
                            >
                                <div className="aspect-video relative rounded-xl overflow-hidden mb-4 bg-black/40">
                                    <ImageWithFallback src={subAlbum.coverUrl} alt={subAlbum.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs px-2.5 py-1 rounded-md font-mono">
                                        {subAlbum.images.length} Photos
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white group-hover:text-[#60A5FA] transition-colors">
                                        {subAlbum.name}
                                    </h3>
                                    <ChevronRight className="w-5 h-5 text-[#94A3B8] group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ================= GRID ================= */}
            {mounted ? (() => {
                const columns = Array.from({ length: numCols }, () => ({ items: [] as GalleryImage[], height: 0 }));
                filteredImages.forEach((img) => {
                    const ar = aspectRatios[img.url] || 1;
                    const heightContrib = 1 / ar;

                    let minCol = 0;
                    let minH = columns[0].height;
                    for (let i = 1; i < numCols; i++) {
                        if (columns[i].height < minH) {
                            minCol = i;
                            minH = columns[i].height;
                        }
                    }

                    columns[minCol].items.push(img);
                    columns[minCol].height += heightContrib;
                });

                return (
                    <div className="flex w-full gap-4 items-start">
                        {columns.map((col, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-4 flex-1">
                                {col.items.map((image) => {
                                    const originalIndex = filteredImages.indexOf(image);
                                    return (
                                        <motion.div
                                            key={image.url}
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-xl w-full"
                                            onMouseEnter={() => setHoveredIndex(originalIndex)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            onClick={() => setLightboxIndex(originalIndex)}
                                        >
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                            <ImageWithFallback
                                                src={image.url}
                                                alt={image.label}
                                                className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                                                onLoad={(e) => handleImageLoad(image.url, e)}
                                            />

                                            {isVisible(originalIndex) && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="absolute bottom-0 w-full p-6 pt-20 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end z-20"
                                                >
                                                    <p className="text-white font-serif text-xl md:text-2xl mb-2 drop-shadow-lg">{image.label}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {image.tags.split(",").map(t => t.trim()).filter(Boolean).map((tag, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-[10px] md:text-xs font-semibold px-3 py-1 bg-[#F59E0B]/30 border border-[#F59E0B]/40 text-[#FBBF24] rounded-full backdrop-blur-md"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                );
            })() : (
                <div className="flex w-full gap-4 opacity-0">
                    {Array.from({ length: 3 }).map((_, colIndex) => (
                        <div key={colIndex} className="flex flex-col gap-4 flex-1">
                            {galleryImages.slice(0, 2).map((img, i) => (
                                <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse w-full" />
                            ))}
                        </div>
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