import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import PageTransition from '../components/PageTransition';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      return setError('Please fill in all fields');
    }
    
    setError('');
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      // Save valid payload from Database Auth endpoint
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0f172a]">
        {/* Animated Background Mesh */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#10b981]/30 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#35A7FF]/20 rounded-full blur-[100px] animate-blob [animation-delay:2000ms]" />
        
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Card className="p-8 pb-10">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#10b981]/20 to-[#35A7FF]/20 rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-lg shadow-[#10b981]/20">
                  <BookOpen size={32} className="text-[#10b981]" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Create Account</h2>
                <p className="text-gray-400 text-sm">Join the library management system</p>
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

              <form onSubmit={handleSignup} className="space-y-4">
                <Input 
                  label="Full Name"
                  type="text" 
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Input 
                  label="Email"
                  type="email" 
                  required
                  placeholder="admin@test.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <Input 
                  label="Password"
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button 
                  type="submit" 
                  variant="primary"
                  className="w-full mt-8 h-12 text-base font-semibold"
                  isLoading={loading}
                >
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-[#10b981] hover:text-[#6ee7b7] font-medium transition-colors">
                  Sign in
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Signup;
