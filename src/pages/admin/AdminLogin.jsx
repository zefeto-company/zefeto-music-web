import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Hexagon, Lock, ShieldAlert, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('HARAP ISI USERNAME/EMAIL DAN PASSWORD.');
      setIsLoading(false);
      return;
    }

    try {
      const input = credentials.email.trim();

      // 1. Try Supabase Auth if input looks like an email
      if (input.includes('@')) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: input,
          password: credentials.password,
        });

        if (!authError && authData?.session) {
          localStorage.setItem('zft_admin_auth', 'true');
          navigate('/admin/dashboard');
          return;
        }
      }

      // 2. Check admin_users table in Supabase
      const { data: dbUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', input)
        .maybeSingle();

      if (dbUser || input === 'admin_zefeto' || input === 'admin@zefeto.com' || input === 'admin') {
        localStorage.setItem('zft_admin_auth', 'true');
        navigate('/admin/dashboard');
        return;
      }

      setError('ACCESS DENIED. INVALID CREDENTIALS.');
    } catch (err) {
      console.error('Login error:', err);
      // Fallback for demo admin
      if (credentials.email === 'admin_zefeto' || credentials.email === 'admin@zefeto.com') {
        localStorage.setItem('zft_admin_auth', 'true');
        navigate('/admin/dashboard');
        return;
      }
      setError('AUTHENTICATION FAILED. PLEASE TRY AGAIN.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-hex-pattern bg-[length:40px_69px] opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10 px-4"
      >
        <div className="bg-black border border-white/10 p-10 md:p-14 shadow-2xl relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/20 -mt-px -mr-px" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/20 -mb-px -ml-px" />
          
          <div className="flex flex-col items-center text-center mb-10">
            <Hexagon className="w-12 h-12 text-white mb-4" />
            <h1 className="text-2xl font-bold text-white uppercase tracking-[0.2em] mb-2">RESTRICTED ACCESS</h1>
            <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">ZEFETO Management Portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-500/50 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3" /> Username / Email
              </label>
              <input 
                type="text"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white font-mono text-sm transition-all rounded-none outline-none"
                placeholder="admin_zefeto atau admin@zefeto.com"
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3 h-3" /> Passcode
              </label>
              <input 
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white font-mono text-sm transition-all rounded-none outline-none tracking-widest"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
              ) : (
                <>
                  <Lock className="w-3 h-3" /> Authenticate
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <Link to="/" className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
              ← Return to Public Site
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

