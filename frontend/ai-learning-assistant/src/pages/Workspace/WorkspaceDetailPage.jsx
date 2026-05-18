import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Compass,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  BookOpen,
  Brain,
  Star,
  MoreVertical,
  Trash2,
  RotateCcw
} from "lucide-react";
import workspaceService from "../../services/workspaceService";
import { toast } from "react-hot-toast";

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  const fetchWorkspace = async () => {
    try {
      const response = await workspaceService.getWorkspaceById(id);
      setWorkspace(response.data);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      toast.error("Failed to load workspace");
      navigate("/workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = async () => {
    if (!window.confirm("Are you sure you want to reset your progress? This cannot be undone.")) return;
    try {
      await workspaceService.resetWorkspaceProgress(id);
      toast.success("Progress reset successfully");
      fetchWorkspace();
    } catch (error) {
      console.error("Error resetting progress:", error);
      toast.error("Failed to reset progress");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;
    try {
      await workspaceService.deleteWorkspace(id);
      toast.success("Workspace deleted");
      navigate("/workspaces");
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error("Failed to delete workspace");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate("/workspaces")}
        className="flex items-center gap-2 text-body hover:text-ink mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workspaces
      </button>

      {/* Header Section */}
      <div className="bg-canvas-card border border-hairline rounded-md p-8 mb-10 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider rounded-full border border-primary/20">
                {workspace.level}
              </div>
              <div className="px-3 py-1 bg-canvas-card text-body text-xs font-semibold uppercase tracking-wider rounded-full border border-hairline">
                {workspace.learningStyle}
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-ink mb-4 leading-tight">
              {workspace.topic}
            </h1>

            {workspace.goal && (
              <p className="text-lg text-body mb-6 max-w-2xl">
                Goal: {workspace.goal}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-sm text-body">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                {workspace.nodes.length} Nodes
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                {workspace.totalXP} XP Earned
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Created {new Date(workspace.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 min-w-[200px]">
            {/* Progress Circle */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="fill-none stroke-white/5 stroke-[8]"
                />
                <motion.circle
                  initial={{ strokeDasharray: "0, 300" }}
                  animate={{ strokeDasharray: `${(workspace.progress / 100) * 283}, 300` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  cx="50"
                  cy="50"
                  r="45"
                  className="fill-none stroke-emerald-500 stroke-[8] stroke-linecap-round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-ink">{workspace.progress}%</span>
                <span className="text-xs text-body">Completed</span>
              </div>
            </div>

            {/* Actions Menu (Simple) */}
            <div className="flex gap-2">
              <button
                onClick={handleResetProgress}
                title="Reset Progress"
                className="p-2 bg-canvas-card hover:bg-white/10 text-body hover:text-ink rounded-lg transition-colors border border-white/5 hover:border-hairline"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                title="Delete Workspace"
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="relative">
        <h2 className="text-2xl font-bold text-ink mb-8 flex items-center gap-3">
          <Compass className="w-6 h-6 text-primary" />
          Learning Roadmap
        </h2>

        <div className="absolute left-[27px] top-[70px] bottom-10 w-0.5 bg-gradient-to-b from-emerald-500/50 via-white/10 to-transparent" />

        <div className="space-y-6">
          {workspace.nodes.map((node, index) => {
            const isCompleted = node.status === "completed";
            const isUnlocked = node.status === "unlocked" || node.status === "completed";
            const isCurrent = !isCompleted && isUnlocked; // Assuming first unlocked non-completed is current

            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={node._id}
                className={`relative flex gap-6 group ${!isUnlocked ? "opacity-60" : ""}`}
              >
                {/* Timeline Icon */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-md flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : isCurrent
                        ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-110"
                        : "bg-canvas-card border-hairline text-mute"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isCurrent ? (
                      <PlayCircle className="w-6 h-6" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                </div>

                {/* Node Card */}
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      navigate(`/workspaces/${id}/nodes/${node._id}`);
                    }
                  }}
                  className={`flex-1 bg-canvas-card border ${
                    isCurrent ? "border-blue-500/30 shadow-lg shadow-blue-500/5" : "border-white/5"
                  } rounded-md p-6 transition-all duration-300 ${
                    isUnlocked ? "hover:border-hairline hover:bg-white/[0.02] cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-body">Step {index + 1}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          node.type === "lesson" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                          node.type === "practice" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                          "bg-gray-500/10 text-body border-gray-500/20"
                        }`}>
                          {node.type}
                        </span>
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? "text-ink group-hover:text-primary transition-colors" : "text-mute"}`}>
                        {node.title}
                      </h3>
                      <p className={`text-sm ${isUnlocked ? "text-body" : "text-gray-600"} max-w-2xl`}>
                        {node.description}
                      </p>
                    </div>

                    {isUnlocked && (
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-mute mb-1">Estimated Time</p>
                          <p className="text-sm font-medium text-ink flex items-center justify-end gap-1">
                            <Clock className="w-4 h-4 text-primary" />
                            {node.estimatedTime} min
                          </p>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden md:block" />
                        <div className="text-right">
                          <p className="text-xs text-mute mb-1">XP Reward</p>
                          <p className="text-sm font-medium text-ink flex items-center justify-end gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            +{node.xpReward}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
