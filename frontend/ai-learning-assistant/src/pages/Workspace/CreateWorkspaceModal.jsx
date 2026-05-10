import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen, Compass, Target, Type } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateWorkspaceModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    topic: "",
    goal: "",
    level: "beginner",
    learningStyle: "interactive",
    language: "en",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-[#0a0f0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">New Workspace</h2>
                <p className="text-sm text-gray-400">Generate a custom learning journey</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Topic or Subject
              </label>
              <input
                type="text"
                placeholder="e.g., Python Programming, World History, React Hooks..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Goal */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Learning Goal (Optional)
              </label>
              <input
                type="text"
                placeholder="What do you want to achieve?"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Experience Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                  disabled={isSubmitting}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                  disabled={isSubmitting}
                >
                  <option value="en">English</option>
                  <option value="vi">Vietnamese</option>
                  <option value="jp">Japanese</option>
                </select>
              </div>
            </div>

            {/* Learning Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                Learning Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["visual", "practice", "reading", "interactive"].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData({ ...formData, learningStyle: style })}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                      formData.learningStyle === style
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-black/50 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
                    }`}
                    disabled={isSubmitting}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Generating AI Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Workspace
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
