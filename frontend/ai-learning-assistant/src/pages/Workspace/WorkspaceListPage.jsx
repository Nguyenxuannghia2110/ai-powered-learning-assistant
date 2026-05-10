import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Compass, Sparkles, Clock, Target, Play } from "lucide-react";
import workspaceService from "../../services/workspaceService";
import { toast } from "react-hot-toast";
import CreateWorkspaceModal from "./CreateWorkspaceModal";

export default function WorkspaceListPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data.data); // data might be inside data.data or just data depending on backend
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (formData) => {
    setIsCreating(true);
    try {
      const data = await workspaceService.createWorkspace(formData);
      toast.success("Workspace created successfully!");
      setIsCreateModalOpen(false);
      navigate(`/workspaces/${data.data._id}`); // Adjust path based on your backend response structure
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error(error.response?.data?.message || "Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Compass className="w-8 h-8 text-emerald-400" />
            Learning Workspaces
          </h1>
          <p className="text-gray-400 mt-2">
            AI-curated learning paths tailored to your goals.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
        >
          <Plus className="w-5 h-5" />
          New Journey
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No workspaces yet</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create your first learning workspace. Tell our AI what you want to learn, and it will generate a step-by-step roadmap for you.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-all mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Generate Roadmap
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={workspace._id}
              onClick={() => navigate(`/workspaces/${workspace._id}`)}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
            >
              {/* Decorative Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-gray-300 capitalize">
                    {workspace.level}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {workspace.topic}
                </h3>

                {workspace.goal && (
                  <p className="text-gray-400 text-sm mb-6 flex items-start gap-2 line-clamp-2">
                    <Target className="w-4 h-4 mt-0.5 shrink-0" />
                    {workspace.goal}
                  </p>
                )}

                <div className="mt-auto space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-emerald-400 font-medium">{workspace.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${workspace.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-4 h-4" />
                      Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWorkspace}
        isSubmitting={isCreating}
      />
    </div>
  );
}
