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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg glass-card overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">New Workspace</h2>
                <p className="text-sm text-body">Generate a custom learning journey</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-body hover:text-ink hover:bg-white/40 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-body flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Topic or Subject
              </label>
              <input
                type="text"
                placeholder="e.g., Python Programming, World History, React Hooks..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-inner transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Goal */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-body flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Learning Goal (Optional)
              </label>
              <input
                type="text"
                placeholder="What do you want to achieve?"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-inner transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Level */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-body">Experience Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-sm transition-all"
                  disabled={isSubmitting}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-body">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-sm transition-all"
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
              <label className="text-sm font-semibold text-body flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                Learning Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["visual", "practice", "reading", "interactive"].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData({ ...formData, learningStyle: style })}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize shadow-sm transition-all ${
                      formData.learningStyle === style
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-white/40 border-white/50 text-body hover:bg-white/60"
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
                className="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-white/50 shadow-sm hover:bg-white/80 text-body font-semibold transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-purple-500/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate
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
