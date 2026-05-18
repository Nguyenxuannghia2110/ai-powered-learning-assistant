import { useEffect, useState, useRef } from "react";
import { getDashboardData } from "../../services/progressService";
import SkeletonDashboard from "../../components/dashboard/SkeletonDashboard";
import { Search, Bell, Plus, ChevronDown, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-full h-full bg-transparent text-ink p-8 font-sans flex gap-8">
      
      {/* MAIN CONTENT (LEFT) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
            <input
              type="text"
              placeholder="Search courses"
              className="w-full bg-canvas-mid rounded-pill py-2.5 pl-10 pr-4 text-sm text-ink placeholder-mute focus:outline-none focus:shadow-[inset_0_0_0_1px_#7c7c7c,0_1px_0_#121212] transition-colors"
            />
          </div>
          <div className="bg-canvas-mid px-4 py-2 rounded-pill text-xs text-mute flex items-center">
            Today, 26 July 2023
          </div>
        </div>

        {/* WELCOME */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-1 tracking-tight text-ink">Welcome back,</h1>
          <h1 className="text-4xl font-bold tracking-tight text-primary">{username}! 👋</h1>
        </div>

        {/* 3 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* CARD 1 */}
          <div className="bg-canvas-soft rounded-lg p-6 shadow-[0_8px_8px_rgba(0,0,0,0.3)] hover:bg-canvas-mid transition cursor-pointer" onClick={() => navigate('/documents')}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-md bg-primary-container p-2 shadow-lg shadow-primary-container/20">
                <div className="w-full h-full bg-canvas/30 rounded-sm" />
              </div>
              <span className="bg-primary-container/20 text-primary text-[10px] font-bold px-3 py-1 rounded-pill uppercase tracking-wider">
                DOCUMENT
              </span>
            </div>
            <h3 className="text-xl font-bold mb-6 text-ink">Learning Doc</h3>
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] text-mute font-bold mb-2">PARTICIPANT</p>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-300 border-2 border-canvas-soft" />
                  <div className="w-6 h-6 rounded-full bg-emerald-300 border-2 border-canvas-soft" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-mute font-bold mb-2">PROGRESS</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-[3px] border-primary border-t-hairline" />
                  <span className="font-bold text-sm text-ink">80%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-body font-medium">
              <span className="flex items-center gap-1">👤 You</span>
              <span className="flex items-center gap-1">📄 {data?.totalDocuments || 0} Lessons</span>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-canvas-soft rounded-lg p-6 shadow-[0_8px_8px_rgba(0,0,0,0.3)] hover:bg-canvas-mid transition cursor-pointer" onClick={() => navigate('/flashcards')}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-md bg-blue-500/20 text-blue-400 p-2 shadow-lg shadow-blue-500/20 flex items-center justify-center font-bold">
                UX
              </div>
              <span className="bg-pink-500/20 text-pink-400 text-[10px] font-bold px-3 py-1 rounded-pill uppercase tracking-wider">
                UI/UX
              </span>
            </div>
            <h3 className="text-xl font-bold mb-6 text-ink">Learning Manual</h3>
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] text-mute font-bold mb-2">PARTICIPANT</p>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-pink-300 border-2 border-canvas-soft" />
                  <div className="w-6 h-6 rounded-full bg-orange-300 border-2 border-canvas-soft" />
                  <div className="w-6 h-6 rounded-full bg-yellow-300 border-2 border-canvas-soft" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-mute font-bold mb-2">PROGRESS</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-[3px] border-blue-400 border-l-hairline border-b-hairline" />
                  <span className="font-bold text-sm text-ink">45%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-body font-medium">
              <span className="flex items-center gap-1">👤 You</span>
              <span className="flex items-center gap-1">📄 {data?.totalFlashcards || 0} Lessons</span>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="bg-canvas-soft rounded-lg p-6 shadow-[0_8px_8px_rgba(0,0,0,0.3)] hover:bg-canvas-mid transition cursor-pointer" onClick={() => navigate('/quizzes')}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-md bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shadow-lg shadow-[0_8px_8px_rgba(0,0,0,0.3)]">
                LT
              </div>
              <span className="bg-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-pill uppercase tracking-wider">
                THEORY
              </span>
            </div>
            <h3 className="text-xl font-bold mb-6 text-ink">Learning Topic</h3>
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] text-mute font-bold mb-2">PARTICIPANT</p>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-300 border-2 border-canvas-soft" />
                  <div className="w-6 h-6 rounded-full bg-emerald-300 border-2 border-canvas-soft" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-mute font-bold mb-2">PROGRESS</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-[3px] border-hairline border-t-emerald-400" />
                  <span className="font-bold text-sm text-ink">20%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-body font-medium">
              <span className="flex items-center gap-1">👤 You</span>
              <span className="flex items-center gap-1">📄 {data?.totalQuizzes || 0} Lessons</span>
            </div>
          </div>
        </div>

        {/* COURSE YOU'RE TAKING */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-ink">Course You're Taking</h2>
            <div className="flex items-center gap-3">
              <button className="bg-canvas-mid text-sm px-4 py-1.5 rounded-pill flex items-center gap-2 text-ink hover:bg-canvas-card transition shadow-[0_4px_4px_rgba(0,0,0,0.2)]">
                Active <ChevronDown className="w-4 h-4" />
              </button>
              <button className="p-2 text-mute hover:text-ink transition">
                <Search className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold hover:scale-105 transition-transform" onClick={() => navigate('/workspaces')}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* ROW 1 */}
            <div className="bg-canvas-soft rounded-lg p-4 flex items-center justify-between shadow-[0_4px_4px_rgba(0,0,0,0.2)] hover:bg-canvas-mid transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-primary-container text-ink flex items-center justify-center font-bold text-lg shadow-lg shadow-primary-container/20">
                  AI
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink">Basic Isometric Illustration</h4>
                  <p className="text-xs text-mute flex items-center gap-2 mt-1">
                    Mentor <span className="w-1 h-1 bg-mute rounded-full" /> 🟡 Furkom <span className="w-1 h-1 bg-mute rounded-full" /> 24h 12m
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
            <div className="bg-canvas-soft rounded-lg p-4 flex items-center justify-between shadow-[0_4px_4px_rgba(0,0,0,0.2)] hover:bg-canvas-mid transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-pink-500/20">
                  UI
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink">UI Design Landing Page</h4>
                  <p className="text-xs text-mute flex items-center gap-2 mt-1">
                    Mentor <span className="w-1 h-1 bg-mute rounded-full" /> 🟠 Mail <span className="w-1 h-1 bg-mute rounded-full" /> 32h 33m
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
      <div className="w-80 flex flex-col pl-8 border-l border-canvas-mid pt-2 overflow-y-auto custom-scrollbar">
        <div className="flex justify-end items-center gap-4 mb-8">
          <div className="relative cursor-pointer">
            <Bell className="w-5 h-5 text-mute hover:text-ink transition" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-400 rounded-full" />
          </div>
          
          {/* USER DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <img 
              src={user?.profileImage || "https://i.pravatar.cc/100"} 
              className="w-10 h-10 rounded-full border border-canvas-mid cursor-pointer hover:border-primary transition" 
              alt="profile" 
              onClick={() => setMenuOpen(!menuOpen)}
            />
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-canvas-mid rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-3 text-sm text-body hover:bg-canvas-soft hover:text-ink flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button onClick={logout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOCKUP IMAGE BLOCK */}
        <div className="bg-primary-container rounded-lg p-4 mb-10 overflow-hidden relative shadow-lg shadow-primary-container/20">
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-32 object-cover rounded-sm mb-4 opacity-80 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container to-transparent" />
          <div className="relative z-10 text-ink">
            <p className="font-bold text-sm bg-canvas/50 w-max px-2 py-0.5 rounded-pill mb-1 backdrop-blur-md">UI Design Landing Page</p>
            <p className="text-xs font-semibold text-ink/80">80% Progress</p>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <ChevronLeft className="w-4 h-4 text-mute cursor-pointer hover:text-ink transition" />
            <h3 className="font-bold text-sm text-ink">July 2023</h3>
            <ChevronRight className="w-4 h-4 text-mute cursor-pointer hover:text-ink transition" />
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            <div className="text-mute mb-2 font-mono tracking-widest text-[10px]">MON</div>
            <div className="text-mute mb-2 font-mono tracking-widest text-[10px]">TUE</div>
            <div className="text-mute mb-2 font-mono tracking-widest text-[10px]">WED</div>
            <div className="text-mute mb-2 font-mono tracking-widest text-[10px]">THU</div>
            <div className="text-mute mb-2 font-mono tracking-widest text-[10px]">FRI</div>
            <div className="text-mute mb-2 font-mono tracking-widest text-[10px]">SAT</div>
            <div className="text-mute mb-2 font-mono tracking-widest text-[10px]">SUN</div>

            <div className="text-body py-1">24</div>
            <div className="text-body py-1">25</div>
            <div className="bg-primary text-on-primary rounded-full w-7 h-7 flex items-center justify-center mx-auto font-bold shadow-lg shadow-primary/30">26</div>
            <div className="text-body py-1">27</div>
            <div className="text-body py-1">28</div>
            <div className="text-body py-1">29</div>
            <div className="text-body py-1">30</div>
          </div>
        </div>

        {/* UPCOMING SUBMISSION */}
        <div>
          <h3 className="font-bold mb-6 text-ink">Upcoming Submission</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                  UX
                </div>
                <div>
                  <h4 className="font-bold text-sm text-ink">Wireframe UI/U...</h4>
                  <p className="text-[10px] text-mute">UI/UX Design • <span className="text-pink-400">27 Jul</span></p>
                </div>
              </div>
              <button className="text-xs font-bold uppercase tracking-[1.4px] px-4 py-1.5 rounded-pill border border-hairline text-ink hover:border-ink transition-transform hover:scale-105">
                Submit
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold text-sm">
                  AI
                </div>
                <div>
                  <h4 className="font-bold text-sm text-ink">Basic Isometric...</h4>
                  <p className="text-[10px] text-mute">Illustration • <span className="text-pink-400">29 Jul</span></p>
                </div>
              </div>
              <button className="text-xs font-bold uppercase tracking-[1.4px] px-4 py-1.5 rounded-pill border border-hairline text-ink hover:border-ink transition-transform hover:scale-105">
                Submit
              </button>
            </div>
          </div>
          
          <button className="w-full text-center text-xs text-mute mt-6 flex justify-center items-center gap-1 hover:text-ink transition">
            Show All <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
