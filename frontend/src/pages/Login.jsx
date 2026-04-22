import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import PageTransition from '../components/PageTransition';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      // Save valid payload from Database Auth endpoint
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0f172a]">
        {/* Animated Background Mesh */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#35A7FF]/30 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#10b981]/20 rounded-full blur-[100px] animate-blob [animation-delay:2000ms]" />
        
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Card className="p-8 pb-10">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#35A7FF]/20 to-[#10b981]/20 rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-lg shadow-[#35A7FF]/20">
                  <BookOpen size={32} className="text-[#35A7FF]" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Welcome Back</h2>
                <p className="text-gray-400 text-sm">Sign in to manage the library</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 text-center shadow-inner"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <Input 
                  label="Email"
                  type="email" 
                  required
                  placeholder="admin@library.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-300 ml-1">Password</label>
                    <a href="#" className="text-xs text-[#35A7FF] hover:text-[#66beff] transition-colors">Forgot password?</a>
                  </div>
                  <Input 
                    type="password" 
                    required
                    placeholder="password123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="sky"
                  className="w-full mt-8 h-12 text-base font-semibold"
                  isLoading={loading}
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Access restricted to authorized administrators.
                <div className="mt-2">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-[#35A7FF] hover:text-[#66beff] font-medium transition-colors">
                    Register
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
