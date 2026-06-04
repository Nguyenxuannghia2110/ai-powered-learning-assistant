import React, { useState, useEffect, useRef } from "react";
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
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // State for form fields
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    neuralBio: "",
    profileImage: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

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
          profileImage: userData.profileImage || "",
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

      const formData = new FormData();
      formData.append("username", profile.fullName);
      if (profile.email) formData.append("email", profile.email);
      
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await authService.updateProfile(formData);
      updateUser(response);

      if (!silent) toast.success("Profile updated ⚡");
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
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
      <div className="min-h-full h-full bg-transparent flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          <p className="text-purple-600 text-[10px] tracking-[0.4em] uppercase font-bold">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full h-full bg-transparent text-ink selection:bg-purple-400/30">
      <div className="relative w-full max-w-5xl mx-auto px-8 pb-24 pt-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-[3px] border-purple-400 p-1 bg-white/50 shadow-sm overflow-hidden relative">
              <div className="w-full h-full rounded-full bg-white/60 flex items-center justify-center overflow-hidden">
                <img
                  src={avatarPreview || profile.profileImage || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full text-purple-600 border border-white/50 shadow-md hover:text-purple-700 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </motion.button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink mb-1">
            {profile.fullName || "Loading..."}
          </h1>
          <p className="text-purple-600 font-bold text-xs tracking-widest opacity-80">
            {profile.email}
          </p>
        </div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[32px] p-10 shadow-sm border border-white/50 w-full"
        >
          {/* PERSONAL IDENTITY */}
          <section className="mb-14">
            <h3 className="text-[10px] tracking-[0.3em] font-black text-purple-600 uppercase mb-10">
              Personal Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              {/* Full Name */}
              <div className="relative space-y-2">
                <label className="block text-[10px] tracking-[0.1em] text-mute uppercase font-bold">
                  Full Name
                </label>
                <div className="flex items-center group border-b border-white/50 hover:border-purple-400 transition-all pb-1">
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="w-full bg-transparent py-1.5 text-ink focus:outline-none tracking-wide text-sm font-medium pr-10"
                  />
                  <button
                    onClick={() => handleSave()}
                    className="absolute right-0 text-mute hover:text-purple-600 transition-colors"
                    title="Save Name"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Email - Read Only */}
              <div className="space-y-2">
                <label className="block text-[10px] tracking-[0.1em] text-mute uppercase font-bold">
                  Email Address
                </label>
                <div className="border-b border-white/50 pb-2.5">
                  <span className="text-ink/80 text-sm font-medium tracking-wide">
                    {profile.email}
                  </span>
                </div>
              </div>

              {/* Password - Read Only Dots */}
              <div className="space-y-2">
                <label className="block text-[10px] tracking-[0.1em] text-mute uppercase font-bold">
                  Access Credentials
                </label>
                <div className="border-b border-white/50 pb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-mute text-sm font-medium tracking-[0.4em] translate-y-0.5">
                      ••••••••••••
                    </span>
                    <Shield className="w-4 h-4 text-mute" />
                  </div>
                </div>
              </div>
            </div>

            {/* Neural Bio */}
            <div className="mt-10 space-y-2">
              <label className="block text-[10px] tracking-[0.1em] text-mute uppercase font-bold">
                Bio
              </label>
              <textarea
                name="neuralBio"
                value={profile.neuralBio}
                onChange={handleChange}
                className="w-full bg-white/40 border border-white/50 rounded-xl px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white/60 tracking-wide text-sm font-medium pr-10 leading-relaxed min-h-[80px] resize-none shadow-sm transition-all"
              />
            </div>

            <div className="h-px bg-white/40 my-10" />
          </section>

          {/* SYSTEM PARAMETERS */}
          <section>
            <h3 className="text-[10px] tracking-[0.3em] font-black text-purple-600 uppercase mb-10">
              System Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Notifications */}
              <div className="flex items-center justify-between group bg-white/40 border border-white/50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-white/60 border border-white/50 shadow-sm flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Bell className="w-5 h-5 text-mute group-hover:text-purple-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-ink">
                      Notifications
                    </h4>
                    <p className="text-[10px] text-body font-medium">
                      Real-time alerts for system events
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("notifications")}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 shadow-inner ${
                    toggles.notifications ? "bg-purple-500" : "bg-white/40 border border-white/50"
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
              <div className="flex items-center justify-between group bg-white/40 border border-white/50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-white/60 border border-white/50 shadow-sm flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Monitor className="w-5 h-5 text-mute group-hover:text-purple-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-ink">
                      High-Contrast Interface
                    </h4>
                    <p className="text-[10px] text-body font-medium">
                      Optimize visual clarity for readability
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("highContrast")}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 shadow-inner ${
                    toggles.highContrast ? "bg-purple-500" : "bg-white/40 border border-white/50"
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
                className="w-full flex items-center justify-between group bg-white/40 border border-white/50 rounded-2xl p-5 shadow-sm hover:bg-white/60 hover:border-purple-300 transition-all col-span-1 md:col-span-2"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-white/60 border border-white/50 shadow-sm flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Zap className="w-5 h-5 text-mute group-hover:text-purple-500 transition-colors" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-[13px] font-bold text-ink">
                      Security & Access
                    </h4>
                    <p className="text-[10px] text-body font-medium">
                      Manage multi-factor authentication and passwords
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-mute group-hover:text-purple-500 transition-all transform group-hover:translate-x-1" />
              </button>
            </div>
          </section>

          {/* SAVE CHANGES BUTTON */}
          <div className="mt-16 md:w-1/2 mx-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSaving}
              onClick={() => handleSave()}
              className="w-full py-5 rounded-[20px] bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-purple-500/30"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 fill-white" />
              )}
              {isSaving ? "SAVING..." : "Save Changes"}
            </motion.button>
            <p className="mt-6 text-center text-mute text-[9px] uppercase tracking-[0.3em] font-medium">
              Last Synchronized:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </motion.div>

        {/* TERMINATE SESSION */}
        <div className="mt-10 flex justify-center">
          <motion.button
            whileHover={{ opacity: 1, scale: 1.05 }}
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-500 font-bold opacity-80 hover:opacity-100 transition-opacity"
          >
            <Power className="w-4 h-4 stroke-[3px]" />
            <span className="text-[11px] tracking-[0.3em] uppercase">
              Logout
            </span>
          </motion.button>
        </div>
      </div>

      {/* NEW PASSWORD MODAL */}
      <AnimatePresence>
        {openPasswordModal && (
          <motion.div
            className="fixed inset-0 bg-white/20 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md glass-card border border-white/50 rounded-[40px] p-10 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-70" />

              <h3 className="text-sm font-black tracking-[0.3em] text-purple-600 mb-8 uppercase text-center">
                Security Protocol
              </h3>

              <div className="space-y-8">
                {[
                  { id: "currentPassword", placeholder: "Current Password" },
                  { id: "newPassword", placeholder: "New Password" },
                  { id: "confirmPassword", placeholder: "Verify Password" },
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-[9px] text-mute uppercase font-bold tracking-widest">
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
                      className="w-full bg-white/60 border border-white/50 py-3 px-4 text-ink focus:border-purple-400 focus:bg-white/80 outline-none transition-all rounded-lg text-sm shadow-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-12">
                <button
                  onClick={() => setOpenPasswordModal(false)}
                  className="flex-1 py-4 text-mute text-[11px] font-bold uppercase tracking-widest hover:text-ink transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handlePasswordUpdate}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-md shadow-purple-500/20 hover:scale-105 transition-transform"
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
