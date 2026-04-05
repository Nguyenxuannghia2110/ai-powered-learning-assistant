import React, { useState, useEffect } from "react";
import {
  Camera,
  Zap,
  Power,
  ChevronRight,
  Shield,
  Bell,
  Cpu,
  Monitor,
  ArrowLeft,
  Edit3,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // State for form fields
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    neuralBio: "",
  });

  // State for visibility and toggles
  const [toggles, setToggles] = useState({
    notifications: true,
    highContrast: false,
  });

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        const userData = await authService.getProfile(); // ✅ đã là data

        setProfile({
          fullName: userData.fullName || userData.username || "",
          email: userData.email || "",
          neuralBio:
            userData.bio ||
            userData.neuralBio ||
            "Senior Neural Architect specializing in large-scale cognitive mapping...",
        });

        if (userData.settings) {
          setToggles({
            notifications: userData.settings.notifications ?? true,
            highContrast: userData.settings.highContrast ?? false,
          });
        }
      } catch (error) {
        toast.error(error.message || "Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (silent = false) => {
    try {
      if (!silent) setIsSaving(true);

      const payload = {
        username: profile.fullName,
        bio: profile.neuralBio,
        settings: toggles,
      };

      const response = await authService.updateProfile(payload);

      if (!silent) toast.success("Profile updated ⚡");
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsSaving(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Security protocols updated ⚡");
      setOpenPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error("Security update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Session terminated", {
      icon: "🚪",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050807] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#00FF9D] animate-spin" />
          <p className="text-[#00FF9D] text-[10px] tracking-[0.4em] uppercase">
            Accessing Primary Core...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050807] text-[#e4e4e7] selection:bg-[#00FF9D]/30">
      <div className="relative max-w-2xl mx-auto px-6 pb-24 pt-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-[3px] border-[#00FF9D] p-1 bg-black overflow-hidden relative">
              <div className="w-full h-full rounded-full bg-[#0a0f0d] flex items-center justify-center overflow-hidden">
                {/* Fallback to icon if no avatar, but user likely wants a face */}
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop"
                  alt="Avatar"
                  className="w-full h-full object-cover grayscale-[0.3]"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 bg-[#00FF9D] p-1.5 rounded-full text-black border-4 border-[#050807] shadow-lg group-hover:bg-[#00e08b] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-white mb-1">
            {profile.fullName || "Loading..."}
          </h1>
          <p className="text-[#00FF9D] font-medium text-xs tracking-widest opacity-80">
            {profile.email}
          </p>
        </div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0b0f0e] rounded-[32px] p-10 shadow-2xl border border-white/5"
        >
          {/* PERSONAL IDENTITY */}
          <section className="mb-14">
            <h3 className="text-[10px] tracking-[0.3em] font-black text-[#00FF9D] uppercase mb-10">
              Personal Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              {/* Full Name */}
              <div className="relative space-y-2">
                <label className="block text-[10px] tracking-[0.1em] text-white/40 uppercase font-bold">
                  Full Name
                </label>
                <div className="flex items-center group border-b border-white/10 hover:border-[#00FF9D]/30 transition-all pb-1">
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="w-full bg-transparent py-1.5 text-white/90 focus:outline-none tracking-wide text-sm font-medium pr-10"
                  />
                  <button
                    onClick={() => handleSave()}
                    className="absolute right-0 text-white/20 hover:text-[#00FF9D] transition-colors"
                    title="Save Name"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Email - Read Only */}
              <div className="space-y-2">
                <label className="block text-[10px] tracking-[0.1em] text-white/40 uppercase font-bold">
                  Email Address
                </label>
                <div className="border-b border-white/10 pb-2.5">
                  <span className="text-white/60 text-sm font-medium tracking-wide">
                    {profile.email}
                  </span>
                </div>
              </div>

              {/* Password - Read Only Dots */}
              <div className="space-y-2">
                <label className="block text-[10px] tracking-[0.1em] text-white/40 uppercase font-bold">
                  Access Credentials
                </label>
                <div className="border-b border-white/10 pb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-sm font-medium tracking-[0.4em] translate-y-0.5">
                      ••••••••••••
                    </span>
                    <Shield className="w-4 h-4 text-white/10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Neural Bio */}
            <div className="mt-10 space-y-2">
              <label className="block text-[10px] tracking-[0.1em] text-white/40 uppercase font-bold">
                Neural Bio
              </label>
              <textarea
                name="neuralBio"
                value={profile.neuralBio}
                onChange={handleChange}
                className="w-full bg-transparent py-1.5 text-white/80 focus:outline-none tracking-wide text-sm font-medium pr-10 leading-relaxed min-h-[60px] resize-none"
              />
            </div>

            <div className="h-px bg-white/5 mt-10" />
          </section>

          {/* SYSTEM PARAMETERS */}
          <section>
            <h3 className="text-[10px] tracking-[0.3em] font-black text-[#00FF9D] uppercase mb-10">
              System Parameters
            </h3>

            <div className="space-y-8">
              {/* Notifications */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-zinc-400 group-hover:text-[#00FF9D] transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-zinc-200">
                      Neural Notifications
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Real-time alerts for system events
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("notifications")}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 ${
                    toggles.notifications ? "bg-[#00FF9D]" : "bg-zinc-800"
                  }`}
                >
                  <motion.div
                    animate={{ x: toggles.notifications ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-zinc-400 group-hover:text-[#00FF9D] transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-zinc-200">
                      High-Contrast Interface
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Optimize visual clarity for readability
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("highContrast")}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 ${
                    toggles.highContrast ? "bg-[#00FF9D]" : "bg-zinc-800"
                  }`}
                >
                  <motion.div
                    animate={{ x: toggles.highContrast ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {/* Security & Access (Password Modal trigger) */}
              <button
                onClick={() => setOpenPasswordModal(true)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#00FF9D]/10 transition-colors">
                    <Zap className="w-5 h-5 text-zinc-400 group-hover:text-[#00FF9D] transition-colors" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-[13px] font-bold text-zinc-200">
                      Security & Access
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Manage multi-factor authentication and passwords
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </button>
            </div>
          </section>

          {/* SAVE CHANGES BUTTON */}
          <div className="mt-16">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#00e08b" }}
              whileTap={{ scale: 0.98 }}
              disabled={isSaving}
              onClick={() => handleSave()}
              className="w-full py-5 rounded-[20px] bg-[#00FF9D] text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(0,255,157,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 fill-black" />
              )}
              {isSaving ? "SYNCHRONIZING..." : "Save Changes"}
            </motion.button>
            <p className="mt-6 text-center text-white/10 text-[9px] uppercase tracking-[0.3em] font-medium">
              Last Synchronized:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </motion.div>

        {/* TERMINATE SESSION */}
        <div className="mt-16 flex justify-center">
          <motion.button
            whileHover={{ opacity: 1, scale: 1.05 }}
            onClick={handleLogout}
            className="flex items-center gap-3 text-rose-500 font-black opacity-80"
          >
            <Power className="w-4 h-4 stroke-[3px]" />
            <span className="text-[11px] tracking-[0.3em] uppercase">
              Terminate Session
            </span>
          </motion.button>
        </div>
      </div>

      {/* NEW PASSWORD MODAL */}
      <AnimatePresence>
        {openPasswordModal && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#0b0f0e] border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF9D] to-transparent opacity-50" />

              <h3 className="text-sm font-black tracking-[0.3em] text-[#00FF9D] mb-8 uppercase text-center">
                Security Protocol
              </h3>

              <div className="space-y-8">
                {[
                  { id: "currentPassword", placeholder: "CURRENT_KEY" },
                  { id: "newPassword", placeholder: "NEW_ENCRYPTION_KEY" },
                  { id: "confirmPassword", placeholder: "VERIFY_KEY" },
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest">
                      {field.placeholder}
                    </label>
                    <input
                      type="password"
                      value={passwordData[field.id]}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="w-full bg-white/5 border-b border-white/10 py-3 px-4 text-white focus:border-[#00FF9D] focus:bg-[#00FF9D]/5 outline-none transition-all rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-12">
                <button
                  onClick={() => setOpenPasswordModal(false)}
                  className="flex-1 py-4 text-white/40 text-[11px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  Abort
                </button>

                <button
                  onClick={handlePasswordUpdate}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-[#00FF9D] text-black text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_20px_-5px_rgba(0,255,157,0.3)]"
                >
                  Update Key
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
