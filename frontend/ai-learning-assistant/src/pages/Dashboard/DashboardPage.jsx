import { useEffect, useState } from "react";
import { getDashboardData } from "../../services/progressService";
import StatCard from "../../components/dashboard/StatCard";
import QuizScoreChart from "../../components/dashboard/QuizScoreChart";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import SkeletonDashboard from "../../components/dashboard/SkeletonDashboard";
import { motion } from "framer-motion";

import {
  FileText,
  Layers,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Flame,
  Clock,
  ArrowUp,
} from "lucide-react";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getDashboardData();

        console.log("Dashboard API:", result);

        if (!result.success || !result.data) {
          throw new Error("Invalid dashboard response");
        }

        setData(result.data);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <SkeletonDashboard />;

  if (!data) {
    return <div className="p-10 text-red-400">Failed to load dashboard</div>;
  }

  /* ================= CORE STATS ================= */

  const stats = [
    {
      label: "Documents",
      value: data.totalDocuments,
      icon: FileText,
    },
    {
      label: "Flashcard Sets",
      value: data.totalFlashcards,
      icon: Layers,
    },
    {
      label: "Total Cards",
      value: data.totalCards,
      icon: BookOpen,
    },
    {
      label: "Quizzes",
      value: data.totalQuizzes,
      icon: HelpCircle,
    },
  ];

  /* ================= INSIGHTS ================= */

  const insights = [
    {
      label: "Study Streak",
      value: `${data.studyStreak} days`,
      icon: Flame,
      color: "text-orange-400",
    },
    {
      label: "Average Score",
      value: `${data.avgScore}%`,
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      label: "Study Time",
      value: `${data.totalStudyHours} hrs`,
      icon: Clock,
      color: "text-blue-400",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="
    min-h-screen
    bg-[radial-gradient(circle_at_top,_#0f1f1a,_#050807_60%)]
    text-white
    pt-18
    px-8
    space-y-8
  "
    >
      {/* 🌌 BACKGROUND GLOW LAYER */}

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="
        absolute
        top-[-200px]
        left-1/2
        -translate-x-1/2
        w-[900px]
        h-[900px]
        bg-emerald-500/10
        blur-[220px]
        "
        />
      </div>
      {/* HERO */}

      <motion.div
        variants={item}
        className="bg-gradient-to-r from-[#0f2d25] to-[#0c1f1b] border border-[#1f3d35] rounded-3xl p-14 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back {data.userName} 👋
          </h1>

          <p className="text-gray-300">
            You've reached {data.weekProgress}% of your study goal this week.
            Keep up the momentum to master your upcoming finals.
          </p>
        </div>

        <button
          className="
          bg-white
          text-black
          px-6
          py-2
          rounded-full
          font-semibold
          hover:scale-105
          transition
          "
        >
          + New Study Session
        </button>
      </motion.div>

      {/* STATS */}

      <motion.div variants={container} className="grid md:grid-cols-4 gap-6">
        {stats.map((itemData, index) => (
          <motion.div key={index} variants={item}>
            <StatCard
              label={itemData.label}
              value={itemData.value}
              icon={itemData.icon}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* INSIGHTS */}

      <motion.div variants={container} className="grid md:grid-cols-4 gap-6">
        {insights.map((itemData, index) => (
          <motion.div key={index} variants={item} className="w-full">
            <StatCard
              label={itemData.label}
              value={itemData.value}
              icon={itemData.icon}
              iconColor={itemData.color}
            />
          </motion.div>
        ))}

        {/* TOPIC CARD */}

        <motion.div
          variants={item}
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-6"
        >
          <ArrowUp className="w-6 h-6 text-emerald-400 mb-3" />

          <p className="text-lg font-semibold mb-3">Topic Mastery</p>

          <p className="flex justify-between text-sm text-gray-400">
            <span>Strongest</span>
            <span className="text-green-400">
              {data.strongestTopic?.name} ({data.strongestTopic?.score}%)
            </span>
          </p>

          <p className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Weakest</span>
            <span className="text-yellow-400">
              {data.weakestTopic?.name} ({data.weakestTopic?.score}%)
            </span>
          </p>
        </motion.div>
      </motion.div>

      {/* CHART + ACTIVITY */}

      <motion.div variants={container} className="grid lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2">
          <QuizScoreChart data={data.quizTrend || []} />
        </motion.div>

        <motion.div variants={item}>
          <ActivityTimeline activities={data.activities || []} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
