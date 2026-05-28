import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, BookOpen, Clock } from 'lucide-react';

export default function Analytics() {
  // Mock data for analytics
  const userGrowthData = [
    { month: 'Jan', users: 400 },
    { month: 'Feb', users: 800 },
    { month: 'Mar', users: 1500 },
    { month: 'Apr', users: 2400 },
    { month: 'May', users: 3800 },
    { month: 'Jun', users: 5200 },
  ];

  const contentCreationData = [
    { name: 'Documents', count: 1240 },
    { name: 'Quizzes', count: 850 },
    { name: 'Flashcards', count: 1560 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 2100 },
    { month: 'Mar', revenue: 3800 },
    { month: 'Apr', revenue: 5400 },
    { month: 'May', revenue: 8900 },
    { month: 'Jun', revenue: 12400 },
  ];

  const COLORS = ['#6366f1', '#f59e0b', '#ec4899'];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Advanced Analytics</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">Comprehensive overview of platform growth, content, and revenue.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Revenue", value: "$33,800", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Active Users", value: "14.2k", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { title: "Content Generated", value: "3.6k", icon: BookOpen, color: "text-pink-500", bg: "bg-pink-500/10" },
          { title: "Avg Session", value: "24m", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, index) => (
          <div key={index} className="glass rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[var(--text-main)] mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-[var(--text-muted)]">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--text-main)] mb-6">User Growth</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Distribution Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--text-main)] mb-6">Content Distribution</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentCreationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="count"
                  stroke="none"
                >
                  {contentCreationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-[var(--text-main)] mb-6">Revenue Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }} 
                  formatter={(val) => [`$${val}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
