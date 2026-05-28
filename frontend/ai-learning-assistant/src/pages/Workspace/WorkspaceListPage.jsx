import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Compass, Sparkles, Clock, Target, Play, Search, Grid, List } from "lucide-react";
import workspaceService from "../../services/workspaceService";
import { toast } from "react-hot-toast";
import CreateWorkspaceModal from "./CreateWorkspaceModal";

export default function WorkspaceListPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");

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

  const filteredWorkspaces = workspaces.filter(w => 
    w.topic?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-ink">
      {/* Header Container */}
      <div className="space-y-6">
        {/* ROW 1 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink flex items-center gap-3">
              <Compass className="w-8 h-8 text-purple-500" />
              Learning Workspaces
            </h1>
            <p className="text-body text-sm mt-1">
              AI-curated learning paths tailored to your goals.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2
              bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500
              text-white font-semibold
              px-6 py-3 rounded-xl
              shadow-md shadow-purple-500/20 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Journey
          </button>
        </div>

        {/* ROW 2: Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* LEFT TABS */}
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/60 text-purple-700 border border-purple-200 shadow-sm font-semibold">
              All Workspaces
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/40 text-body border border-white/40 hover:bg-white/60 transition shadow-sm">
              Recently Added
            </button>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-3">
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-body"
              />
              <input
                type="text"
                placeholder="Search workspaces"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-56
                  rounded-xl
                  bg-white/60 backdrop-blur-md
                  border border-white/50
                  text-sm text-ink
                  placeholder-gray-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-purple-400/50 shadow-sm"
              />
            </div>

            {/* SORT */}
            <select
              className="px-3 py-2 rounded-xl
                bg-white/60 backdrop-blur-md
                border border-white/50
                text-sm text-ink
                focus:outline-none shadow-sm"
            >
              <option>Sort by</option>
              <option>Name</option>
              <option>Date</option>
            </select>

            {/* GRID / LIST */}
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-xl border border-white/50 shadow-sm transition-colors
                ${view === "grid" ? "bg-white/80 text-purple-600" : "bg-white/40 text-body hover:bg-white/60"}
              `}
            >
              <Grid size={18} />
            </button>

            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-xl border border-white/50 shadow-sm transition-colors
                ${view === "list" ? "bg-white/80 text-purple-600" : "bg-white/40 text-body hover:bg-white/60"}
              `}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-10 h-10 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold text-ink mb-2">No workspaces found</h2>
          <p className="text-body mb-6 max-w-md mx-auto">
            Create your first learning workspace or try a different search.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 
              bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500
              text-white font-semibold
              px-6 py-3 rounded-xl
              shadow-md shadow-purple-500/20 hover:shadow-lg transition-all mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Generate Roadmap
          </button>
        </div>
      ) : (
        <div className={
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredWorkspaces.map((workspace, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={workspace._id}
              onClick={() => navigate(`/workspaces/${workspace._id}`)}
              className="glass-card p-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl text-purple-600 shadow-sm">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1 bg-white/60 shadow-sm rounded-full text-xs font-semibold text-purple-700 capitalize border border-white/40">
                    {workspace.level}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-ink mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {workspace.topic}
                </h3>

                {workspace.goal && (
                  <p className="text-body text-sm mb-6 flex items-start gap-2 line-clamp-2">
                    <Target className="w-4 h-4 mt-0.5 shrink-0 text-mute" />
                    {workspace.goal}
                  </p>
                )}

                <div className="mt-auto space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-body">Progress</span>
                      <span className="text-purple-600 font-semibold">{workspace.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
                        style={{ width: `${workspace.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-hairline">
                    <div className="flex items-center gap-2 text-xs text-mute font-medium">
                      <Clock className="w-4 h-4" />
                      Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/60 shadow-sm flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors border border-white/40">
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
