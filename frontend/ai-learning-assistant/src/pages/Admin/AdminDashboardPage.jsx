import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { Users, FileText, Layers, BookOpen, Activity, PlaySquare } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        if (res.success) {
          setStatsData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!statsData) return <div className="text-red-500">Error loading data.</div>;

  const statCards = [
    { label: "Total Users", value: statsData.totalUsers, icon: Users, color: "text-blue-400" },
    { label: "New Users (7d)", value: statsData.newUsersThisWeek, icon: Activity, color: "text-green-400" },
    { label: "Workspaces", value: statsData.totalWorkspaces, icon: PlaySquare, color: "text-purple-400" },
    { label: "Documents", value: statsData.totalDocuments, icon: FileText, color: "text-orange-400" },
    { label: "Total Quizzes", value: statsData.totalQuizzes, icon: BookOpen, color: "text-primary" },
    { label: "Total Flashcards", value: statsData.totalFlashcards, icon: Layers, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-ink">System Overview</h1>
        <p className="text-body mt-2">Platform statistics and content generation metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-canvas-soft border border-hairline rounded-md p-6 flex items-start justify-between">
            <div>
              <p className="text-mute text-sm font-medium tracking-wide">{stat.label}</p>
              <h3 className="text-3xl font-bold text-ink mt-2">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-md bg-canvas border border-hairline ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generative AI Stats */}
        <div className="bg-canvas-soft border border-hairline rounded-md p-6">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> AI Content Generation
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-canvas border border-hairline rounded-md">
              <span className="text-body">Flashcards Generated From Docs</span>
              <span className="text-xl font-bold text-primary">{statsData.flashcardsFromDocs}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-canvas border border-hairline rounded-md">
              <span className="text-body">Quizzes Generated From Docs</span>
              <span className="text-xl font-bold text-primary">{statsData.quizzesFromDocs}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
