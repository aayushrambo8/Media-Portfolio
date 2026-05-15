"use client";

import { useState } from "react";
import {
  addImage, addTag, addTags, updateImage, deleteImage,
  updateTag, updateTimeline, updateMilestones, reorderImages,
  logout, updateCredentials
} from "../actions";
import {
  Plus, Upload, Tag, Check, Image as ImageIcon,
  Edit2, Trash2, X, Save, ArrowUp, ArrowDown,
  Clock, Award, Camera, Music, Users, Calendar, Sparkles,
  Settings, LogOut, Lock, User, ChevronDown, GripVertical
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

type GalleryImage = {
  url: string;
  label: string;
  category: string;
  tags: string;
};

type TimelineEvent = {
  title: string;
  description: string;
  type: string;
  icon: string;
  color: string;
  image: string;
};

type Milestone = {
  title: string;
  subtext: string;
};

export default function AdminDashboard({
  initialTags,
  initialImages,
  initialTimeline,
  initialMilestones
}: {
  initialTags: string[],
  initialImages: GalleryImage[],
  initialTimeline: TimelineEvent[],
  initialMilestones: Milestone[]
}) {
  const [activeTab, setActiveTab] = useState<"gallery" | "timeline">("gallery");

  // Gallery State
  const [availableTags, setAvailableTags] = useState(initialTags);
  const [images, setImages] = useState(initialImages);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("Artist");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState("");
  const [editingUrl, setEditingUrl] = useState<string | null>(null);

  // Filter State
  const [filterText, setFilterText] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  const isFiltering = filterText !== "" || filterTag !== "All" || filterCategory !== "All";

  const filteredImages = images.filter(img => {
    if (filterCategory !== "All" && img.category !== filterCategory) return false;
    if (filterTag !== "All" && !img.tags.split(",").map(t => t.trim()).includes(filterTag)) return false;
    if (filterText && !img.label.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  // Timeline State
  const [timeline, setTimeline] = useState(initialTimeline);
  const [milestones, setMilestones] = useState(initialMilestones);

  // New Journey Event State
  const [journeyTitle, setJourneyTitle] = useState("");
  const [journeyDesc, setJourneyDesc] = useState("");
  const [journeyType, setJourneyType] = useState("artist");
  const [journeyIcon, setJourneyIcon] = useState("Music");
  const [journeyColor, setJourneyColor] = useState("#F59E0B");
  const [journeyImage, setJourneyImage] = useState("");
  const [editingJourneyIndex, setEditingJourneyIndex] = useState<number | null>(null);

  // New Milestone State
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneSubtext, setMilestoneSubtext] = useState("");
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<number | null>(null);

  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldUser, setOldUser] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateCredentials(oldUser, oldPass, newUser, newPass);
    if (res.success) {
      setMessage("Credentials updated successfully!");
      setShowPasswordModal(false);
      setOldUser(""); setOldPass(""); setNewUser(""); setNewPass("");
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  /* ================= GALLERY HANDLERS ================= */
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleEditClick = (img: GalleryImage) => {
    setEditingUrl(img.url);
    setUrl(img.url);
    setLabel(img.label);
    setCategory(img.category);
    setSelectedTags(img.tags.split(",").map(t => t.trim()).filter(t => t));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingUrl(null);
    setUrl("");
    setLabel("");
    setCategory("Artist");
    setSelectedTags([]);
    setCustomTags("");
  };

  const handleRenameTag = async (oldName: string) => {
    const newName = prompt("Rename tag:", oldName);
    if (!newName || newName === oldName) return;
    
    setLoading(true);
    const res = await updateTag(oldName, newName);
    if (res.success) {
      setAvailableTags(prev => prev.map(t => t === oldName ? newName : t).sort());
      setSelectedTags(prev => prev.map(t => t === oldName ? newName : t));
      setMessage("Tag renamed successfully!");
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleAddOrUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !label) {
      setMessage("Please fill out URL and Label");
      return;
    }
    setLoading(true);
    setMessage("");

    let finalTags = [...selectedTags];
    if (customTags.trim()) {
      const newTagsList = customTags.split(",").map(t => t.trim()).filter(Boolean);
      const tagsToAdd = newTagsList.filter(t => !availableTags.includes(t));
      
      if (tagsToAdd.length > 0) {
        await addTags(tagsToAdd);
        setAvailableTags(prev => [...prev, ...tagsToAdd].sort());
      }
      
      for (const t of newTagsList) {
        if (!finalTags.includes(t)) finalTags.push(t);
      }
    }

    const newImageData = { url, label, category, tags: finalTags.join(", ") };
    const res = editingUrl ? await updateImage(editingUrl, newImageData) : await addImage(newImageData);

    if (res.success) {
      setMessage(editingUrl ? "Image updated successfully!" : "Image added successfully!");
      if ("tags" in res && res.tags) setAvailableTags(res.tags as string[]);
      // Update local images list (simpler than fetching again)
      if (editingUrl) {
        setImages(prev => prev.map(img => img.url === editingUrl ? newImageData : img));
      } else {
        setImages(prev => [newImageData, ...prev]);
      }
      cancelEdit();
    } else {
      setMessage("Error saving image: " + res.error);
    }
    setLoading(false);
  };

  const handleDeleteImage = async (imgUrl: string) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    const res = await deleteImage(imgUrl);
    if (res.success) {
      setMessage("Image deleted!");
      setImages(prev => prev.filter(img => img.url !== imgUrl));
      if ("tags" in res && res.tags) setAvailableTags(res.tags as string[]);
    }
    setLoading(false);
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newImages.length) return;

    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    handleReorder(newImages);
  };

  const handleReorder = async (newOrder: GalleryImage[]) => {
    setImages(newOrder);
    setLoading(true);
    const res = await reorderImages(newOrder);
    if (!res.success) setMessage("Failed to save new order");
    setLoading(false);
  };

  /* ================= TIMELINE HANDLERS ================= */
  const handleSaveJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newEvent: TimelineEvent = {
      title: journeyTitle,
      description: journeyDesc,
      type: journeyType,
      icon: journeyIcon,
      color: journeyColor,
      image: journeyImage
    };

    let newTimeline = [...timeline];
    if (editingJourneyIndex !== null) {
      newTimeline[editingJourneyIndex] = newEvent;
    } else {
      newTimeline.unshift(newEvent);
    }

    const res = await updateTimeline(newTimeline);
    if (res.success) {
      setTimeline(newTimeline);
      setJourneyTitle(""); setJourneyDesc(""); setJourneyImage("");
      setEditingJourneyIndex(null);
      setMessage("Journey updated!");
    }
    setLoading(false);
  };

  const deleteJourney = async (index: number) => {
    if (!confirm("Delete this event?")) return;
    const newTimeline = timeline.filter((_, i) => i !== index);
    const res = await updateTimeline(newTimeline);
    if (res.success) setTimeline(newTimeline);
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newMilestone: Milestone = { title: milestoneTitle, subtext: milestoneSubtext };

    let newMilestones = [...milestones];
    if (editingMilestoneIndex !== null) {
      newMilestones[editingMilestoneIndex] = newMilestone;
    } else {
      newMilestones.push(newMilestone);
    }

    const res = await updateMilestones(newMilestones);
    if (res.success) {
      setMilestones(newMilestones);
      setMilestoneTitle(""); setMilestoneSubtext("");
      setEditingMilestoneIndex(null);
      setMessage("Milestones updated!");
    }
    setLoading(false);
  };

  const deleteMilestone = async (index: number) => {
    if (!confirm("Delete milestone?")) return;
    const newMilestones = milestones.filter((_, i) => i !== index);
    const res = await updateMilestones(newMilestones);
    if (res.success) setMilestones(newMilestones);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Admin Dashboard</h1>
          <p className="text-[#94A3B8]">Manage your portfolio content and journey milestones.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* TABS */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "gallery" ? "bg-[#F59E0B] text-[#0A0E1A]" : "text-[#94A3B8] hover:text-white"}`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "timeline" ? "bg-[#F59E0B] text-[#0A0E1A]" : "text-[#94A3B8] hover:text-white"}`}
            >
              Timeline
            </button>
          </div>

          {/* SETTINGS DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-[#94A3B8] hover:text-white transition-all flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              <ChevronDown className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSettings && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-[#1A1F2E] border border-white/10 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden"
                  >
                    <button
                      onClick={() => { setShowPasswordModal(true); setShowSettings(false); }}
                      className="w-full px-4 py-3 text-left text-sm text-[#94A3B8] hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <Lock className="w-4 h-4" /> Change Password
                    </button>
                    <div className="h-px bg-white/5 mx-2 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 text-white text-center flex items-center justify-center gap-3">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          {message}
        </div>
      )}

      {activeTab === "gallery" ? (
        <div className="space-y-12">
          <div className="w-full">
            {/* FORM */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-white">{editingUrl ? 'Edit Image' : 'Add New Image'}</h2>
                {editingUrl && <button onClick={cancelEdit} className="text-sm text-[#F59E0B]">Cancel</button>}
              </div>
              <form onSubmit={handleAddOrUpdateImage} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* INPUTS */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider ml-1">Image Information</label>
                        <input type="url" placeholder="Image URL" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B]" />
                        <input type="text" placeholder="Caption" value={label} onChange={e => setLabel(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B]" />
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B]">
                          <option value="Artist">Artist</option>
                          <option value="Event">Event</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider ml-1">Tags</label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 p-4 bg-black/20 border border-white/10 rounded-xl max-h-48 overflow-y-auto">
                            {availableTags.map(tag => (
                              <button 
                                key={tag} 
                                type="button" 
                                onClick={() => toggleTag(tag)} 
                                onContextMenu={(e) => { e.preventDefault(); handleRenameTag(tag); }}
                                title="Right click to rename"
                                className={`px-3 py-1.5 rounded-full text-xs transition-all border ${selectedTags.includes(tag) ? "bg-[#F59E0B] border-[#F59E0B] text-[#0A0E1A]" : "bg-white/5 border-white/5 text-[#94A3B8] hover:border-white/20"}`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                          <input type="text" placeholder="Add custom tags (comma separated)" value={customTags} onChange={e => setCustomTags(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                        </div>
                      </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-[#F59E0B] text-[#0A0E1A] font-bold py-4 rounded-xl shadow-lg shadow-[#F59E0B]/10 hover:opacity-90 transition-opacity">
                      {loading ? "Saving..." : editingUrl ? "Update Image" : "Upload Image"}
                    </button>
                  </div>

                  {/* PREVIEW - LARGER */}
                  <div className="lg:col-span-3 space-y-2">
                    <label className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider ml-1">Preview</label>
                    <div className="aspect-video bg-black/20 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center relative group">
                      {url ? (
                        <ImageWithFallback src={url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-[#94A3B8]">
                          <ImageIcon className="w-12 h-12 opacity-20" />
                          <p>Enter a URL to see preview</p>
                        </div>
                      )}
                      {url && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="text-white text-xs font-medium px-3 py-1.5 bg-black/60 rounded-full backdrop-blur-md border border-white/10">Full Preview Mode</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

          {/* LIST */}
          <div className="bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-serif text-white">Manage Gallery Order</h2>
                <p className="text-sm text-[#94A3B8] italic flex items-center gap-2">
                  <GripVertical className="w-4 h-4" /> Drag to reorder {isFiltering && <span className="text-red-400 font-medium">(Disabled while filtering)</span>}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={filterText} 
                  onChange={e => setFilterText(e.target.value)} 
                  className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-[#F59E0B]" 
                />
                <select 
                  value={filterCategory} 
                  onChange={e => setFilterCategory(e.target.value)} 
                  className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-[#F59E0B]"
                >
                  <option value="All">All Categories</option>
                  <option value="Artist">Artist</option>
                  <option value="Event">Event</option>
                </select>
                <select 
                  value={filterTag} 
                  onChange={e => setFilterTag(e.target.value)} 
                  className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-[#F59E0B] max-w-[200px]"
                >
                  <option value="All">All Tags</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <Reorder.Group 
              axis="y" 
              values={images} 
              onReorder={handleReorder}
              className="space-y-4"
            >
              {filteredImages.map((img, _idx) => {
                const originalIdx = images.findIndex(i => i.url === img.url);
                return (
                <Reorder.Item 
                  key={img.url} 
                  value={img}
                  dragListener={!isFiltering}
                  className={`bg-black/20 rounded-2xl overflow-hidden border border-white/10 group flex items-center p-4 gap-6 transition-colors hover:bg-white/5 ${!isFiltering ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                  <div className="flex-shrink-0 flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-white/20 group-hover:text-white/40" />
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/10">
                      <ImageWithFallback src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate text-lg mb-1">{img.label}</h4>
                    <p className="text-sm text-[#94A3B8]">{img.category}</p>
                    <div className="flex gap-2 mt-2">
                      {img.tags.split(",").slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-[#F59E0B] px-2 py-0.5 bg-[#F59E0B]/10 rounded-full border border-[#F59E0B]/20">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1 mr-4 border-r border-white/10 pr-4">
                      <button onClick={(e) => { e.stopPropagation(); moveImage(originalIdx, 'up'); }} disabled={isFiltering || originalIdx === 0} className="p-1.5 text-[#94A3B8] hover:text-white disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveImage(originalIdx, 'down'); }} disabled={isFiltering || originalIdx === images.length - 1} className="p-1.5 text-[#94A3B8] hover:text-white disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(img); }} className="p-3 text-[#94A3B8] hover:text-white bg-white/5 rounded-xl"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.url); }} className="p-3 text-red-400 hover:text-red-300 bg-red-500/10 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </Reorder.Item>
              )})}
            </Reorder.Group>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* JOURNEY MANAGEMENT */}
          <div className="space-y-8">
            <div className="bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl">
              <h2 className="text-2xl font-serif text-white mb-6">{editingJourneyIndex !== null ? 'Edit Journey Event' : 'Add Journey Event'}</h2>
              <form onSubmit={handleSaveJourney} className="space-y-4">
                <input type="text" placeholder="Title" value={journeyTitle} onChange={e => setJourneyTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
                <textarea placeholder="Description" value={journeyDesc} onChange={e => setJourneyDesc(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white h-24" />
                <input type="url" placeholder="Image URL" value={journeyImage} onChange={e => setJourneyImage(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={journeyType} onChange={e => setJourneyType(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white">
                    <option value="artist">Artist</option>
                    <option value="event">Event</option>
                  </select>
                  <select value={journeyIcon} onChange={e => setJourneyIcon(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white">
                    <option value="Music">Music</option>
                    <option value="Camera">Camera</option>
                    <option value="Award">Award</option>
                    <option value="Users">Users</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#F59E0B] text-[#0A0E1A] font-bold py-4 rounded-xl">{editingJourneyIndex !== null ? 'Update Event' : 'Add to Journey'}</button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl text-white font-serif ml-2">Home Journey Timeline</h3>
              {timeline.map((event, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                      <ImageWithFallback src={event.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{event.title}</h4>
                      <p className="text-xs text-[#94A3B8]">{event.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingJourneyIndex(idx); setJourneyTitle(event.title); setJourneyDesc(event.description); setJourneyImage(event.image); setJourneyType(event.type); setJourneyIcon(event.icon); }} className="p-2 text-[#94A3B8] hover:text-[#F59E0B]"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteJourney(idx)} className="p-2 text-[#94A3B8] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MILESTONE MANAGEMENT */}
          <div className="space-y-8">
            <div className="bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl">
              <h2 className="text-2xl font-serif text-white mb-6">{editingMilestoneIndex !== null ? 'Edit Milestone' : 'Add Milestone'}</h2>
              <form onSubmit={handleSaveMilestone} className="space-y-4">
                <input type="text" placeholder="Milestone Title" value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
                <input type="text" placeholder="Subtext" value={milestoneSubtext} onChange={e => setMilestoneSubtext(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
                <button type="submit" className="w-full bg-[#8B5CF6] text-white font-bold py-4 rounded-xl">{editingMilestoneIndex !== null ? 'Update Milestone' : 'Add Milestone'}</button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl text-white font-serif ml-2">About Page Milestones</h3>
              {milestones.map((ms, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group">
                  <div>
                    <h4 className="text-white font-medium">{ms.title}</h4>
                    <p className="text-xs text-[#94A3B8]">{ms.subtext}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingMilestoneIndex(idx); setMilestoneTitle(ms.title); setMilestoneSubtext(ms.subtext); }} className="p-2 text-[#94A3B8] hover:text-[#8B5CF6]"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteMilestone(idx)} className="p-2 text-[#94A3B8] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1A1F2E] border border-white/10 rounded-[28px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F59E0B]/10 rounded-lg">
                    <Lock className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <h2 className="text-2xl font-serif text-white">Change Password</h2>
                </div>
                <button onClick={() => setShowPasswordModal(false)} className="text-[#94A3B8] hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider ml-1">Current Credentials</label>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Current Username" 
                        value={oldUser}
                        onChange={e => setOldUser(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B] transition-colors"
                      />
                      <input 
                        type="password" 
                        placeholder="Current Password" 
                        value={oldPass}
                        onChange={e => setOldPass(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider ml-1">New Credentials</label>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="New Username" 
                        value={newUser}
                        onChange={e => setNewUser(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B] transition-colors"
                      />
                      <input 
                        type="password" 
                        placeholder="New Password" 
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#F59E0B] text-[#0A0E1A] font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Credentials"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
