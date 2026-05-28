import { motion } from 'framer-motion';
import { 
  Users, 
  Cpu, 
  FileText, 
  DollarSign, 
  HelpCircle, 
  Layers, 
  Server, 
  ShieldCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const statCards = [
  { title: 'Total Users', value: '24,592', change: '+12.5%', isUp: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { title: 'AI Requests', value: '1.2M', change: '+24.3%', isUp: true, icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { title: 'Uploaded Docs', value: '8,421', change: '+5.2%', isUp: true, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { title: 'Revenue', value: '$45,231', change: '-2.1%', isUp: false, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { title: 'Quiz Completions', value: '142.3K', change: '+18.2%', isUp: true, icon: HelpCircle, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { title: 'Flashcard Reviews', value: '892.4K', change: '+32.1%', isUp: true, icon: Layers, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { title: 'Server Health', value: '99.9%', change: '+0.1%', isUp: true, icon: Server, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { title: 'Active Subs', value: '3,291', change: '+4.5%', isUp: true, icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
  { name: 'Jul', value: 7000 },
];

const aiUsageData = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 180 },
  { name: 'Wed', value: 150 },
  { name: 'Thu', value: 200 },
  { name: 'Fri', value: 250 },
  { name: 'Sat', value: 210 },
  { name: 'Sun', value: 190 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardOverview() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)]">Overview</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Here's what's happening with your platform today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm rounded-lg px-4 py-2 outline-none focus:border-[var(--primary)] shadow-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
          <button className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors shadow-md">
            Download Report
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {stat.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-[var(--text-main)] mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-sm font-medium text-[var(--text-muted)]">{stat.title}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-[var(--text-main)] mb-6">Revenue Growth</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Usage Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-[var(--text-main)] mb-6">AI API Requests (Daily)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiUsageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'var(--bg-hover)'}}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px', color: 'var(--text-main)' }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
      
    </div>
  );
}
