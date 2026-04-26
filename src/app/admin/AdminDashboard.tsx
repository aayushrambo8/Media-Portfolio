"use client";

import { useState } from "react";
import { addImage, addTag, updateImage, deleteImage } from "../actions";
import { Plus, Upload, Tag, Check, Image as ImageIcon, Edit2, Trash2, X, Save } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

type GalleryImage = {
    url: string;
    label: string;
    category: string;
    tags: string;
};

export default function AdminDashboard({ initialTags, initialImages }: { initialTags: string[], initialImages: GalleryImage[] }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("Artist");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [newTag, setNewTag] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [editingUrl, setEditingUrl] = useState<string | null>(null);

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
  };

  const handleAddOrUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!url || !label) {
      setMessage("Please fill out URL and Label");
      return;
    }
    setLoading(true);
    setMessage("");

    const newImageData = {
      url,
      label,
      category,
      tags: selectedTags.join(", ")
    };

    let res;
    if (editingUrl) {
      res = await updateImage(editingUrl, newImageData);
    } else {
      res = await addImage(newImageData);
    }

    if (res.success) {
      setMessage(editingUrl ? "Image updated successfully!" : "Image added successfully!");
      cancelEdit();
    } else {
      setMessage("Error saving image: " + res.error);
    }
    setLoading(false);
  };

  const handleDeleteImage = async (imgUrl: string) => {
    if(!confirm("Are you sure you want to delete this image?")) return;
    setLoading(true);
    setMessage("");
    const res = await deleteImage(imgUrl);
    if (res.success) {
      setMessage("Image deleted successfully!");
      if (editingUrl === imgUrl) cancelEdit();
    } else {
      setMessage("Error deleting image: " + res.error);
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
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
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
        
        {/* ADD / EDIT IMAGE FORM */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${editingUrl ? 'bg-gradient-to-br from-[#10B981] to-[#34D399]' : 'bg-gradient-to-br from-[#F59E0B] to-[#FBBF24]'}`}>
                {editingUrl ? <Edit2 className="w-5 h-5 text-[#0A0E1A]" /> : <ImageIcon className="w-5 h-5 text-[#0A0E1A]" />}
              </div>
              <h2 className="text-2xl font-serif text-white">{editingUrl ? 'Edit Image' : 'Add New Image'}</h2>
            </div>
            {editingUrl && (
              <button onClick={cancelEdit} className="text-sm text-[#94A3B8] hover:text-white flex items-center gap-1">
                <X className="w-4 h-4" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleAddOrUpdateImage} className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Side Inputs */}
              <div className="flex-1 flex flex-col gap-6">
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
              </div>

              {/* Right Side Image Preview */}
              <div className="w-full md:w-[200px] lg:w-[250px] flex flex-col gap-2 flex-shrink-0">
                <label className="text-sm text-[#94A3B8]">Image Preview</label>
                <div className="w-full aspect-[3/4] bg-black/20 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
                  {url ? (
                    <ImageWithFallback src={url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-[#94A3B8] opacity-50">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs">No image provided</span>
                    </div>
                  )}
                </div>
              </div>
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
              className={`mt-4 w-full text-[#0A0E1A] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 ${
                editingUrl ? 'bg-gradient-to-r from-[#10B981] to-[#34D399]' : 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]'
              }`}
            >
              {editingUrl ? <Save className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              {loading ? "Saving..." : editingUrl ? "Update Image" : "Upload Image to Gallery"}
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

      {/* EXISTING GALLERY LIST */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-serif text-white mb-6">Existing Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {initialImages.map((img) => (
            <div key={img.url} className="bg-black/20 rounded-xl overflow-hidden border border-white/10 group">
              <div className="aspect-[4/3] relative overflow-hidden">
                <ImageWithFallback src={img.url} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={() => handleEditClick(img)} className="p-2 bg-[#F59E0B] rounded-full hover:scale-110 transition-transform">
                    <Edit2 className="w-4 h-4 text-[#0A0E1A]" />
                  </button>
                  <button onClick={() => handleDeleteImage(img.url)} className="p-2 bg-red-500 rounded-full hover:scale-110 transition-transform">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium truncate">{img.label}</h3>
                <p className="text-xs text-[#94A3B8] mt-1 line-clamp-1">{img.tags}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
