"use client";

import { useState } from "react";
import { addImage, addTag } from "../actions";
import { Plus, Upload, Tag, Check, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

export default function AdminDashboard({ initialTags }: { initialTags: string[] }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("Artist");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [newTag, setNewTag] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!url || !label) {
      setMessage("Please fill out URL and Label");
      return;
    }
    setLoading(true);
    setMessage("");

    const res = await addImage({
      url,
      label,
      category,
      tags: selectedTags.join(", ")
    });

    if (res.success) {
      setMessage("Image added successfully!");
      setUrl("");
      setLabel("");
      setSelectedTags([]);
    } else {
      setMessage("Error adding image: " + res.error);
    }
    setLoading(false);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newTag) return;
    setLoading(true);
    setMessage("");
    const res = await addTag(newTag);
    if (res.success) {
      setMessage("Tag added successfully!");
      setNewTag("");
    } else {
      setMessage("Error adding tag: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-serif text-white mb-4">Admin Dashboard</h1>
        <p className="text-[#94A3B8]">Manage your portfolio gallery and tags securely.</p>
      </div>

      {message && (
        <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 text-white text-center">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ADD IMAGE FORM */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-lg">
              <ImageIcon className="w-5 h-5 text-[#0A0E1A]" />
            </div>
            <h2 className="text-2xl font-serif text-white">Add New Image</h2>
          </div>

          <form onSubmit={handleAddImage} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#94A3B8]">Image URL</label>
              <input 
                type="url" 
                placeholder="https://ik.imagekit.io/..." 
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#94A3B8]">Caption / Label</label>
              <input 
                type="text" 
                placeholder="Live at..." 
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#94A3B8]">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F59E0B] transition-colors appearance-none"
              >
                <option value="Artist" className="bg-[#1A1F2E]">Artist</option>
                <option value="Event" className="bg-[#1A1F2E]">Event</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#94A3B8]">Select Tags</label>
              <div className="flex flex-wrap gap-2 p-4 bg-black/20 border border-white/10 rounded-xl max-h-48 overflow-y-auto custom-scrollbar">
                {initialTags.map(tag => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      selectedTags.includes(tag) ? "bg-[#F59E0B] border-transparent" : "border-white/20 group-hover:border-white/40"
                    }`}>
                      {selectedTags.includes(tag) && <Check className="w-3.5 h-3.5 text-[#0A0E1A]" strokeWidth={3} />}
                    </div>
                    <span className={`text-sm ${selectedTags.includes(tag) ? "text-white" : "text-[#94A3B8]"}`}>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#0A0E1A] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {loading ? "Adding..." : "Upload Image to Gallery"}
            </button>
          </form>
        </motion.div>

        {/* ADD TAG FORM */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 shadow-2xl h-fit"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-lg">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-serif text-white">New Tag</h2>
          </div>

          <form onSubmit={handleAddTag} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#94A3B8]">Tag Name</label>
              <input 
                type="text" 
                placeholder="e.g. New Event" 
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {loading ? "Adding..." : "Create Tag"}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}
