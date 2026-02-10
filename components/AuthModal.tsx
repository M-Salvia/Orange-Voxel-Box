
import React, { useState } from 'react';
import { X, Mail, Lock, UserPlus, LogIn, Loader2, User } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'zh' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isZh = language === 'zh';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // 注册时包含用户名到 metadata
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username || email.split('@')[0]
            }
          }
        });
        if (error) throw error;
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md border-4 border-orange-100 overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">
              {isLogin ? (isZh ? '欢迎回来' : 'Welcome Back') : (isZh ? '加入果园' : 'Join Orchard')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative animate-in slide-in-from-top-2 duration-300">
                <User className="absolute left-4 top-4 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder={isZh ? "用户名" : "Username"} 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required={!isLogin}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-400 focus:outline-none font-bold"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-400 focus:outline-none font-bold"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-400 focus:outline-none font-bold"
              />
            </div>

            {error && <p className="text-rose-500 text-xs font-bold px-2">{error}</p>}

            <button 
              disabled={loading}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn size={20}/> : <UserPlus size={20}/>)}
              {isLogin ? (isZh ? '登录' : 'Login') : (isZh ? '注册账号' : 'Sign Up')}
            </button>
          </form>

          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-6 text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors"
          >
            {isLogin ? (isZh ? '还没有账号？去注册' : "No account? Sign up") : (isZh ? '已有账号？去登录' : "Have an account? Login")}
          </button>
        </div>
      </div>
    </div>
  );
};
