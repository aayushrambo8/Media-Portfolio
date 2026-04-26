"use client";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { GraduationCap, Code, Database, Trophy, Instagram, Linkedin, Github, Send, Sparkles } from "lucide-react";

export function About() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [focused, setFocused] = useState({
    name: false,
    email: false,
    message: false,
  });

  // Handle hash navigation on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#contact') {
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for your message! I'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  const achievements = [
    {
      title: "Photographer for Raftaar, Chaar Diwari, and Darshan Rawal",
      subtext: "Captured iconic performances for leading Indian artists",
    },
    {
      title: "Covered Anwesha IIT Patna 2026",
      subtext: "Premier Tech Festival - Official Photography",
    },
    {
      title: "Covered Kaizen AIIMS Patna 2026",
      subtext: "Medical College Fest - Complete Event Coverage",
    },
    {
      title: "2+ Years of Professional Photography",
      subtext: "Specialized in Live Concert and Event Photography",
    },
    {
      title: "Dual Degree Achievement",
      subtext: "BTech. Computer Science Engineering & BSc. Data Analytics",
    },
  ];

  const techStack = [
    { name: "C++", color: "#F59E0B" },
    { name: "Python", color: "#FBBF24" },
    { name: "Linear Algebra", color: "#8B5CF6" },
    { name: "Data Analytics", color: "#F59E0B" },
    { name: "Machine Learning", color: "#FBBF24" },
    { name: "Statistics", color: "#8B5CF6" },
  ];

  const socialLinks = [
    { icon: Instagram, label: "Instagram", href: "https://instagram.com/freshlycuttomato", color: "#E1306C" },
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/aayushrambo8/", color: "#0A66C2" },
    { icon: Github, label: "GitHub", href: "https://github.com/aayushrambo8/", color: "#F8FAFC" },
  ];

  return (
    <div className="pt-24 md:pt-40 pb-0">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-12">
        {/* A. Introduction Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-32 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-gradient-to-r from-[#F59E0B]/10 to-[#8B5CF6]/10 border border-[#F59E0B]/20"
          >
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#F59E0B]" />
            <span className="text-xs md:text-sm font-medium text-[#F59E0B]">Get to Know Me</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-8xl mb-6 md:mb-10 font-serif text-[#F8FAFC]">About Me</h1>
          <p className="text-base md:text-xl lg:text-2xl text-[#94A3B8] leading-relaxed max-w-[800px] mx-auto px-2 md:px-4" style={{ lineHeight: 1.7 }}>
            I'm a technologist and visual storyteller, merging engineering precision with the art of photography to create meaningful narratives.
          </p>
        </motion.div>

        {/* B. Education Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20 md:mb-32"
        >
          <motion.div
            whileHover={{ y: -12, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/20 via-[#FBBF24]/10 to-transparent rounded-[24px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] p-6 md:p-10 border border-white/10 shadow-2xl">
              <div className="flex items-start gap-4 md:gap-5 mb-4 md:mb-6">
                <div className="p-3 md:p-4 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-[12px] md:rounded-[16px] shadow-lg">
                  <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-[#0A0E1A]" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl mb-1 md:mb-3 text-[#F8FAFC] font-serif">B.Tech</h3>
                  <p className="text-[#94A3B8] text-base md:text-lg">
                    Computer Science & Engineering
                  </p>
                </div>
              </div>
              <p className="text-lg md:text-xl text-[#CBD5E1] font-medium">
                BIT Mesra, Patna Campus
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -12, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 via-[#F59E0B]/10 to-transparent rounded-[24px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-[#1A1F2E]/80 backdrop-blur-xl rounded-[24px] p-6 md:p-10 border border-white/10 shadow-2xl">
              <div className="flex items-start gap-4 md:gap-5 mb-4 md:mb-6">
                <div className="p-3 md:p-4 bg-gradient-to-br from-[#8B5CF6] to-[#F59E0B] rounded-[12px] md:rounded-[16px] shadow-lg">
                  <Database className="w-6 h-6 md:w-8 md:h-8 text-[#F8FAFC]" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl mb-1 md:mb-3 text-[#F8FAFC] font-serif">B.Sc</h3>
                  <p className="text-[#94A3B8] text-base md:text-lg">
                    Computer Science & Data Analytics
                  </p>
                </div>
              </div>
              <p className="text-lg md:text-xl text-[#CBD5E1] font-medium">
                IIT Patna Hybrid Program
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* C. Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <h2 className="text-3xl md:text-5xl mb-8 md:mb-12 font-serif text-[#F8FAFC] text-center">My Story</h2>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/10 via-[#8B5CF6]/10 to-[#F59E0B]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-[#1A1F2E]/60 backdrop-blur-xl rounded-[24px] md:rounded-[28px] p-6 md:p-14 border border-white/10 shadow-2xl">
              <p className="text-base md:text-xl text-[#CBD5E1] leading-relaxed" style={{ lineHeight: 1.9 }}>
                I am a passionate technologist and visual storyteller, bridging the worlds of computer science and photography. Currently pursuing a dual degree in Computer Science & Engineering from BIT Mesra (Patna Campus) and Data Analytics from IIT Patna. I have developed a unique perspective that combines technical precision with creative vision. My journey in photography began around two years ago, evolving from a hobby into a professional pursuit. I've had the privilege of capturing iconic moments for renowned artists including 
                <span className="text-[#F8FAFC] font-bold"> Raftaar</span>, 
                <span className="text-[#F8FAFC] font-bold"> Chaar Diwari</span>, 
                <span className="text-[#F8FAFC] font-bold"> Little Bhatia</span>, and  
                <span className="text-[#F8FAFC] font-bold"> Darshan Rawal</span>, 
                <span className="text-[#F8FAFC] font-bold"> Shaan</span> and many more. My lens has documented major collegiate festivals like Anwesha at IIT Patna and Kaizen at AIIMS Patna, where I've honed my skills in live event and concert photography. Through my work, I strive to freeze fleeting moments into timeless memories even if you are a participant enjoying the show and want your pictures to be taken, whether I'm coding algorithms or composing the perfect shot.
              </p>
            </div>
          </div>
        </motion.div>

        {/* D. Achievements Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <h2 className="text-3xl md:text-5xl mb-10 md:mb-16 font-serif text-[#F8FAFC] text-center">Milestones</h2>
          <div className="relative max-w-[900px] mx-auto px-2">
            {/* Timeline line */}
            <div className="absolute left-[10px] md:left-[11px] top-0 w-[2px] md:w-[3px] h-full bg-white/5 rounded-full" />
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute left-[10px] md:left-[11px] top-0 w-[2px] md:w-[3px] bg-gradient-to-b from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]"
            />

            <div className="space-y-10 md:space-y-12">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + index * 0.1,
                  }}
                  className="flex items-start gap-6 md:gap-8 group relative"
                >
                  {/* Glowing Dot */}
                  <div className="relative mt-1 z-10">
                    <motion.div
                      whileHover={{ scale: 1.3 }}
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] shadow-[0_0_20px_rgba(245,158,11,0.6)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.8)] transition-all duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <h3 className="text-lg md:text-xl text-[#F8FAFC] mb-1 md:mb-2 group-hover:text-[#FBBF24] transition-colors duration-300 font-medium leading-snug">
                      {achievement.title}
                    </h3>
                    <p className="text-[#94A3B8] text-base md:text-lg">{achievement.subtext}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>


        {/* G. Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <h3 className="text-2xl md:text-3xl mb-8 md:mb-10 text-center text-[#F8FAFC] font-medium">Connect on Social Media</h3>
          <div className="flex justify-center gap-4 md:gap-6" id="contact">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "backOut",
                }}
                whileHover={{ scale: 1.15, y: -6 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 md:w-20 md:h-20 bg-[#1A1F2E]/80 backdrop-blur-xl border-2 border-white/10 rounded-[14px] md:rounded-[18px] flex items-center justify-center transition-all duration-300 group hover:border-white/30"
                style={{
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                }}
              >
                <social.icon
                  className="w-7 h-7 md:w-9 md:h-9 text-[#94A3B8] transition-colors duration-300"
                  style={{
                    color: index === 0 ? "#E1306C" : index === 1 ? "#0A66C2" : "#F8FAFC",
                  }}
                />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#0F1419]/80 backdrop-blur-xl py-16 mt-20 border-t border-white/10"
      >
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-transparent mb-8" />
          <p className="text-center text-[#94A3B8] text-lg">
            © 2026 Aayush Babu | Designed with Precision & Passion
          </p>
        </div>
      </motion.footer>
    </div>
  );
}