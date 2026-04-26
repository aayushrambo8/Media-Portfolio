"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, updateCredentials } from "../../actions";
import { motion, AnimatePresence } from "motion/react";
import { Lock, User, RefreshCw, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Login states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Change credential states
  const [oldUsername, setOldUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    const result = await login(username, password);
    
    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    const result = await updateCredentials(oldUsername, oldPassword, newUsername, newPassword);
    
    if (result.success) {
      setSuccess("Credentials updated successfully! Please login.");
      setIsChanging(false);
      setUsername(newUsername);
      setPassword("");
      setOldUsername("");
      setOldPassword("");
      setNewUsername("");
      setNewPassword("");
    } else {
      setError(result.error || "Failed to change credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] border border-white/10 p-8 shadow-2xl overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          {!isChanging ? (
            <motion.div
              key="login"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-[#0A0E1A]" />
                </div>
                <h1 className="text-3xl font-serif text-white">Admin Access</h1>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                    required
                  />
                </div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                {success && <p className="text-green-400 text-sm text-center">{success}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#0A0E1A] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
                >
                  {loading ? "Authenticating..." : "Login"}
                </button>
              </form>

              <button
                onClick={() => {
                  setIsChanging(true);
                  setError("");
                  setSuccess("");
                }}
                className="w-full mt-6 text-[#94A3B8] hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Change Credentials?
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="change"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => {
                  setIsChanging(false);
                  setError("");
                  setSuccess("");
                }}
                className="absolute top-6 left-6 text-[#94A3B8] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-serif text-white text-center">Change Credentials</h1>
              </div>

              <form onSubmit={handleChangeCredentials} className="flex flex-col gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Current Info</p>
                  <input
                    type="text"
                    placeholder="Current Username"
                    value={oldUsername}
                    onChange={(e) => setOldUsername(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                    required
                  />
                </div>

                <div className="space-y-3 mt-2">
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">New Info</p>
                  <input
                    type="text"
                    placeholder="New Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                    required
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
                    required
                  />
                </div>
                
                {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
                >
                  {loading ? "Updating..." : "Update Credentials"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
