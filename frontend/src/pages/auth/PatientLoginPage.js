import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../config/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const PatientLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, user_role, user_id } = response.data;
      
      if (user_role !== 'patient') {
        toast.error('This account is not registered as a patient.');
        setLoading(false);
        return;
      }
      
      login({ role: user_role, id: user_id }, access_token);
      
      toast.success('Welcome back! 🎉');
      // Navigate to patient dashboard
      navigate('/patient');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-4 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 glass fade-in relative z-10">
        <CardHeader className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white rounded-t-lg p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="text-3xl font-bold text-center mb-2">
              <span className="mr-2 text-4xl">🏥</span>
              Patient Login
              <span className="ml-2 text-4xl">👤</span>
            </CardTitle>
            <p className="text-center text-cyan-50 mt-2 text-lg">Welcome back to healthtime</p>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-12 border-2 border-cyan-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-xl transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-12 border-2 border-cyan-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-xl transition-all"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 hover:from-cyan-600 hover:via-teal-600 hover:to-blue-600 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                '🚀 Sign In'
              )}
            </Button>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register/patient" className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline transition-colors">
                  Register here
                </Link>
              </p>
              
              <div className="flex items-center space-x-4 text-sm">
                <Link to="/login/doctor" className="text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors">
                  Doctor Login
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/login/admin" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                  Admin Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientLoginPage;
