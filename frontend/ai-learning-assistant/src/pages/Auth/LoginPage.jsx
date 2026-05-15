import { useState } from "react";
import { Mail, Lock, BrainCircuit, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. login → chỉ để set cookie
      await authService.login(email, password);

      // 2. gọi refresh để lấy accessToken
      const res = await authService.refreshToken();

      const { user, accessToken } = res;

      // 3. set auth
      login(user, accessToken);

      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      const message = err?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black px-4 overflow-hidden">
      {/* Card */}
      <div className="w-full max-w-md bg-[#1a1c20] rounded-lg border border-[#212327] p-8 shadow-none">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full border border-[#212327] bg-[#191919] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-[#7d8187] mt-2 text-sm uppercase tracking-widest font-mono">
            Sign in to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-xs font-mono tracking-widest text-[#7d8187] uppercase mb-2">
              Email
            </label>
            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                  focusedField === "email"
                    ? "text-white"
                    : "text-[#7d8187]"
                }`}
              >
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#212327] rounded-lg text-white placeholder-[#7d8187] focus:ring-0 focus:border-white/50 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono tracking-widest text-[#7d8187] uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                  focusedField === "password"
                    ? "text-white"
                    : "text-[#7d8187]"
                }`}
              >
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#212327] rounded-lg text-white placeholder-[#7d8187] focus:ring-0 focus:border-white/50 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/25 text-white font-normal py-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Signup link */}
        <p className="text-center text-sm text-[#7d8187] mt-8">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-white hover:underline transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
