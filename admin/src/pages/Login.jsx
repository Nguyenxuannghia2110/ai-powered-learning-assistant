import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success && res.data.data) {
        const { user, accessToken } = res.data.data;
        
        if (user?.role !== 'admin') {
          toast.error("Access denied. You don't have admin privileges.");
          return;
        }

        localStorage.setItem(
          'userInfo',
          JSON.stringify({
            ...user,
            token: accessToken,
            accessToken,
          }),
        );
        toast.success('Welcome to Lumina Admin!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            L
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Sign in with your administrator credentials
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-[var(--bg-card)] py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-[var(--border-subtle)]">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[var(--primary)] transition-all"
                  placeholder="admin@lumina.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[var(--primary)] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-70 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Sign in to Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
