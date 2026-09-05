import { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import api from '../api';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('login.php', { email, password });
      
      if (response.data.status || response.data.user_id || response.data.message === "Login successful.") {
        localStorage.setItem('isAdmin', 'true');
        setAuth(true);
      } else {
        setError(response.data.message || 'Invalid credentials.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to authenticate. Please check your credentials and internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 p-10 space-y-8 animate-in zoom-in-95 duration-300">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center mb-6">
          <Lock size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-sm">Please sign in to your dashboard</p>
      </div>

      {error && (
        <div className="bg-red-50/50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
              placeholder="admin@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:scale-100 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-900/20 mt-4"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
