import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary-500 to-fuchsia-500 bg-clip-text text-transparent">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                 <Mail size={18} />
              </div>
              <input type="email" required className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-lg bg-black text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                 <Lock size={18} />
              </div>
              <input type="password" required className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-lg bg-black text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="w-full py-2 px-4 mt-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 transition-colors">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-neutral-400 text-sm">
          Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
