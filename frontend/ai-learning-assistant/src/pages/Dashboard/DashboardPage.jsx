import { useEffect, useState, useRef } from "react";
import { getDashboardData } from "../../services/progressService";
import SkeletonDashboard from "../../components/dashboard/SkeletonDashboard";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import MagicContainer from "../../components/MagicContainer";
const formatDashboardDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

const formatDashboardTime = (date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

const formatCalendarMonth = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getWeekStart = (date) => {
  const start = new Date(date);
  const dayOffset = (start.getDay() + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - dayOffset);
  return start;
};

const getCalendarWeekDays = (weekStart) =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });

const getDateKey = (date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [calendarWeekStart, setCalendarWeekStart] = useState(() =>
    getWeekStart(new Date()),
  );
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getDashboardData();
        if (result.success && result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <SkeletonDashboard />;

  const username = data?.userName || user?.username || "User";
  const calendarDays = getCalendarWeekDays(calendarWeekStart);
  const weekdayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const activityDateKeys = new Set(
    data?.activities
      ?.filter((activity) => activity.createdAt)
      .map((activity) => getDateKey(new Date(activity.createdAt))) || [],
  );

  const handleCalendarWeekChange = (offset) => {
    setCalendarWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + offset * 7);
      return next;
    });
  };

  return (
    <div className="min-h-full h-full bg-transparent text-ink p-8 font-sans flex gap-8">
      {/* MAIN CONTENT (LEFT) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b border-white/40 pb-6">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
            <input
              type="text"
              placeholder="Search courses"
              className="w-full bg-white/60 backdrop-blur-md border border-white/50 rounded-pill py-2.5 pl-10 pr-4 text-sm text-ink placeholder-mute focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors shadow-sm"
            />
          </div>
          <div className="glass-card px-4 py-2 rounded-pill text-xs text-mute flex items-center shadow-sm border-white/50">
            Today, {formatDashboardDate(currentTime)} ·{" "}
            {formatDashboardTime(currentTime)}
          </div>
        </div>

       

        {/* 3 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* CARD 1 */}
          <MagicContainer className="h-full">
            <div
              onClick={() => navigate("/documents")}
              className="group relative h-full rounded-[28px] glass-card border border-white/50 p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-indigo-400/0 group-hover:from-purple-400/10 group-hover:to-indigo-400/10 transition-colors duration-500 pointer-events-none" />
              {/* top */}
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/60 border border-white/40 flex items-center justify-center shadow-sm">
                  <span className="text-indigo-600 font-bold text-lg">DOC</span>
                </div>

                <span className="bg-white/60 text-indigo-700 border border-white/40 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-[0.18em]">
                  DOCUMENT
                </span>
              </div>

              {/* title */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-purple-950 mb-2 tracking-tight">
                  Learning Doc
                </h3>

                <p className="text-sm text-purple-900/60 leading-relaxed">
                  Organize and learn from AI generated documents.
                </p>
              </div>

              {/* stats */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-purple-900/50 mb-3">
                    Participant
                  </p>

                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-400 border-2 border-white" />
                    <div className="w-7 h-7 rounded-full bg-emerald-400 border-2 border-white" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-purple-900/50 mb-3">
                    Progress
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-[3px] border-indigo-500 border-t-transparent animate-spin" />

                    <span className="text-sm font-semibold text-purple-950">
                      80%
                    </span>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="flex items-center justify-between text-xs text-purple-900/60 border-t border-purple-200/50 pt-5">
                <span className="flex items-center gap-1">👤 You</span>

                <span className="flex items-center gap-1">
                  📄 {data?.totalDocuments || 0} Lessons
                </span>
              </div>
            </div>
          </MagicContainer>

          {/* CARD 2 */}
          <MagicContainer className="h-full">
            <div
              onClick={() => navigate("/flashcards")}
              className="group relative h-full rounded-[28px] glass-card border border-white/50 p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-indigo-400/0 group-hover:from-purple-400/10 group-hover:to-indigo-400/10 transition-colors duration-500 pointer-events-none" />
              {/* top */}
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/60 border border-white/40 flex items-center justify-center shadow-sm">
                  <span className="text-pink-600 font-bold text-lg">UX</span>
                </div>

                <span className="bg-white/60 text-pink-700 border border-white/40 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-[0.18em]">
                  FLASHCARD
                </span>
              </div>

              {/* title */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-teal-950 mb-2 tracking-tight">
                  Flashcards
                </h3>

                <p className="text-sm text-teal-900/60 leading-relaxed">
                  Memorize concepts faster using AI generated flashcards.
                </p>
              </div>

              {/* stats */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-teal-900/50 mb-3">
                    Participant
                  </p>

                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-pink-400 border-2 border-white" />
                    <div className="w-7 h-7 rounded-full bg-orange-400 border-2 border-white" />
                    <div className="w-7 h-7 rounded-full bg-yellow-400 border-2 border-white" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-teal-900/50 mb-3">
                    Progress
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-[3px] border-pink-500 border-l-transparent" />

                    <span className="text-sm font-semibold text-teal-950">
                      45%
                    </span>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="flex items-center justify-between text-xs text-teal-900/60 border-t border-teal-200/50 pt-5">
                <span className="flex items-center gap-1">👤 You</span>

                <span className="flex items-center gap-1">
                  📄 {data?.totalFlashcards || 0} Lessons
                </span>
              </div>
            </div>
          </MagicContainer>

          {/* CARD 3 */}
          <MagicContainer className="h-full">
            <div
              onClick={() => navigate("/workspaces")}
              className="group relative h-full rounded-[28px] glass-card border border-white/50 p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-indigo-400/0 group-hover:from-purple-400/10 group-hover:to-indigo-400/10 transition-colors duration-500 pointer-events-none" />
              {/* top */}
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/60 border border-white/40 flex items-center justify-center shadow-sm">
                  <span className="text-emerald-600 font-bold text-lg">AI</span>
                </div>

                <span className="bg-white/60 text-emerald-700 border border-white/40 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-[0.18em]">
                  QUIZ
                </span>
              </div>

              {/* title */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-lime-950 mb-2 tracking-tight">
                  Learn Topic 
                </h3>

                <p className="text-sm text-lime-900/60 leading-relaxed">
                  Test your knowledge with intelligent AI generated quizzes.
                </p>
              </div>

              {/* stats */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-lime-900/50 mb-3">
                    Participant
                  </p>

                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-400 border-2 border-white" />
                    <div className="w-7 h-7 rounded-full bg-cyan-400 border-2 border-white" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-lime-900/50 mb-3">
                    Progress
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-[3px] border-emerald-500 border-b-transparent" />

                    <span className="text-sm font-semibold text-lime-950">
                      20%
                    </span>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="flex items-center justify-between text-xs text-lime-900/60 border-t border-lime-200/50 pt-5">
                <span className="flex items-center gap-1">👤 You</span>

                <span className="flex items-center gap-1">
                  📄 {data?.totalQuizzes || 0} Lessons
                </span>
              </div>
            </div>
          </MagicContainer>
        </div>

        {/* COURSE YOU'RE TAKING */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-ink">Course You're Taking</h2>
            <div className="flex items-center gap-3">
              <button className="glass-card text-sm px-4 py-1.5 rounded-pill flex items-center gap-2 text-ink hover:bg-white/60 transition shadow-none border-white/60">
                Active <ChevronDown className="w-4 h-4" />
              </button>
              <button className="p-2 text-mute hover:text-ink transition">
                <Search className="w-4 h-4" />
              </button>
              <button
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold hover:scale-105 transition-transform"
                onClick={() => navigate("/workspaces")}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* ROW 1 */}
            <div className="glass-card p-4 flex items-center justify-between hover:bg-white/60 transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-primary-container text-ink flex items-center justify-center font-bold text-lg shadow-lg shadow-primary-container/20">
                  AI
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink">
                    Basic Isometric Illustration
                  </h4>
                  <p className="text-xs text-mute flex items-center gap-2 mt-1">
                    Mentor <span className="w-1 h-1 bg-mute rounded-full" /> 🟡
                    Furkom <span className="w-1 h-1 bg-mute rounded-full" /> 24h
                    12m
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-[3px] border-primary border-t-hairline" />
                  <span className="font-bold text-sm text-ink">80%</span>
                </div>
                <div className="flex items-center gap-6 text-mute text-sm">
                  <span className="flex items-center gap-1">👥 1k</span>
                  <span className="flex items-center gap-1">📄 20</span>
                  <span className="flex items-center gap-1">▶ 30</span>
                </div>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="glass-card p-4 flex items-center justify-between hover:bg-white/60 transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-pink-500/20">
                  UI
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink">
                    UI Design Landing Page
                  </h4>
                  <p className="text-xs text-mute flex items-center gap-2 mt-1">
                    Mentor <span className="w-1 h-1 bg-mute rounded-full" /> 🟠
                    Mail <span className="w-1 h-1 bg-mute rounded-full" /> 32h
                    33m
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-[3px] border-pink-400 border-l-hairline border-b-hairline" />
                  <span className="font-bold text-sm text-ink">50%</span>
                </div>
                <div className="flex items-center gap-6 text-mute text-sm">
                  <span className="flex items-center gap-1">👥 2k</span>
                  <span className="flex items-center gap-1">📄 25</span>
                  <span className="flex items-center gap-1">▶ 25</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (PROFILE + CALENDAR + SUBMISSIONS) */}
      <div className="w-80 flex flex-col pl-8 border-l border-white/40 pt-2 overflow-y-auto custom-scrollbar">
        <div className="flex justify-end items-center gap-4 mb-8">
          <div className="relative cursor-pointer">
            <Bell className="w-5 h-5 text-mute hover:text-ink transition" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-400 rounded-full" />
          </div>

          {/* USER DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <img
              src={user?.profileImage || "https://i.pravatar.cc/100"}
              className="w-10 h-10 rounded-full border border-white/50 cursor-pointer hover:border-primary transition"
              alt="profile"
              onClick={() => setMenuOpen(!menuOpen)}
            />
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card rounded-md shadow-xl shadow-black/5 overflow-hidden z-50">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left px-4 py-3 text-sm text-body hover:bg-white/50 hover:text-ink flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOCKUP IMAGE BLOCK */}
        <div className="glass-card rounded-2xl p-3 mb-10 overflow-hidden relative shadow-lg border border-white/50">
          <div className="relative rounded-xl overflow-hidden group">
            <img
              src="/calendar_cats.png"
              className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Dashboard Highlight"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white pointer-events-none">
              <p className="font-bold text-sm bg-white/20 w-max px-3 py-1 rounded-pill mb-1 backdrop-blur-md border border-white/30 text-white">
                Feline Companions
              </p>
              <p className="text-xs font-semibold text-white/90 ml-1">Stay focused!</p>
            </div>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={() => handleCalendarWeekChange(-1)}
              className="text-mute cursor-pointer hover:text-ink transition"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-sm text-ink">
              {formatCalendarMonth(calendarWeekStart)}
            </h3>
            <button
              type="button"
              onClick={() => handleCalendarWeekChange(1)}
              className="text-mute cursor-pointer hover:text-ink transition"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {weekdayLabels.map((day) => (
              <div
                key={day}
                className="text-mute mb-2 font-mono tracking-widest text-[10px]"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((date) => {
              const today = isSameDay(date, currentTime);
              const key = date.toISOString();
              const hasActivity = activityDateKeys.has(getDateKey(date));

              return (
                <div
                  key={key}
                  className={`relative py-1 ${
                    today
                      ? "bg-primary text-on-primary rounded-full w-7 h-7 flex items-center justify-center mx-auto font-bold shadow-lg shadow-primary/30"
                      : "text-body"
                  }`}
                  title={formatDashboardDate(date)}
                >
                  {date.getDate()}
                  {hasActivity && !today && (
                    <span className="absolute left-1/2 -bottom-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div>
          <h3 className="font-bold mb-6 text-ink">Recent Activity</h3>
          <div className="space-y-4">
            {data?.activities?.length > 0 ? (
              data.activities.slice(0, 5).map((activity) => {
                const getIconProps = (type) => {
                  switch (type) {
                    case "upload":
                      return {
                        bg: "bg-primary-container/40 text-primary",
                        label: "DOC",
                      };
                    case "quiz":
                      return {
                        bg: "bg-orange-100 text-orange-600",
                        label: "QZ",
                      };
                    case "flashcard":
                      return {
                        bg: "bg-blue-100 text-blue-600",
                        label: "FC",
                      };
                    case "chat":
                      return {
                        bg: "bg-pink-100 text-pink-600",
                        label: "AI",
                      };
                    default:
                      return { bg: "bg-white/50 text-mute", label: "ACT" };
                  }
                };

                const getNavigatePath = (type) => {
                  switch (type) {
                    case "upload":
                      return "/documents";
                    case "quiz":
                      return "/quizzes";
                    case "flashcard":
                      return "/flashcards";
                    case "chat":
                      return "/documents";
                    default:
                      return "/";
                  }
                };

                const icon = getIconProps(activity.type);

                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${icon.bg}`}
                      >
                        {icon.label}
                      </div>
                      <div>
                        <h4
                          className="font-bold text-sm text-ink line-clamp-1 max-w-[150px]"
                          title={activity.title}
                        >
                          {activity.title}
                        </h4>
                        <p className="text-[10px] text-mute">
                          {activity.type === "quiz" &&
                          activity.score !== undefined
                            ? `Score: ${activity.score}% • `
                            : ""}
                          <span className="text-pink-400">
                            {new Date(activity.createdAt).toLocaleDateString(
                              "en-GB",
                              { day: "2-digit", month: "short" },
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(getNavigatePath(activity.type))}
                      className="text-xs font-bold uppercase tracking-[1.4px] px-4 py-1.5 rounded-pill border border-hairline text-ink hover:border-ink transition-transform hover:scale-105"
                    >
                      View
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-mute text-center">
                No recent activities
              </p>
            )}
          </div>

          <button className="w-full text-center text-xs text-mute mt-6 flex justify-center items-center gap-1 hover:text-ink transition">
            Show All <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
