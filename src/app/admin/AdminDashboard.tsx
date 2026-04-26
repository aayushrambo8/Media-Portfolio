"use client";

import { useState } from "react";
import { 
  addImage, addTag, updateImage, deleteImage, 
  updateTimeline, updateMilestones, reorderImages 
} from "../actions";
import { 
  Plus, Upload, Tag, Check, Image as ImageIcon, 
  Edit2, Trash2, X, Save, ArrowUp, ArrowDown, 
  Clock, Award, Camera, Music, Users, Calendar, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

  const handleAddOrUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!url || !label) {
      setMessage("Please fill out URL and Label");
      return;
    }
    setLoading(true);
    setMessage("");

    let finalTags = [...selectedTags];
    if (customTags.trim()) {
      const newTagsList = customTags.split(",").map(t => t.trim()).filter(Boolean);
      for (const t of newTagsList) {
        if (!availableTags.includes(t)) {
          await addTag(t);
          setAvailableTags(prev => [...prev, t].sort());
        }
        if (!finalTags.includes(t)) finalTags.push(t);
      }
    }

    const newImageData = { url, label, category, tags: finalTags.join(", ") };
    const res = editingUrl ? await updateImage(editingUrl, newImageData) : await addImage(newImageData);

    if (res.success) {
      setMessage(editingUrl ? "Image updated successfully!" : "Image added successfully!");
      if (res.tags) setAvailableTags(res.tags);
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
    if(!confirm("Are you sure?")) return;
    setLoading(true);
    const res = await deleteImage(imgUrl);
    if (res.success) {
      setMessage("Image deleted!");
      setImages(prev => prev.filter(img => img.url !== imgUrl));
      if (res.tags) setAvailableTags(res.tags);
    }
    setLoading(false);
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newImages.length) return;
    
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
    setLoading(true);
    const res = await reorderImages(newImages);
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
    if(!confirm("Delete this event?")) return;
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
    if(!confirm("Delete milestone?")) return;
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
      </div>

      {message && (
        <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 text-white text-center flex items-center justify-center gap-3">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          {message}
        </div>
      )}

      {activeTab === "gallery" ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FORM */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-white">{editingUrl ? 'Edit Image' : 'Add New Image'}</h2>
                {editingUrl && <button onClick={cancelEdit} className="text-sm text-[#F59E0B]">Cancel</button>}
              </div>
              <form onSubmit={handleAddOrUpdateImage} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input type="url" placeholder="Image URL" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B]" />
                    <input type="text" placeholder="Caption" value={label} onChange={e => setLabel(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B]" />
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F59E0B]">
                      <option value="Artist">Artist</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div className="aspect-[4/3] bg-black/20 rounded-xl overflow-hidden border border-white/10">
                    {url ? <ImageWithFallback src={url} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">Preview</div>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#94A3B8]">Select Tags</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-black/20 border border-white/10 rounded-xl max-h-32 overflow-y-auto">
                    {availableTags.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs transition-all ${selectedTags.includes(tag) ? "bg-[#F59E0B] text-[#0A0E1A]" : "bg-white/5 text-[#94A3B8]"}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <input type="text" placeholder="Add custom tags (comma separated)" value={customTags} onChange={e => setCustomTags(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
                <button type="submit" disabled={loading} className="w-full bg-[#F59E0B] text-[#0A0E1A] font-bold py-4 rounded-xl">
                  {loading ? "Saving..." : editingUrl ? "Update Image" : "Upload Image"}
                </button>
              </form>
            </motion.div>

            {/* TAGS */}
            <div className="space-y-6">
               <div className="bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 shadow-2xl">
                <h3 className="text-xl font-serif text-white mb-4">Create Tag</h3>
                <form onSubmit={async (e) => { e.preventDefault(); if(!newTag) return; setLoading(true); await addTag(newTag); setNewTag(""); setLoading(false); }} className="space-y-4">
                  <input type="text" placeholder="Tag Name" value={newTag} onChange={e => setNewTag(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
                  <button type="submit" className="w-full bg-white/10 text-white py-3 rounded-xl hover:bg-white/20">Add Tag</button>
                </form>
               </div>
            </div>
          </div>

          {/* LIST */}
          <div className="bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl">
            <h2 className="text-2xl font-serif text-white mb-8">Manage Gallery Order</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img, idx) => (
                <div key={img.url} className="bg-black/20 rounded-2xl overflow-hidden border border-white/10 group relative">
                  <div className="aspect-[4/3] relative">
                    <ImageWithFallback src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <button onClick={() => moveImage(idx, 'up')} disabled={idx === 0} className="p-2 bg-black/60 rounded-full text-white hover:bg-[#F59E0B] disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => moveImage(idx, 'down')} disabled={idx === images.length - 1} className="p-2 bg-black/60 rounded-full text-white hover:bg-[#F59E0B] disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium truncate w-40">{img.label}</h4>
                      <p className="text-xs text-[#94A3B8]">{img.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(img)} className="p-2 text-[#94A3B8] hover:text-white"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteImage(img.url)} className="p-2 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                      <img src={event.image} alt="" className="w-full h-full object-cover" />
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
    </div>
  );
}
