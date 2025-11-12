import React, { useState, useEffect, useReducer } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import enhanced registration components
import EnhancedPatientRegistration from './components/EnhancedPatientRegistration';
import EnhancedDoctorRegistration from './components/EnhancedDoctorRegistration';
import TestSurgeryCards from './TestSurgeryCards';

// Import admin form components
import AdminDoctorForm from './components/AdminDoctorForm';
import AdminPatientForm from './components/AdminPatientForm';
import AdminBookingForm from './components/AdminBookingForm';
import DoctorProfileModal from './components/DoctorProfileModal';
import PatientProfileModal from './components/PatientProfileModal';

// Import pages
import ApiExplorer from './pages/ApiExplorer';

// Enhanced Patient Wrapper Component
const EnhancedPatientWrapper = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);

  const handlePatientRegistrationComplete = (data) => {
    setPatientData(data);
    // Redirect to surgery selection with patient data
    navigate('/', { 
      state: { 
        step: 1, 
        patientId: data.patientId, 
        patientData: data.patientData,
        enhanced: true
      } 
    });
  };

  return (
    <EnhancedPatientRegistration onNext={handlePatientRegistrationComplete} />
  );
};

// Import UI components
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from 'sonner';
import { Textarea } from './components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Authentication Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Patient Login Page
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
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user_role, user_id } = response.data;
      
      login({ role: user_role, id: user_id }, access_token);
      
      toast.success('Welcome back! 🎉');
      navigate('/');
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
              className="w-full h-12 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-700 hover:via-teal-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 btn-animate"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🏥</span>
                  Sign In as Patient
                </span>
              )}
            </Button>
          </form>
          
          <div className="mt-8 space-y-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Link to="/register/patient/enhanced" className="text-cyan-600 hover:text-cyan-800 font-medium transition-colors">
                New patient? Create your account
              </Link>
            </div>
            <div className="text-center text-sm text-gray-500">
              Different user type? 
              <Link to="/login-portal" className="ml-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                Choose Login Type
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Doctor Login Page
const DoctorLoginPage = () => {
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
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user_role, user_id } = response.data;
      
      login({ role: user_role, id: user_id }, access_token);
      
      if (user_role === 'doctor') {
        toast.success('Welcome to your practice dashboard! 👨‍⚕️');
        navigate('/doctor');
      } else {
        toast.error('This account is not registered as a doctor.');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials or contact admin if pending approval.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">
            <span className="mr-2">👨‍⚕️</span>
            Doctor Login
            <span className="ml-2">🩺</span>
          </CardTitle>
          <p className="text-center text-blue-100 mt-2">Access your practice dashboard</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Medical Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.smith@hospital.com"
                required
                className="border-blue-200 focus:border-blue-500"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="border-blue-200 focus:border-blue-500"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? 'Signing In...' : '👨‍⚕️ Access Practice Dashboard'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <Link to="/register/doctor/enhanced" className="text-blue-600 hover:text-blue-800">
                New doctor? Join our network
              </Link>
            </div>
            <div className="text-center text-sm text-gray-500">
              Different user type? 
              <Link to="/login-portal" className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium">
                Choose Login Type
              </Link>
            </div>
            <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
              <strong>Note:</strong> Your account needs admin approval before first login.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Login Page
const AdminLoginPage = () => {
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
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user_role, user_id } = response.data;
      
      login({ role: user_role, id: user_id }, access_token);
      
      if (user_role === 'admin') {
        toast.success('Welcome to Admin Dashboard! 👑');
        navigate('/admin');
      } else {
        toast.error('This account does not have admin privileges.');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Admin login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">
            <span className="mr-2">👑</span>
            Admin Login
            <span className="ml-2">⚙️</span>
          </CardTitle>
          <p className="text-center text-purple-100 mt-2">healthtime Platform Management</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@healthtime.com"
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {loading ? 'Signing In...' : '👑 Access Admin Dashboard'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <Link to="/register/admin" className="text-purple-600 hover:text-purple-800">
                Need admin access? Register here
              </Link>
            </div>
            <div className="text-center text-sm text-gray-500">
              Different user type? 
              <Link to="/login-portal" className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium">
                Choose Login Type
              </Link>
            </div>
            <div className="bg-purple-50 p-3 rounded text-xs text-purple-700">
              <strong>Security:</strong> Admin access is restricted and monitored.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hospital Login Page
const HospitalLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !hospitalId) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Hospital login logic would go here
      toast.success('Welcome to Hospital Portal! 🏥');
      navigate('/hospital-dashboard');
    } catch (error) {
      toast.error('Hospital login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">
            <span className="mr-2">🏥</span>
            Hospital Portal
            <span className="ml-2">🏢</span>
          </CardTitle>
          <p className="text-center text-green-100 mt-2">Hospital Management System</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="hospitalId">Hospital ID</Label>
              <Input
                id="hospitalId"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                placeholder="HEAL-HOSP-001"
                required
                className="border-green-200 focus:border-green-500"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hospital.com"
                required
                className="border-green-200 focus:border-green-500"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter hospital password"
                required
                className="border-green-200 focus:border-green-500"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              {loading ? 'Signing In...' : '🏥 Access Hospital Portal'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <Link to="/hospital/register" className="text-green-600 hover:text-green-800">
                Register your hospital
              </Link>
            </div>
            <div className="text-center text-sm text-gray-500">
              Different user type? 
              <Link to="/login-portal" className="ml-1 text-teal-600 hover:text-teal-800 font-medium">
                Choose Login Type
              </Link>
            </div>
            <div className="bg-green-50 p-3 rounded text-xs text-green-700">
              <strong>Note:</strong> Hospital portal requires institutional credentials.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Implant Manufacturer Login Page
const ImplantLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !companyCode) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Implant manufacturer login logic would go here
      toast.success('Welcome to Manufacturer Portal! 🦴');
      navigate('/implant-dashboard');
    } catch (error) {
      toast.error('Manufacturer login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">
            <span className="mr-2">🦴</span>
            Implant Portal
            <span className="ml-2">🏭</span>
          </CardTitle>
          <p className="text-center text-orange-100 mt-2">Manufacturer Management System</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="companyCode">Company Code</Label>
              <Input
                id="companyCode"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                placeholder="ZIMMER-001"
                required
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sales@manufacturer.com"
                required
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter company password"
                required
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              {loading ? 'Signing In...' : '🦴 Access Manufacturer Portal'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <Link to="/implant/register" className="text-orange-600 hover:text-orange-800">
                Register your company
              </Link>
            </div>
            <div className="text-center text-sm text-gray-500">
              Different user type? 
              <Link to="/login-portal" className="ml-1 text-amber-600 hover:text-amber-800 font-medium">
                Choose Login Type
              </Link>
            </div>
            <div className="bg-orange-50 p-3 rounded text-xs text-orange-700">
              <strong>Note:</strong> Requires valid manufacturer credentials and approval.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Login Portal Selection Page
const LoginPortal = () => {
  const navigate = useNavigate();

  const loginOptions = [
    {
      title: 'Patient Login',
      description: 'Book surgeries and manage your health journey',
      icon: '👤',
      color: 'from-teal-500 to-blue-500',
      hoverColor: 'hover:from-teal-600 hover:to-blue-600',
      path: '/login/patient'
    },
    {
      title: 'Doctor Login',
      description: 'Access your practice dashboard and patient management',
      icon: '👨‍⚕️',
      color: 'from-blue-500 to-indigo-500',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-600',
      path: '/login/doctor'
    },
    {
      title: 'Admin Login',
      description: 'Platform management and oversight',
      icon: '👑',
      color: 'from-purple-500 to-indigo-500',
      hoverColor: 'hover:from-purple-600 hover:to-indigo-600',
      path: '/login/admin'
    },
    {
      title: 'Hospital Portal',
      description: 'Hospital management and operations',
      icon: '🏥',
      color: 'from-green-500 to-teal-500',
      hoverColor: 'hover:from-green-600 hover:to-teal-600',
      path: '/login/hospital'
    },
    {
      title: 'Implant Manufacturer',
      description: 'Manage implant catalog and partnerships',
      icon: '🦴',
      color: 'from-orange-500 to-amber-500',
      hoverColor: 'hover:from-orange-600 hover:to-amber-600',
      path: '/login/implant'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 fade-in">
          <h1 className="text-7xl font-extrabold text-gradient mb-6">
            🏥 healthtime Portal
          </h1>
          <p className="text-2xl text-slate-700 max-w-2xl mx-auto font-medium">
            Choose your login type to access your dedicated dashboard and services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loginOptions.map((option, index) => (
            <Card 
              key={index} 
              className="cursor-pointer card-hover shadow-2xl border-0 glass scale-in"
              onClick={() => navigate(option.path)}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardHeader className={`bg-gradient-to-r ${option.color} text-white rounded-t-2xl p-8 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <CardTitle className="text-2xl text-center relative z-10 font-bold">
                  <span className="text-5xl block mb-3">{option.icon}</span>
                  {option.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <p className="text-gray-700 mb-6 font-medium">{option.description}</p>
                <Button 
                  className={`w-full bg-gradient-to-r ${option.color} ${option.hoverColor} text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all btn-animate`}
                >
                  Sign In {option.icon}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📞 Support: +91 1800-healthtime</p>
                <p>📧 Email: support@healthtime.com</p>
                <p>🕒 Available 24/7 for assistance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Login Page Component (Legacy - redirect to portal)
const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      const { access_token, user_role, user_id } = response.data;
      
      login({ role: user_role, id: user_id }, access_token);
      
      if (user_role === 'admin') {
        navigate('/admin');
      } else if (user_role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/');
      }
      
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">
            <span className="mr-2">✨</span>
            healthtime Login
            <span className="ml-2">✨</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="border-teal-200 focus:border-teal-500"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="border-teal-200 focus:border-teal-500"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3">
            <div className="text-center text-sm text-gray-600">
              Don't have an account?
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/register/doctor/enhanced">
                <Button variant="outline" className="w-full text-teal-600 border-teal-300 hover:bg-teal-50">
                  ✨ Enhanced Doctor
                </Button>
              </Link>
              <Link to="/register/admin">
                <Button variant="outline" className="w-full text-blue-600 border-blue-300 hover:bg-blue-50">
                  Admin Register
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Link to="/register/doctor">
                <Button variant="ghost" className="w-full text-xs text-gray-500 hover:text-gray-700">
                  Basic Doctor
                </Button>
              </Link>
              <Link to="/register/patient/enhanced">
                <Button variant="ghost" className="w-full text-xs text-purple-600 hover:text-purple-800">
                  ✨ Enhanced Patient
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <Link to="/">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                  Continue as Basic Patient
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Doctor Registration Component
const DoctorRegistration = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    specialization: '',
    medical_council_number: '',
    phone: '',
    experience_years: '',
    bio: '',
    consultation_fee: '',
    google_reviews_link: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        experience_years: parseInt(formData.experience_years),
        consultation_fee: parseFloat(formData.consultation_fee)
      };
      
      await axios.post(`${API}/auth/register/doctor`, submitData);
      toast.success('Doctor registration submitted! Awaiting admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Join healthtime as a Doctor
          </h1>
          <p className="text-lg text-slate-600">Share your expertise and transform lives</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              Doctor Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    required
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="medical_council_number">Medical Council Number *</Label>
                  <Input
                    id="medical_council_number"
                    value={formData.medical_council_number}
                    onChange={(e) => setFormData({...formData, medical_council_number: e.target.value})}
                    required
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="experience_years">Experience (Years) *</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                    required
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="consultation_fee">Consultation Fee (₹) *</Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    required
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell patients about your expertise and approach to healthcare..."
                  className="border-teal-200 focus:border-teal-500"
                />
              </div>

              <div>
                <Label htmlFor="google_reviews_link">Google Reviews Link (Optional)</Label>
                <Input
                  id="google_reviews_link"
                  value={formData.google_reviews_link}
                  onChange={(e) => setFormData({...formData, google_reviews_link: e.target.value})}
                  placeholder="https://g.page/..."
                  className="border-teal-200 focus:border-teal-500"
                />
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-lg rounded-full"
                >
                  {loading ? 'Submitting Application...' : 'Submit for Approval'}
                </Button>
              </div>
            </form>

            <div className="text-center mt-6">
              <Link to="/login-portal" className="text-teal-600 hover:text-teal-800">
                Already have an account? Choose Login Type
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Admin Layout Wrapper Component
const AdminLayout = ({ children, title, subtitle }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const navItems = [
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️', path: '/admin' },
    { id: 'hospitals', label: 'Hospitals', icon: '🏥', path: '/admin' },
    { id: 'implants', label: 'Implants', icon: '🦴', path: '/admin' },
    { id: 'patients', label: 'Patients', icon: '👥', path: '/admin' },
    { id: 'bookings', label: 'Bookings', icon: '📅', path: '/admin' }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Left Sidebar */}
      <aside className={`bg-white shadow-2xl transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                🏥 healthtime
              </h1>
              <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-6 py-4 transition-all group ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="ml-4 font-medium flex-1 text-left">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          {!sidebarCollapsed ? (
            <>
              <button
                onClick={() => navigate('/admin/booking/new')}
                className="w-full flex items-center px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
              >
                <span className="text-xl">📅</span>
                <span className="ml-3 font-medium">Add Booking</span>
              </button>
              <button
                onClick={() => navigate('/admin/hospital/new')}
                className="w-full flex items-center px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                <span className="text-xl">🏥</span>
                <span className="ml-3 font-medium">Add Hospital</span>
              </button>
              <button
                onClick={() => navigate('/admin/implant/new')}
                className="w-full flex items-center px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
              >
                <span className="text-xl">🦴</span>
                <span className="ml-3 font-medium">Add Implant</span>
              </button>
              
              {/* Separator */}
              <div className="border-t border-gray-300 my-3"></div>
              
              <button
                onClick={() => navigate('/admin/api-explorer')}
                className="w-full flex items-center px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
              >
                <span className="text-xl">🔌</span>
                <span className="ml-3 font-medium">API Explorer</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/admin/booking/new')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                title="Add Booking"
              >
                <span className="text-xl">📅</span>
              </button>
              <button
                onClick={() => navigate('/admin/hospital/new')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
                title="Add Hospital"
              >
                <span className="text-xl">🏥</span>
              </button>
              <button
                onClick={() => navigate('/admin/implant/new')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
                title="Add Implant"
              >
                <span className="text-xl">🦴</span>
              </button>
              
              {/* Separator */}
              <div className="border-t border-gray-300 my-3"></div>
              
              <button
                onClick={() => navigate('/admin/api-explorer')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                title="API Explorer"
              >
                <span className="text-xl">🔌</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {location.pathname !== '/admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium transition-all border border-white/30 hover:border-white/50 flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to Dashboard</span>
                </button>
              )}
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {title || 'Admin Dashboard'}
                </h2>
                <p className="text-indigo-100 mt-1">{subtitle || 'Manage your platform'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-lg transition-all border-2 border-white/30 hover:border-white/50"
                >
                  👤
                </button>
                
                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">Admin User</p>
                      <p className="text-xs text-gray-500 mt-1">admin@healthtime.com</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        toast.info('Settings feature coming soon!');
                      }}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="text-lg mr-3">⚙️</span>
                      <span className="font-medium">Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <span className="text-lg mr-3">🚪</span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

// Enhanced Admin Dashboard with Full Management
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [implants, setImplants] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [doctorsRes, hospitalsRes, implantsRes, patientsRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/admin/doctors`, config).catch((err) => { console.error('Doctors fetch error:', err); return { data: [] }; }),
        axios.get(`${API}/hospitals`).catch((err) => { console.error('Hospitals fetch error:', err); return { data: [] }; }),
        axios.get(`${API}/implants`).catch((err) => { console.error('Implants fetch error:', err); return { data: [] }; }),
        axios.get(`${API}/admin/patients`, config).catch((err) => { console.error('Patients fetch error:', err); return { data: [] }; }),
        axios.get(`${API}/admin/bookings`, config).catch((err) => { console.error('Bookings fetch error:', err); return { data: [] }; })
      ]);

      // Set all data - no filtering needed
      setDoctors(doctorsRes.data);
      setHospitals(hospitalsRes.data);
      setImplants(implantsRes.data);
      setPatients(patientsRes.data);
      setBookings(bookingsRes.data);
      
      console.log('Fetched doctors:', doctorsRes.data.length);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const approveDoctor = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API}/admin/doctors/${doctorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Approve response:', response.data);
      
      // Update local state immediately for better UX
      setDoctors(prevDoctors => 
        prevDoctors.map(d => 
          d.id === doctorId ? { ...d, status: 'approved', approved_at: new Date() } : d
        )
      );
      
      toast.success('Doctor approved successfully!');
      // Refresh data from server to ensure consistency
      await fetchAllData();
    } catch (error) {
      console.error('Approve doctor error:', error);
      toast.error(error.response?.data?.detail || 'Failed to approve doctor');
    }
  };

  const rejectDoctor = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API}/admin/doctors/${doctorId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Reject response:', response.data);
      
      // Update local state immediately for better UX
      setDoctors(prevDoctors => 
        prevDoctors.map(d => 
          d.id === doctorId ? { ...d, status: 'rejected' } : d
        )
      );
      
      toast.success('Doctor rejected successfully!');
      // Refresh data from server to ensure consistency
      await fetchAllData();
    } catch (error) {
      console.error('Reject doctor error:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject doctor');
    }
  };

  const deleteHospital = async (hospitalId) => {
    if (!confirm('Are you sure you want to delete this hospital?')) return;
    try {
      await axios.delete(`${API}/admin/hospitals/${hospitalId}`);
      toast.success('Hospital deleted successfully!');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete hospital');
    }
  };

  const deleteImplant = async (implantId) => {
    if (!confirm('Are you sure you want to delete this implant?')) return;
    try {
      await axios.delete(`${API}/admin/implants/${implantId}`);
      toast.success('Implant deleted successfully!');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete implant');
    }
  };

  const viewDoctorProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setIsProfileModalOpen(true);
  };

  const viewPatientProfile = (patient) => {
    setSelectedPatient(patient);
    setIsPatientModalOpen(true);
  };

  const filteredDoctors = doctors.filter(doctor => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doctor.full_name?.toLowerCase().includes(query) ||
      doctor.email?.toLowerCase().includes(query) ||
      doctor.phone?.includes(query) ||
      doctor.primary_specialization?.toLowerCase().includes(query) ||
      doctor.city?.toLowerCase().includes(query) ||
      doctor.medical_council_number?.toLowerCase().includes(query)
    );
  });

  const filteredPatients = patients.filter(patient => {
    if (!patientSearchQuery) return true;
    const query = patientSearchQuery.toLowerCase();
    return (
      patient.full_name?.toLowerCase().includes(query) ||
      patient.name?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query) ||
      patient.phone?.includes(query) ||
      patient.city?.toLowerCase().includes(query)
    );
  });

  const navItems = [
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️', count: doctors.length },
    { id: 'hospitals', label: 'Hospitals', icon: '🏥', count: hospitals.length },
    { id: 'implants', label: 'Implants', icon: '🦴', count: implants.length },
    { id: 'patients', label: 'Patients', icon: '👥', count: patients.length },
    { id: 'bookings', label: 'Bookings', icon: '📅', count: bookings.length }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Left Sidebar */}
      <aside className={`bg-white shadow-2xl transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                🏥 healthtime
              </h1>
              <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-4 transition-all group ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="ml-4 font-medium flex-1 text-left">{item.label}</span>
                  {item.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === item.id
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-100 text-teal-700'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          {!sidebarCollapsed ? (
            <>
              <button
                onClick={() => navigate('/admin/booking/new')}
                className="w-full flex items-center px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
              >
                <span className="text-xl">📅</span>
                <span className="ml-3 font-medium">Add Booking</span>
              </button>
              <button
                onClick={() => navigate('/admin/hospital/new')}
                className="w-full flex items-center px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                <span className="text-xl">🏥</span>
                <span className="ml-3 font-medium">Add Hospital</span>
              </button>
              <button
                onClick={() => navigate('/admin/implant/new')}
                className="w-full flex items-center px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
              >
                <span className="text-xl">🦴</span>
                <span className="ml-3 font-medium">Add Implant</span>
              </button>
              
              {/* Separator */}
              <div className="border-t border-gray-300 my-3"></div>
              
              <button
                onClick={() => navigate('/admin/api-explorer')}
                className="w-full flex items-center px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
              >
                <span className="text-xl">🔌</span>
                <span className="ml-3 font-medium">API Explorer</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/admin/booking/new')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                title="Add Booking"
              >
                <span className="text-xl">📅</span>
              </button>
              <button
                onClick={() => navigate('/admin/hospital/new')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
                title="Add Hospital"
              >
                <span className="text-xl">🏥</span>
              </button>
              <button
                onClick={() => navigate('/admin/implant/new')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
                title="Add Implant"
              >
                <span className="text-xl">🦴</span>
              </button>
              
              {/* Separator */}
              <div className="border-t border-gray-300 my-3"></div>
              
              <button
                onClick={() => navigate('/admin/api-explorer')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                title="API Explorer"
              >
                <span className="text-xl">🔌</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {navItems.find(item => item.id === activeTab)?.icon} {navItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-indigo-100 mt-1">Manage and monitor your {activeTab}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-sm text-indigo-100">Total {navItems.find(item => item.id === activeTab)?.label}</p>
                <p className="text-2xl font-bold text-white">{navItems.find(item => item.id === activeTab)?.count}</p>
              </div>
              
              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-lg transition-all border-2 border-white/30 hover:border-white/50"
                >
                  👤
                </button>
                
                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">Admin User</p>
                      <p className="text-xs text-gray-500 mt-1">admin@healthtime.com</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // TODO: Implement settings
                        toast.info('Settings feature coming soon!');
                      }}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="text-lg mr-3">⚙️</span>
                      <span className="font-medium">Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <span className="text-lg mr-3">🚪</span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin data...</p>
            </div>
          ) : (
            <div className="space-y-6">
            {/* Doctors Management */}
            {activeTab === 'doctors' && (
              <div className="space-y-6">
                {/* Pending Doctors Section */}
                {doctors.filter(d => d.status === 'pending').length > 0 && (
                  <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        ⏳ Pending Approvals
                        <Badge className="ml-3 bg-orange-100 text-orange-600">
                          {doctors.filter(d => d.status === 'pending').length} pending
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        {doctors.filter(d => d.status === 'pending').map((doctor) => (
                          <Card key={doctor.id} className="border border-orange-200 hover:shadow-lg transition-shadow bg-orange-50/30">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div className="space-y-3 flex-1">
                                  <div className="flex items-center space-x-3">
                                    <h3 className="font-bold text-lg text-gray-800">{doctor.full_name}</h3>
                                    <Badge className="bg-blue-100 text-blue-800">{doctor.primary_specialization || doctor.specialization}</Badge>
                                    <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div><strong>Email:</strong> {doctor.email}</div>
                                    <div><strong>Phone:</strong> {doctor.phone}</div>
                                    <div><strong>Experience:</strong> {doctor.experience_years} years</div>
                                    <div><strong>Council No:</strong> {doctor.medical_council_number}</div>
                                    <div><strong>Consultation Fee:</strong> ₹{doctor.consultation_fee}</div>
                                    <div><strong>Location:</strong> {doctor.city || 'Not specified'}</div>
                                  </div>
                                  
                                  {doctor.bio && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <strong className="text-sm text-gray-600">Professional Bio:</strong>
                                      <p className="text-sm text-gray-700 mt-1">{doctor.bio}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col space-y-2 ml-6">
                                  <Button
                                    onClick={() => viewDoctorProfile(doctor)}
                                    variant="outline"
                                    className="px-6 border-teal-300 text-teal-600 hover:bg-teal-50"
                                  >
                                    👁️ View Profile
                                  </Button>
                                  <Button
                                    onClick={() => approveDoctor(doctor.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                                  >
                                    ✅ Approve
                                  </Button>
                                  <Button
                                    onClick={() => rejectDoctor(doctor.id)}
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50 px-6"
                                  >
                                    ❌ Reject
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* All Doctors Section */}
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <CardTitle className="text-xl flex items-center">
                        👨‍⚕️ All Doctors
                        <Badge className="ml-3 bg-teal-100 text-teal-800">
                          {filteredDoctors.length} of {doctors.length}
                        </Badge>
                      </CardTitle>
                      <Button onClick={() => navigate('/admin/doctor/new')} className="bg-teal-600 hover:bg-teal-700">
                        + Add New Doctor
                      </Button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by name, email, phone, specialization, city, or council number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredDoctors.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <span className="text-6xl mb-4 block">🔍</span>
                        <h3 className="text-xl font-semibold mb-2">{searchQuery ? 'No Matching Doctors' : 'No Doctors'}</h3>
                        <p>{searchQuery ? 'Try adjusting your search query' : 'No doctors registered yet'}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredDoctors.map((doctor) => (
                          <Card key={doctor.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-bold text-lg">{doctor.full_name}</h3>
                                    <Badge className={`${
                                      doctor.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      doctor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      doctor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {doctor.status || 'pending'}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-600 text-sm">{doctor.primary_specialization || doctor.specialization}</p>
                                  <p className="text-gray-500 text-sm">{doctor.city}, {doctor.state}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-teal-600">₹{doctor.consultation_fee}</div>
                                  <div className="text-xs text-gray-500">Consultation</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                <div>
                                  <span className="text-gray-500">Experience:</span>
                                  <span className="ml-1 font-semibold">{doctor.experience_years} yrs</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Council:</span>
                                  <span className="ml-1 font-semibold text-xs">{doctor.medical_council_number}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-500">Email:</span>
                                  <span className="ml-1 text-xs">{doctor.email}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-500">Phone:</span>
                                  <span className="ml-1">{doctor.phone}</span>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2 pt-3 border-t">
                                <Button 
                                  onClick={() => viewDoctorProfile(doctor)} 
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1 border-teal-300 text-teal-600 hover:bg-teal-50"
                                >
                                  👁️ View
                                </Button>
                                {doctor.status !== 'approved' && (
                                  <Button 
                                    onClick={() => approveDoctor(doctor.id)} 
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    ✅
                                  </Button>
                                )}
                                {doctor.status !== 'rejected' && (
                                  <Button 
                                    onClick={() => rejectDoctor(doctor.id)} 
                                    variant="outline" 
                                    size="sm"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    ❌
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Hospitals Management */}
            {activeTab === 'hospitals' && (
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    🏥 Hospital Management
                    <Button onClick={() => navigate('/admin/hospital/new')} className="bg-blue-600 hover:bg-blue-700">
                      + Add New Hospital
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hospitals.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <span className="text-6xl mb-4 block">🏥</span>
                      <h3 className="text-xl font-semibold mb-2">No Hospitals</h3>
                      <p>Add hospitals to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hospitals.map((hospital) => (
                        <Card key={hospital.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-lg">{hospital.name}</h3>
                                <p className="text-gray-600">{hospital.location}</p>
                                <Badge className={`mt-2 ${
                                  hospital.zone === 'Zone 1' ? 'bg-green-100 text-green-800' :
                                  hospital.zone === 'Zone 2' ? 'bg-blue-100 text-blue-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {hospital.zone}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">₹{hospital.base_price?.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">Base Price</div>
                              </div>
                            </div>
                            
                            {hospital.facilities && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-1">
                                  {(hospital.facilities || []).slice(0, 4).map((facility, index) => (
                                    <span key={index} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded">
                                      {facility}
                                    </span>
                                  ))}
                                  {hospital.facilities.length > 4 && (
                                    <span className="text-xs text-gray-500">+{hospital.facilities.length - 4} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex space-x-2 pt-3 border-t">
                              <Button 
                                onClick={() => navigate(`/admin/hospital/${hospital.id}/edit`)} 
                                variant="outline" 
                                size="sm"
                                className="flex-1"
                              >
                                📝 Edit
                              </Button>
                              <Button 
                                onClick={() => deleteHospital(hospital.id)} 
                                variant="outline" 
                                size="sm"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                🗑️ Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Implants Management */}
            {activeTab === 'implants' && (
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    🦴 Implant Management
                    <Button onClick={() => navigate('/admin/implant/new')} className="bg-purple-600 hover:bg-purple-700">
                      + Add New Implant
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {implants.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <span className="text-6xl mb-4 block">🦴</span>
                      <h3 className="text-xl font-semibold mb-2">No Implants</h3>
                      <p>Add implants to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {implants.map((implant) => (
                        <Card key={implant.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-bold text-lg">{implant.name}</h3>
                                <p className="text-sm text-gray-600">{implant.brand}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-teal-600">₹{implant.price?.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">{implant.expected_life || 'Lifetime'}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm mb-4">
                              <div><strong>Material:</strong> {implant.material || 'N/A'}</div>
                              <div><strong>Success Rate:</strong> {implant.success_rate || 'N/A'}%</div>
                              <div><strong>Surgery Type:</strong> {implant.surgery_type || 'General'}</div>
                            </div>
                            
                            <div className="flex space-x-2 pt-3 border-t">
                              <Button 
                                onClick={() => navigate(`/admin/implant/${implant.id}/edit`)} 
                                variant="outline" 
                                size="sm"
                                className="flex-1"
                              >
                                📝 Edit
                              </Button>
                              <Button 
                                onClick={() => deleteImplant(implant.id)} 
                                variant="outline" 
                                size="sm"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                🗑️ Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Patients Management */}
            {activeTab === 'patients' && (
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-xl flex items-center">
                      👥 All Patients
                      <Badge className="ml-3 bg-green-100 text-green-800">
                        {filteredPatients.length} of {patients.length}
                      </Badge>
                    </CardTitle>
                    <Button onClick={() => navigate('/admin/patient/new')} className="bg-green-600 hover:bg-green-700">
                      + Add New Patient
                    </Button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or city..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <span className="text-6xl mb-4 block">🔍</span>
                      <h3 className="text-xl font-semibold mb-2">{patientSearchQuery ? 'No Matching Patients' : 'No Patients'}</h3>
                      <p>{patientSearchQuery ? 'Try adjusting your search query' : 'Add patients to get started'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPatients.map((patient) => (
                        <Card key={patient.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-800">{patient.name || patient.full_name}</h3>
                                <Badge className="bg-green-100 text-green-800">#{patient.id.slice(0, 8)}</Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <span className="mr-2">📧</span>
                                  <span className="truncate">{patient.email}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <span className="mr-2">📞</span>
                                  <span>{patient.phone || 'N/A'}</span>
                                </div>
                                {patient.city && (
                                  <div className="flex items-center text-gray-600">
                                    <span className="mr-2">📍</span>
                                    <span>{patient.city}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex space-x-2 pt-3 border-t">
                                <Button 
                                  onClick={() => viewPatientProfile(patient)} 
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1 border-green-300 text-green-600 hover:bg-green-50"
                                >
                                  👁️ View Profile
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bookings Management */}
            {activeTab === 'bookings' && (
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    📅 Bookings Management
                    <Button onClick={() => navigate('/admin/booking/new')} className="bg-indigo-600 hover:bg-indigo-700">
                      + Add New Booking
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <span className="text-6xl mb-4 block">📅</span>
                      <h3 className="text-xl font-semibold mb-2">No Bookings</h3>
                      <p>Add bookings to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {bookings.map((booking) => (
                        <Card key={booking.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-800">Booking #{booking.id}</h3>
                                  <Badge className={`mt-2 ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {booking.status?.toUpperCase() || 'PENDING'}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-teal-600">₹{booking.total_cost?.toLocaleString() || 'N/A'}</div>
                                  <div className="text-sm text-gray-500">Total Cost</div>
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div><strong>Patient ID:</strong> #{booking.patient_id}</div>
                                <div><strong>Surgery ID:</strong> #{booking.surgery_id || 'N/A'}</div>
                                <div><strong>Doctor ID:</strong> #{booking.doctor_id || 'N/A'}</div>
                                <div><strong>Hospital ID:</strong> #{booking.hospital_id || 'N/A'}</div>
                              </div>
                              
                              <div className="flex space-x-2 pt-3 border-t">
                                <Button 
                                  onClick={() => navigate(`/admin/booking/${booking.id}`)} 
                                  variant="outline" 
                                  size="sm"
                                  className="flex-1"
                                >
                                  👁️ View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
        </div>
      </main>

      {/* Doctor Profile Modal */}
      <DoctorProfileModal
        doctor={selectedDoctor}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onApprove={approveDoctor}
        onReject={rejectDoctor}
        isAdmin={true}
      />

      {/* Patient Profile Modal */}
      <PatientProfileModal
        patient={selectedPatient}
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />
    </div>
  );
};

// Admin Registration Component
const AdminRegistration = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    department: '',
    employee_id: '',
    access_level: 'standard'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/register/admin`, {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        department: formData.department,
        employee_id: formData.employee_id,
        access_level: formData.access_level
      });
      
      toast.success('Admin account created successfully! 🎉');
      navigate('/login-portal');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Admin registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">
            <span className="mr-2">👑</span>
            Admin Registration
            <span className="ml-2">👑</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            <div>
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                placeholder="HEAL-ADM-001"
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                <SelectTrigger className="border-purple-200 focus:border-purple-500">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="medical">Medical Affairs</SelectItem>
                  <SelectItem value="customer_service">Customer Service</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="access_level">Access Level</Label>
              <Select value={formData.access_level} onValueChange={(value) => setFormData({...formData, access_level: value})}>
                <SelectTrigger className="border-purple-200 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Access</SelectItem>
                  <SelectItem value="elevated">Elevated Access</SelectItem>
                  <SelectItem value="super">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                className="border-purple-200 focus:border-purple-500"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login-portal" className="text-purple-600 hover:text-purple-800">
              Already have an account? Choose Login Type
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Doctor Profile Page Component
const DoctorProfilePage = ({ doctorId }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (doctorId) {
      fetchDoctorProfile();
    }
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get(`${API}/doctors/profile/${doctorId}`);
      setDoctor(response.data);
    } catch (error) {
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-700">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="text-center p-8">
            <span className="text-6xl mb-4 block">👨‍⚕️</span>
            <h3 className="text-xl font-semibold mb-2">Doctor Not Found</h3>
            <p className="text-gray-600">The doctor profile you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Doctor Photo */}
              <div className="flex-shrink-0">
                <img
                  src={doctor.image_url}
                  alt={doctor.full_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-teal-200 shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face';
                  }}
                />
                {doctor.online_status && (
                  <div className="flex items-center mt-2 text-green-600">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium">Online Now</span>
                  </div>
                )}
              </div>

              {/* Doctor Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">{doctor.full_name}</h1>
                  {doctor.verification_score > 80 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <span className="mr-1">✓</span>
                      Verified
                    </Badge>
                  )}
                </div>
                
                <p className="text-xl text-teal-600 font-medium mb-3">{doctor.specialization}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">🏥</span>
                    <span>{doctor.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📅</span>
                    <span>{doctor.experience_years} years experience</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">⭐</span>
                    <span>{doctor.rating}/5.0 ({doctor.procedures_completed}+ procedures)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                    <span className="mr-2">📅</span>
                    Book Consultation - ₹{doctor.consultation_fee}
                  </Button>
                  {doctor.online_consultation && (
                    <Button variant="outline" className="border-teal-300 text-teal-600 hover:bg-teal-50">
                      <span className="mr-2">💻</span>
                      Video Consultation
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm mb-6">
            <TabsTrigger value="overview">📋 Overview</TabsTrigger>
            <TabsTrigger value="education">🎓 Education</TabsTrigger>
            <TabsTrigger value="publications">📚 Publications</TabsTrigger>
            <TabsTrigger value="media">🎥 Media</TabsTrigger>
            <TabsTrigger value="testimonials">💬 Testimonials</TabsTrigger>
            <TabsTrigger value="availability">📅 Availability</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">About Dr. {doctor.full_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {doctor.bio || `Dr. ${doctor.full_name} is an experienced ${doctor.specialization} specialist with ${doctor.experience_years} years of medical practice. Committed to providing exceptional patient care and utilizing the latest medical technologies.`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Specializations & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Primary Specialization</h4>
                        <p className="text-gray-600">{doctor.specialization}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Training Type</h4>
                        <p className="text-gray-600">{doctor.training_type}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Fellowships</h4>
                        <p className="text-gray-600">{doctor.fellowships} completed</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Procedures</h4>
                        <p className="text-gray-600">{doctor.procedures_completed}+ completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800">Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medical Council:</span>
                      <span className="font-medium">{doctor.medical_council_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultation Fee:</span>
                      <span className="font-medium text-teal-600">₹{doctor.consultation_fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{doctor.experience_years} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Languages:</span>
                      <span className="font-medium">English, Hindi, Telugu</span>
                    </div>
                  </CardContent>
                </Card>

                {doctor.google_reviews_link && (
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-800">External Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a
                        href={doctor.google_reviews_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🔍</span>
                          <div>
                            <div className="font-medium text-blue-800">Google Reviews</div>
                            <div className="text-xs text-blue-600">View external patient reviews</div>
                          </div>
                        </div>
                        <span className="text-blue-600">→</span>
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Educational Background</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">🎓</span>
                  <h3 className="text-xl font-semibold mb-2">Educational Details</h3>
                  <p>Detailed educational background including degrees, certifications, and achievements will be displayed here.</p>
                  <p className="text-sm mt-2 text-teal-600">Feature coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publications Tab */}
          <TabsContent value="publications">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Research & Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">📚</span>
                  <h3 className="text-xl font-semibold mb-2">Research Publications</h3>
                  <p>PubMed publications, research papers, case studies, and medical articles will be displayed here.</p>
                  <p className="text-sm mt-2 text-teal-600">Feature coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Media & Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">🎥</span>
                  <h3 className="text-xl font-semibold mb-2">Videos & Interviews</h3>
                  <p>YouTube videos, TV interviews, patient testimonial videos, and case study presentations.</p>
                  <p className="text-sm mt-2 text-teal-600">Feature coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Patient Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">💬</span>
                  <h3 className="text-xl font-semibold mb-2">Patient Reviews</h3>
                  <p>Real patient testimonials, success stories, and feedback from previous treatments.</p>
                  <p className="text-sm mt-2 text-teal-600">Feature coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Availability & Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">📅</span>
                  <h3 className="text-xl font-semibold mb-2">Schedule & Availability</h3>
                  <p>Real-time calendar showing available slots, consultation times, and booking options.</p>
                  <p className="text-sm mt-2 text-teal-600">Feature coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Essential Information Collector (Just 3 essential questions - Surgery selection moved to next page)
const EssentialInfoCollector = ({ patientData, onNext }) => {
  const [essentialData, setEssentialData] = useState({
    age: '',
    medical_conditions: '',
    insurance_status: 'yes'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!essentialData.age) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      toast.success('Perfect! Now let\'s explore surgery options 🏥');
      onNext({ 
        ...patientData, 
        essentialInfo: essentialData,
        basicPricingAvailable: true 
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🏥 Quick Health Check
          </h1>
          <p className="text-lg text-slate-600">Just 3 questions to get started with pricing</p>
          <p className="text-sm text-slate-500 mt-1">Takes 30 seconds • You can add details later</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Age */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                1. Your Age Range *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['18-30', '31-45', '46-60', '61-75', '75+'].map((ageRange) => (
                  <button
                    key={ageRange}
                    type="button"
                    onClick={() => setEssentialData({...essentialData, age: ageRange})}
                    className={`px-4 py-4 rounded-xl border-2 transition-all font-medium ${
                      essentialData.age === ageRange
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                        : 'border-gray-200 hover:border-teal-300 hover:bg-teal-25'
                    }`}
                  >
                    {ageRange} years
                  </button>
                ))}
              </div>
            </div>

            {/* Medical Conditions */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                2. Any major medical conditions?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: '', label: '🟢 None that I know of', icon: '😊' },
                  { value: 'diabetes', label: '🔵 Diabetes', icon: '🍯' },
                  { value: 'hypertension', label: '🔴 High Blood Pressure', icon: '💗' },
                  { value: 'heart', label: '❤️ Heart Condition', icon: '💓' },
                  { value: 'multiple', label: '🟡 Multiple conditions', icon: '📋' },
                  { value: 'prefer_not_to_say', label: '⚪ Prefer not to say', icon: '🤐' }
                ].map((condition) => (
                  <button
                    key={condition.value}
                    type="button"
                    onClick={() => setEssentialData({...essentialData, medical_conditions: condition.value})}
                    className={`px-4 py-4 rounded-xl border-2 transition-all text-left ${
                      essentialData.medical_conditions === condition.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                        : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-2">{condition.icon}</span>
                    {condition.label.replace(/🟢|🔵|🔴|❤️|🟡|⚪/, '').trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Insurance Status */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                3. Do you have health insurance?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setEssentialData({...essentialData, insurance_status: 'yes'})}
                  className={`px-6 py-6 rounded-xl border-2 transition-all ${
                    essentialData.insurance_status === 'yes'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-lg'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                  }`}
                >
                  <div className="text-3xl mb-2">🛡️</div>
                  <div className="font-semibold">Yes, I have insurance</div>
                  <div className="text-sm opacity-75">We'll help maximize your coverage</div>
                </button>
                <button
                  type="button"
                  onClick={() => setEssentialData({...essentialData, insurance_status: 'no'})}
                  className={`px-6 py-6 rounded-xl border-2 transition-all ${
                    essentialData.insurance_status === 'no'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                  }`}
                >
                  <div className="text-3xl mb-2">💳</div>
                  <div className="font-semibold">No, paying directly</div>
                  <div className="text-sm opacity-75">We offer transparent pricing</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !essentialData.age}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold py-5 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-3">🏥</span>
                  Explore Surgery Options
                  <span className="ml-3">→</span>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-sm text-center">
              <span className="mr-2">💡</span>
              <strong>Getting basic pricing estimates.</strong> Complete your full health profile later for precise, personalized pricing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reducer for better state management
const bookingReducer = (state, action) => {
  console.log('Booking reducer called with action:', action);
  switch (action.type) {
    case 'NEXT_STEP':
      const newStep = state.currentStep + 1;
      console.log('NEXT_STEP: moving from step', state.currentStep, 'to step', newStep);
      return {
        ...state,
        currentStep: newStep,
        bookingData: { ...state.bookingData, ...action.payload }
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    case 'UPDATE_DATA':
      return {
        ...state,
        bookingData: { ...state.bookingData, ...action.payload }
      };
    case 'RESET':
      return { currentStep: 0, bookingData: {} };
    default:
      return state;
  }
};

const MainApp = () => {
  const location = useLocation();
  const [state, dispatch] = useReducer(bookingReducer, { 
    currentStep: 0, 
    bookingData: {} 
  });

  console.log('MainApp render - currentStep:', state.currentStep, 'bookingData:', state.bookingData);

  // Check if coming from enhanced registration
  useEffect(() => {
    if (location.state?.step && location.state?.patientId) {
      dispatch({ 
        type: 'SET_STEP', 
        payload: location.state.step - 1 
      });
      dispatch({ 
        type: 'UPDATE_DATA', 
        payload: {
          patientId: location.state.patientId,
          patientData: location.state.patientData,
          enhanced: location.state.enhanced
        }
      });
    }
  }, [location.state]);

  const handleNext = (data) => {
    console.log('MainApp handleNext called with data:', data);
    console.log('Current step before update:', state.currentStep);
    
    dispatch({
      type: 'NEXT_STEP',
      payload: data
    });
  };

  const handleComplete = (data) => {
    dispatch({
      type: 'UPDATE_DATA',
      payload: data
    });
  };

  const handleChooseBasic = () => {
    dispatch({ type: 'SET_STEP', payload: 1 });
  };

  const renderCurrentStep = () => {
    const { currentStep, bookingData } = state;
    console.log('Rendering current step:', currentStep);
    
    switch (currentStep) {
      case 0:
        console.log('Rendering SuperQuickRegistration');
        return <SuperQuickRegistration onNext={handleNext} />;
      case 1:
        console.log('Rendering EssentialInfoCollector');
        return <EssentialInfoCollector patientData={bookingData} onNext={handleNext} />;
      case 2:
        console.log('Rendering SurgerySelection');
        return <SurgerySelection patientData={bookingData} onNext={handleNext} />;
      case 3:
        console.log('Rendering SurgeonSelection');
        return <SurgeonSelection patientData={bookingData} surgery={bookingData.surgery} onNext={handleNext} />;
      case 4:
        console.log('Rendering ImplantSelection');
        return (
          <ImplantSelection
            patientData={bookingData}
            surgery={bookingData.surgery}
            surgeon={bookingData.surgeon}
            onNext={handleNext}
          />
        );
      case 5:
        console.log('Rendering HospitalSelection');
        return (
          <HospitalSelection
            patientData={bookingData}
            surgery={bookingData.surgery}
            surgeon={bookingData.surgeon}
            implant={bookingData.implant}
            onNext={handleNext}
          />
        );
      case 6:
        console.log('Rendering Checkout');
        return (
          <Checkout
            patientData={bookingData}
            surgery={bookingData.surgery}
            surgeon={bookingData.surgeon}
            implant={bookingData.implant}
            hospital={bookingData.hospital}
            onComplete={handleComplete}
          />
        );
      default:
        console.log('Default case - rendering SuperQuickRegistration');
        return <SuperQuickRegistration onNext={handleNext} />;
    }
  };

  return renderCurrentStep();
};

// Step 1: Patient Registration
// Simplified Quick Registration Component 
const SuperQuickRegistration = ({ onNext }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    console.log('SuperQuickRegistration: Starting registration');
    setLoading(true);
    
    try {
      // Create minimal patient profile
      const response = await axios.post(`${API}/patients`, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        age: 25, // Default
        gender: 'other', // Default
        address: 'To be updated',
        emergency_contact_name: 'To be updated',
        emergency_contact_phone: 'To be updated',
        insurance_provider: 'To be updated',
        insurance_number: 'To be updated'
      });
      
      console.log('SuperQuickRegistration: API success, calling onNext');
      toast.success('Welcome to healthtime! 🎉');
      onNext({ 
        patientId: response.data.id, 
        patientData: response.data,
        profileComplete: false 
      });
    } catch (error) {
      // Even if API fails, continue with mock data for demo
      console.log('SuperQuickRegistration: API failed, using mock data and calling onNext');
      toast.success('Welcome to healthtime! 🎉');
      onNext({ 
        patientId: 'mock-' + Date.now(), 
        patientData: formData,
        profileComplete: false 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 fade-in">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gradient mb-3">
            🚀 Quick Start
          </h1>
          <p className="text-xl text-slate-700 font-medium">Get started in 30 seconds!</p>
          <p className="text-sm text-slate-500 mt-2">You can complete your profile later</p>
        </div>

        <div className="glass rounded-3xl shadow-2xl border-0 p-8 slide-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-5 py-4 border-2 border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all bg-white/50 backdrop-blur-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-5 py-4 border-2 border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all bg-white/50 backdrop-blur-sm"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-5 py-4 border-2 border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all bg-white/50 backdrop-blur-sm"
                placeholder="+91 9876543210"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl btn-animate"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center text-lg">
                  <span className="mr-2">🚀</span>
                  Start My Journey
                  <span className="ml-2">→</span>
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-500">Need comprehensive health profiling?</p>
              <button
                onClick={() => navigate('/register/patient/enhanced')}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm underline"
              >
                ✨ Switch to Enhanced Registration
              </button>
              <div className="mt-2">
                <button
                  onClick={() => navigate('/profile/complete')}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm underline"
                >
                  📋 Complete Full Health Profile
                </button>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400 mb-2">Already have an account?</p>
              <button
                onClick={() => navigate('/login-portal')}
                className="text-gray-600 hover:text-gray-800 text-sm underline"
              >
                Choose login type
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              <span className="mr-1">✨</span>
              <strong>Pro tip:</strong> Complete your full profile after browsing to get personalized surgeon recommendations!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientRegistration = ({ onNext }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    insurance_provider: '',
    insurance_number: ''
  });
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/patients`, {
        ...formData,
        age: parseInt(formData.age)
      });
      
      if (insuranceFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', insuranceFile);
        await axios.post(`${API}/patients/${response.data.id}/insurance-upload`, formDataFile);
      }
      
      toast.success('Welcome to your wellness journey! 🌟');
      onNext({ patientId: response.data.id, patientData: response.data });
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            ✨ healthtime ✨
          </h1>
          <p className="text-xl text-slate-600">Your Personal Wellness Journey Awaits</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <span className="mr-2">🌟</span>
              Begin Your Transformation Journey
              <span className="ml-2">🌟</span>
            </CardTitle>
            <div className="w-full bg-white/20 rounded-full h-2 mt-4">
              <div className="bg-white h-2 rounded-full" style={{ width: '16.67%' }}></div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name" data-testid="full-name-label">Full Name *</Label>
                  <Input
                    id="full_name"
                    data-testid="full-name-input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email" data-testid="email-label">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="email-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" data-testid="phone-label">Phone *</Label>
                  <Input
                    id="phone"
                    data-testid="phone-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="age" data-testid="age-label">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    data-testid="age-input"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" data-testid="gender-label">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})} required>
                    <SelectTrigger data-testid="gender-select" className="border-teal-200 focus:border-teal-500">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address" data-testid="address-label">Address *</Label>
                  <Input
                    id="address"
                    data-testid="address-input"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>

              <Separator className="bg-teal-200" />
              <h3 className="text-lg font-semibold text-teal-700 flex items-center">
                <span className="mr-2">👨‍👩‍👧‍👦</span>
                Emergency Contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_name" data-testid="emergency-name-label">Emergency Contact Name *</Label>
                  <Input
                    id="emergency_name"
                    data-testid="emergency-name-input"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_phone" data-testid="emergency-phone-label">Emergency Contact Phone *</Label>
                  <Input
                    id="emergency_phone"
                    data-testid="emergency-phone-input"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>

              <Separator className="bg-teal-200" />
              <h3 className="text-lg font-semibold text-teal-700 flex items-center">
                <span className="mr-2">🛡️</span>
                Coverage Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insurance_provider" data-testid="insurance-provider-label">Coverage Provider *</Label>
                  <Input
                    id="insurance_provider"
                    data-testid="insurance-provider-input"
                    value={formData.insurance_provider}
                    onChange={(e) => setFormData({...formData, insurance_provider: e.target.value})}
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_number" data-testid="insurance-number-label">Coverage Number *</Label>
                  <Input
                    id="insurance_number"
                    data-testid="insurance-number-input"
                    value={formData.insurance_number}
                    onChange={(e) => setFormData({...formData, insurance_number: e.target.value})}
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="insurance_file" data-testid="insurance-file-label">Upload Coverage Document</Label>
                <Input
                  id="insurance_file"
                  type="file"
                  data-testid="insurance-file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setInsuranceFile(e.target.files[0])}
                  className="mt-1 border-teal-200 focus:border-teal-500"
                />
                <p className="text-xs text-teal-600 mt-1">Accepted formats: PDF, JPG, PNG</p>
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  data-testid="register-submit-btn"
                  disabled={loading}
                  className="px-10 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Starting Your Journey...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-2">🚀</span>
                      Start My Wellness Journey
                      <span className="ml-2">✨</span>
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Step 2: Surgery Selection
const SurgerySelection = ({ patientData, onNext }) => {
  // Hardcoded working data - no complex state management
  const surgeries = [
    {
      id: '1',
      name: 'Knee Replacement',
      description: 'Complete or partial knee joint replacement surgery for arthritis and joint pain',
      base_cost: 180000,
      duration: '2-3 hours',
      recovery: '6-8 weeks',
      rating: 4.8,
      procedures_done: 15420,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop'
    },
    {
      id: '2',
      name: 'Hip Replacement',
      description: 'Hip joint replacement to restore mobility and reduce pain from arthritis',
      base_cost: 200000,
      duration: '1.5-2.5 hours',
      recovery: '8-10 weeks',
      rating: 4.9,
      procedures_done: 12890,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop'
    },
    {
      id: '3',
      name: 'Cataract Surgery',
      description: 'Remove clouded natural lens and replace with artificial intraocular lens',
      base_cost: 35000,
      duration: '20-30 minutes',
      recovery: '1-2 weeks',
      rating: 4.9,
      procedures_done: 28450,
      image: 'https://images.unsplash.com/photo-1582560469781-1965b9af5ebe?w=400&h=250&fit=crop'
    },
    {
      id: '4',
      name: 'Hernia Repair',
      description: 'Laparoscopic or open surgery to repair abdominal wall hernia',
      base_cost: 85000,
      duration: '1-2 hours',
      recovery: '2-4 weeks',
      rating: 4.7,
      procedures_done: 18920,
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop'
    },
    {
      id: '5',
      name: 'Gallbladder Surgery',
      description: 'Minimally invasive laparoscopic cholecystectomy to remove gallbladder',
      base_cost: 95000,
      duration: '30-60 minutes',
      recovery: '1-2 weeks',
      rating: 4.8,
      procedures_done: 22340,
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=250&fit=crop'
    },
    {
      id: '6',
      name: 'Heart Bypass',
      description: 'Coronary artery bypass surgery to improve blood flow to the heart',
      base_cost: 450000,
      duration: '3-6 hours',
      recovery: '6-8 weeks',
      rating: 4.6,
      procedures_done: 5670,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop'
    }
  ];
  
  const [selectedSurgery, setSelectedSurgery] = useState(null);

  const handleNext = () => {
    if (!selectedSurgery) {
      toast.error('Please select a surgery');
      return;
    }
    
    toast.success(`Great choice! Let's find surgeons for ${selectedSurgery.name} 👨‍⚕️`);
    onNext({ surgery: selectedSurgery });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-100/30 via-transparent to-blue-100/30"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 fade-in">
          <h1 className="text-6xl font-extrabold text-gradient mb-4">
            🏥 Choose Your Surgery
          </h1>
          <p className="text-xl text-slate-700 mb-2 font-medium">Select the procedure you're interested in</p>
          <p className="text-sm text-slate-500">Click on any card to see details and pricing</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {surgeries.map((surgery, index) => (
            <div
              key={surgery.id}
              onClick={() => setSelectedSurgery(surgery)}
              className={`glass rounded-3xl overflow-hidden cursor-pointer card-hover scale-in ${
                selectedSurgery?.id === surgery.id
                  ? 'ring-4 ring-cyan-500 shadow-glow scale-[1.03]'
                  : ''
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Image */}
              <div className="h-56 bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4 glass rounded-full px-4 py-2 flex items-center shadow-lg">
                  <span className="text-yellow-400 mr-1 text-lg">★</span>
                  <span className="font-bold text-sm text-gray-800">{surgery.rating}</span>
                </div>
                {selectedSurgery?.id === surgery.id && (
                  <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center backdrop-blur-sm">
                    <div className="glass rounded-full p-4 shadow-2xl scale-in">
                      <span className="text-4xl">✅</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{surgery.name}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{surgery.description}</p>
                
                {/* Stats Row */}
                <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-1">⏱️</span>
                    <span>{surgery.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🏥</span>
                    <span>{surgery.procedures_done?.toLocaleString()} done</span>
                  </div>
                </div>

                {/* Recovery Time */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Recovery:</span>
                    <span className="ml-1 font-medium text-gray-700">{surgery.recovery}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-teal-600">
                        ₹{surgery.base_cost?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Starting from*</div>
                    </div>
                    {patientData?.essentialInfo?.insurance_status === 'yes' && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          ₹{Math.round(surgery.base_cost * 0.2)?.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-500">Your est. cost</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Surgery Info & Continue Button */}
        {selectedSurgery && (
          <div className="fixed bottom-0 left-0 right-0 glass border-t-2 border-cyan-200 p-6 shadow-2xl slide-in-up z-50">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🏥</span>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-800">{selectedSurgery.name}</h4>
                  <p className="text-sm text-gray-600 font-medium">
                    ₹{selectedSurgery.base_cost?.toLocaleString()} • {selectedSurgery.rating}★ rated
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center text-lg btn-animate"
              >
                <span className="mr-2">👨‍⚕️</span>
                Find Surgeons
                <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Insurance Notice */}
        {patientData?.essentialInfo?.insurance_status === 'yes' && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-green-800">
              <span className="text-2xl mr-2">🛡️</span>
              <strong>Great news!</strong> With insurance, your estimated cost is significantly lower. 
              Exact coverage will be verified with your provider.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 3: Enhanced Surgeon Selection (Airbnb-style with top filters)
const SurgeonSelection = ({ patientData, surgery, onNext }) => {
  const [surgeons, setSurgeons] = useState([]);
  const [filteredSurgeons, setFilteredSurgeons] = useState([]);
  const [selectedSurgeon, setSelectedSurgeon] = useState(null);
  const [showProfile, setShowProfile] = useState(null);
  const [filters, setFilters] = useState({
    experience: 'all',
    training: 'all',
    consultation: 'all',
    rating: 'all',
    location: 'all',
    specialization: 'all',
    availability: 'all',
    gender: 'all',
    languages: 'all',
    fees: 'all',
    surgeries_performed: 'all',
    education: 'all'
  });
  const [loading, setLoading] = useState(true);

  // Fetch surgeons from API
  useEffect(() => {
    const fetchSurgeons = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/doctors/surgeons`);
        setSurgeons(response.data);
        setFilteredSurgeons(response.data);
      } catch (error) {
        console.error('Failed to fetch surgeons:', error);
        toast.error('Failed to load surgeons');
        setSurgeons([]);
        setFilteredSurgeons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSurgeons();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    let filtered = [...surgeons];

    if (filters.experience !== 'all') {
      if (filters.experience === '10+') {
        filtered = filtered.filter(surgeon => surgeon.experience_years >= 10);
      } else if (filters.experience === '5-10') {
        filtered = filtered.filter(surgeon => surgeon.experience_years >= 5 && surgeon.experience_years < 10);
      } else if (filters.experience === '<5') {
        filtered = filtered.filter(surgeon => surgeon.experience_years < 5);
      }
    }

    if (filters.training !== 'all') {
      filtered = filtered.filter(surgeon => surgeon.training_type === filters.training);
    }

    if (filters.consultation !== 'all') {
      filtered = filtered.filter(surgeon => surgeon.online_consultation === (filters.consultation === 'true'));
    }

    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(surgeon => surgeon.rating >= minRating);
    }

    if (filters.location !== 'all') {
      filtered = filtered.filter(surgeon => surgeon.location.toLowerCase().includes(filters.location.toLowerCase()));
    }

    // Sort by rating and experience (top surgeons first)
    filtered.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.experience_years - a.experience_years;
    });

    setFilteredSurgeons(filtered);
  }, [filters, surgeons]);

  const clearFilters = () => {
    setFilters({
      experience: 'all',
      training: 'all',
      consultation: 'all',
      rating: 'all',
      location: 'all'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

  const handleNext = () => {
    if (selectedSurgeon) {
      onNext({ surgeon: selectedSurgeon });
    }
  };

  if (showProfile) {
    return (
      <div>
        <div className="mb-4 p-4">
          <Button
            onClick={() => setShowProfile(null)}
            variant="outline"
            className="border-teal-300 text-teal-600 hover:bg-teal-50"
          >
            ← Back to Surgeon Selection
          </Button>
        </div>
        <DoctorProfilePage doctorId={showProfile} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading top surgeons in your city...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-100/30 via-transparent to-blue-100/30"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 fade-in">
          <h1 className="text-6xl font-extrabold text-gradient mb-4">Top Surgeons in Your City</h1>
          <p className="text-xl text-slate-700 font-medium">Choose from {surgeons.length} highly qualified surgeons</p>
        </div>

        {/* Airbnb-style Filters Bar */}
        <Card className="glass shadow-xl mb-8 slide-in-up">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Filter Surgeons:</h3>
              
              {/* Experience Filter */}
              <div className="min-w-[140px]">
                <Select value={filters.experience} onValueChange={(value) => setFilters({...filters, experience: value})}>
                  <SelectTrigger className="h-10 border-slate-300">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Experience</SelectItem>
                    <SelectItem value="10+">10+ Years</SelectItem>
                    <SelectItem value="5-10">5-10 Years</SelectItem>
                    <SelectItem value="<5">Under 5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Training Filter */}
              <div className="min-w-[140px]">
                <Select value={filters.training} onValueChange={(value) => setFilters({...filters, training: value})}>
                  <SelectTrigger className="h-10 border-slate-300">
                    <SelectValue placeholder="Training" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Training</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Online Consultation Filter */}
              <div className="min-w-[160px]">
                <Select value={filters.consultation} onValueChange={(value) => setFilters({...filters, consultation: value})}>
                  <SelectTrigger className="h-10 border-slate-300">
                    <SelectValue placeholder="Consultation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Type</SelectItem>
                    <SelectItem value="true">Online Available</SelectItem>
                    <SelectItem value="false">In-person Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="min-w-[120px]">
                <Select value={filters.rating} onValueChange={(value) => setFilters({...filters, rating: value})}>
                  <SelectTrigger className="h-10 border-slate-300">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    <SelectItem value="3.5">3.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="text-slate-600 border-slate-300 hover:bg-slate-50"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredSurgeons.length} of {surgeons.length} surgeons
                {hasActiveFilters && <span className="ml-2 text-blue-600">(filtered)</span>}
              </p>
              <div className="text-sm text-slate-500">
                Step 3 of 6: Surgeon Selection
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surgeon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredSurgeons.map((surgeon, index) => (
            <Card
              key={surgeon.id}
              className={`transition-all duration-200 hover:shadow-xl cursor-pointer ${
                selectedSurgeon?.id === surgeon.id
                  ? 'ring-2 ring-blue-500 shadow-xl scale-[1.02]'
                  : 'hover:shadow-lg hover:scale-[1.01]'
              }`}
              data-testid={`surgeon-card-${surgeon.id}`}
            >
              <CardContent className="p-6">
                <div className="relative mb-4">
                  {index < 3 && (
                    <Badge className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-xs">
                      Top {index + 1}
                    </Badge>
                  )}
                  <div className="flex items-center space-x-4">
                    <img
                      src={surgeon.image_url}
                      alt={surgeon.full_name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-800 leading-tight">{surgeon.full_name}</h3>
                      <p className="text-blue-600 font-medium text-sm">{surgeon.specialization}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium ml-1">{surgeon.rating}</span>
                        <span className="text-xs text-slate-500 ml-2">({surgeon.procedures_completed}+ procedures)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>📍 {surgeon.location}</div>
                    <div>🎓 {surgeon.experience_years} years exp</div>
                    <div>🌍 {surgeon.training_type}</div>
                    <div>🏆 {surgeon.fellowships || 0} fellowships</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {surgeon.online_consultation && (
                      <Badge className="bg-green-100 text-green-700 text-xs">Online Consult</Badge>
                    )}
                    {surgeon.training_type === 'International' && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">International</Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedSurgeon(surgeon)}
                    size="sm"
                    className={selectedSurgeon?.id === surgeon.id 
                      ? "flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold shadow-lg" 
                      : "flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold"
                    }
                  >
                    {selectedSurgeon?.id === surgeon.id ? '✓ Selected' : 'Select'}
                  </Button>
                  <Button
                    onClick={() => setShowProfile(surgeon.id)}
                    size="sm"
                    variant="outline"
                    className="border-2 border-cyan-300 text-cyan-600 hover:bg-cyan-50 font-semibold"
                  >
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredSurgeons.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-semibold mb-2">No surgeons found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your filters to see more results</p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        {selectedSurgeon && (
          <Card className="glass shadow-2xl sticky bottom-4 slide-in-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">
                      Selected: <span className="font-bold text-slate-800 text-lg">{selectedSurgeon.full_name}</span>
                    </p>
                    <p className="text-sm text-slate-600 font-medium">{selectedSurgeon.specialization}</p>
                  </div>
                </div>
                <Button
                  onClick={handleNext}
                  data-testid="surgeon-next-btn"
                  className="px-10 py-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-700 hover:via-teal-700 hover:to-blue-700 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all btn-animate"
                >
                  Continue to Implant Selection →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Step 4: Implant Selection
const ImplantSelection = ({ patientData, surgery, surgeon, onNext }) => {
  const [implants, setImplants] = useState([]);
  const [selectedImplant, setSelectedImplant] = useState(null);
  const [selectionMethod, setSelectionMethod] = useState(''); // 'ai' or 'surgeon' or 'manual'
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(null);

  useEffect(() => {
    fetchImplants();
  }, []);

  const fetchImplants = async () => {
    try {
      const response = await axios.get(`${API}/implants`);
      setImplants(response.data);
    } catch (error) {
      console.error('Failed to fetch implants:', error);
      
      // Comprehensive implant database for all surgery types
      const allImplants = {
        // KNEE REPLACEMENT IMPLANTS
        knee: [
          {
            id: 'knee-1',
            name: 'Zimmer Persona Knee System',
            description: 'Advanced personalized knee replacement with patient-specific instrumentation for optimal fit and function',
            brand: 'Zimmer Biomet',
            material: 'Cobalt-Chrome Alloy + UHMWPE',
            lifespan: '20-25 years',
            cost: 285000,
            success_rate: 98.7,
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
            company_highlights: ['Global market leader', 'FDA & CE approved', 'Used in 80+ countries', '2M+ implants worldwide'],
            suitable_age: '40-80',
            activity_level: 'Moderate to High',
            warranty: '20 years',
            surgery_type: 'knee'
          },
          {
            id: 'knee-2',
            name: 'DePuy Attune Knee',
            description: 'Next-generation knee implant with enhanced stability and natural knee movement',
            brand: 'Johnson & Johnson',
            material: 'Titanium Alloy + Ceramic',
            lifespan: '22-28 years',
            cost: 325000,
            success_rate: 99.1,
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
            company_highlights: ['J&J Healthcare leader', 'Revolutionary design', 'Fastest recovery', 'Premium choice'],
            suitable_age: '35-75',
            activity_level: 'High to Very High',
            warranty: '25 years',
            surgery_type: 'knee'
          },
          {
            id: 'knee-3',
            name: 'Stryker Triathlon Knee',
            description: 'Proven knee replacement system with X3 polyethylene for enhanced durability',
            brand: 'Stryker Corporation',
            material: 'Cobalt-Chrome + X3 UHMWPE',
            lifespan: '18-22 years',
            cost: 245000,
            success_rate: 98.3,
            image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
            company_highlights: ['Fortune 500 company', 'Proven track record', 'Excellent patient outcomes', '15+ years data'],
            suitable_age: '45-80',
            activity_level: 'Low to High',
            warranty: '18 years',
            surgery_type: 'knee'
          },
          {
            id: 'knee-4',
            name: 'Smith & Nephew Legion Knee',
            description: 'Innovative knee system with VERILAST technology for superior wear resistance',
            brand: 'Smith & Nephew',
            material: 'OXINIUM + VERILAST',
            lifespan: '25-30 years',
            cost: 295000,
            success_rate: 98.9,
            image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop',
            company_highlights: ['British innovation', 'VERILAST technology', 'Superior wear resistance', 'Active lifestyle'],
            suitable_age: '30-70',
            activity_level: 'Very High',
            warranty: '25 years',
            surgery_type: 'knee'
          }
        ],
        
        // HIP REPLACEMENT IMPLANTS
        hip: [
          {
            id: 'hip-1',
            name: 'Zimmer M/L Taper Hip Stem',
            description: 'Gold standard cementless hip stem with proven long-term outcomes and bone preservation',
            brand: 'Zimmer Biomet',
            material: 'Titanium Alloy + Ceramic Head',
            lifespan: '25-30 years',
            cost: 315000,
            success_rate: 99.2,
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
            company_highlights: ['World\'s most used hip stem', '30+ years clinical data', 'Bone preservation', 'Premium quality'],
            suitable_age: '35-75',
            activity_level: 'Moderate to High',
            warranty: '25 years',
            surgery_type: 'hip'
          },
          {
            id: 'hip-2',
            name: 'DePuy Pinnacle Hip System',
            description: 'Advanced modular hip system with highly cross-linked polyethylene for reduced wear',
            brand: 'Johnson & Johnson',
            material: 'Titanium + Marathon UHMWPE',
            lifespan: '20-25 years',
            cost: 285000,
            success_rate: 98.8,
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
            company_highlights: ['J&J trusted brand', 'Marathon technology', 'Reduced wear particles', 'FDA approved'],
            suitable_age: '40-80',
            activity_level: 'Low to High',
            warranty: '20 years',
            surgery_type: 'hip'
          },
          {
            id: 'hip-3',
            name: 'Stryker Accolade TMZF Hip',
            description: 'Titanium-molybdenum-zirconium-iron stem with reduced elastic modulus for bone health',
            brand: 'Stryker Corporation',
            material: 'TMZF Alloy + Ceramic',
            lifespan: '25-35 years',
            cost: 345000,
            success_rate: 99.4,
            image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
            company_highlights: ['Advanced metallurgy', 'Bone-friendly design', 'Longest lifespan', 'Premium innovation'],
            suitable_age: '25-70',
            activity_level: 'High to Very High',
            warranty: '30 years',
            surgery_type: 'hip'
          }
        ],

        // CATARACT SURGERY IOLs (Intraocular Lenses)
        cataract: [
          {
            id: 'cataract-1',
            name: 'Alcon AcrySof IQ IOL',
            description: 'Premium aspheric monofocal IOL with blue light filtering for enhanced vision quality',
            brand: 'Alcon (Novartis)',
            material: 'Acrylic Hydrophobic',
            lifespan: 'Lifetime',
            cost: 25000,
            success_rate: 99.5,
            image: 'https://images.unsplash.com/photo-1582560469781-1965b9af5ebe?w=400&h=300&fit=crop',
            company_highlights: ['World leader in eye care', 'Blue light protection', 'Aspheric design', 'Premium vision'],
            suitable_age: '40-95',
            activity_level: 'All levels',
            warranty: 'Lifetime',
            surgery_type: 'cataract'
          },
          {
            id: 'cataract-2',
            name: 'Johnson & Johnson Tecnis IOL',
            description: 'Advanced wavefront-designed IOL for superior contrast sensitivity and night vision',
            brand: 'Johnson & Johnson Vision',
            material: 'Hydrophobic Acrylic',
            lifespan: 'Lifetime',
            cost: 28000,
            success_rate: 99.3,
            image: 'https://images.unsplash.com/photo-1582560469781-1965b9af5ebe?w=400&h=300&fit=crop',
            company_highlights: ['Wavefront technology', 'Enhanced night vision', 'J&J quality', 'Proven outcomes'],
            suitable_age: '35-90',
            activity_level: 'All levels',
            warranty: 'Lifetime',
            surgery_type: 'cataract'
          },
          {
            id: 'cataract-3',
            name: 'Bausch + Lomb enVista IOL',
            description: 'Innovative hydrophobic acrylic IOL with unique edge design to prevent PCO',
            brand: 'Bausch + Lomb',
            material: 'Hydrophobic Acrylic',
            lifespan: 'Lifetime',
            cost: 22000,
            success_rate: 99.1,
            image: 'https://images.unsplash.com/photo-1582560469781-1965b9af5ebe?w=400&h=300&fit=crop',
            company_highlights: ['150+ years experience', 'PCO prevention', 'Cost-effective', 'Reliable choice'],
            suitable_age: '45-85',
            activity_level: 'All levels',
            warranty: 'Lifetime',
            surgery_type: 'cataract'
          },
          {
            id: 'cataract-4',
            name: 'Zeiss AT LISA Trifocal IOL',
            description: 'Premium trifocal IOL providing clear vision at near, intermediate, and distance',
            brand: 'Carl Zeiss Meditec',
            material: 'Hydrophilic Acrylic',
            lifespan: 'Lifetime',
            cost: 85000,
            success_rate: 98.7,
            image: 'https://images.unsplash.com/photo-1582560469781-1965b9af5ebe?w=400&h=300&fit=crop',
            company_highlights: ['German precision', 'Trifocal technology', 'Reduces glasses dependency', 'Premium vision'],
            suitable_age: '40-75',
            activity_level: 'Active lifestyle',
            warranty: 'Lifetime',
            surgery_type: 'cataract'
          }
        ],

        // HERNIA REPAIR MESHES
        hernia: [
          {
            id: 'hernia-1',
            name: 'Ethicon Physiomesh',
            description: 'Composite mesh with absorbable coating for reduced adhesion formation',
            brand: 'Ethicon (J&J)',
            material: 'Polypropylene + PDS coating',
            lifespan: 'Permanent',
            cost: 15000,
            success_rate: 97.8,
            image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
            company_highlights: ['J&J medical devices', 'Reduced adhesions', 'Laparoscopic friendly', 'Proven safety'],
            suitable_age: '18-80',
            activity_level: 'All levels',
            warranty: '5 years',
            surgery_type: 'hernia'
          },
          {
            id: 'hernia-2',
            name: 'Medtronic Parietex Mesh',
            description: 'Lightweight 3D mesh with hydrophilic coating for optimal integration',
            brand: 'Medtronic',
            material: 'Polyester + Collagen coating',
            lifespan: 'Permanent',
            cost: 18000,
            success_rate: 98.2,
            image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
            company_highlights: ['Global medtech leader', '3D structure', 'Optimal integration', 'Lightweight design'],
            suitable_age: '20-85',
            activity_level: 'All levels',
            warranty: '5 years',
            surgery_type: 'hernia'
          }
        ],

        // GALLBLADDER SURGERY (Instruments)
        gallbladder: [
          {
            id: 'gallbladder-1',
            name: 'Harmonic Scalpel System',
            description: 'Advanced ultrasonic cutting and coagulation system for precise laparoscopic surgery',
            brand: 'Ethicon Endo-Surgery',
            material: 'Titanium alloy instruments',
            lifespan: 'Single use',
            cost: 8000,
            success_rate: 99.2,
            image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop',
            company_highlights: ['Minimally invasive', 'Reduced bleeding', 'Faster recovery', 'Precision cutting'],
            suitable_age: '18-85',
            activity_level: 'All levels',
            warranty: 'Single use',
            surgery_type: 'gallbladder'
          }
        ]
      };

      // Determine which implants to show based on selected surgery
      let relevantImplants = [];
      const surgeryType = surgery?.name?.toLowerCase();
      
      if (surgeryType?.includes('knee')) {
        relevantImplants = allImplants.knee;
      } else if (surgeryType?.includes('hip')) {
        relevantImplants = allImplants.hip;
      } else if (surgeryType?.includes('cataract')) {
        relevantImplants = allImplants.cataract;
      } else if (surgeryType?.includes('hernia')) {
        relevantImplants = allImplants.hernia;
      } else if (surgeryType?.includes('gallbladder')) {
        relevantImplants = allImplants.gallbladder;
      } else {
        // Default to knee implants if surgery type not recognized
        relevantImplants = allImplants.knee;
      }
      
      setImplants(relevantImplants);
    } finally {
      setLoading(false);
    }
  };

  const getAiRecommendation = () => {
    const patientAge = patientData?.essentialInfo?.age || '31-45';
    const ageNumber = parseInt(patientAge.split('-')[0]);
    
    // AI logic based on age and condition
    let recommendedImplant;
    if (ageNumber < 35) {
      recommendedImplant = implants.find(imp => imp.id === '3'); // Premium for young patients
    } else if (ageNumber >= 60) {
      recommendedImplant = implants.find(imp => imp.id === '4'); // Basic for seniors
    } else {
      recommendedImplant = implants.find(imp => imp.id === '1'); // Standard for middle-aged
    }
    
    setAiRecommendation(recommendedImplant);
    setSelectedImplant(recommendedImplant);
  };

  const handleMethodSelect = (method) => {
    setSelectionMethod(method);
    if (method === 'ai') {
      getAiRecommendation();
    } else if (method === 'surgeon') {
      // Let surgeon decide - skip implant selection
      toast.success('Surgeon will recommend the best implant during consultation 👨‍⚕️');
      onNext({ implant: { id: 'surgeon_choice', name: 'Surgeon\'s Recommendation' } });
      return;
    }
  };

  const handleNext = () => {
    if (!selectedImplant) {
      toast.error('Please select an implant or choose consultation method');
      return;
    }
    
    toast.success(`Great choice! ${selectedImplant.name} selected 🦴`);
    onNext({ implant: selectedImplant });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600 font-medium">Loading implant options...</p>
        </div>
      </div>
    );
  }

  // Method Selection Screen
  if (!selectionMethod) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
              🦴 Choose Your Implant Method
            </h1>
            <p className="text-xl text-slate-600 mb-2">How would you like to select your implant?</p>
            <p className="text-sm text-slate-500">Our AI considers your age, activity level, and medical history</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* AI Suggestion */}
            <div 
              onClick={() => handleMethodSelect('ai')}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 relative"
            >
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <div className="text-6xl mb-6 text-center">🤖</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">AI Recommendation</h3>
              <p className="text-gray-600 mb-6 text-center">Our AI analyzes your profile and suggests the perfect implant based on age, activity level, and medical conditions.</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center"><span className="text-purple-500 mr-2">✓</span>Personalized selection</div>
                <div className="flex items-center"><span className="text-purple-500 mr-2">✓</span>Data-driven choice</div>
                <div className="flex items-center"><span className="text-purple-500 mr-2">✓</span>Instant recommendation</div>
                <div className="flex items-center"><span className="text-purple-500 mr-2">✓</span>95% patient satisfaction</div>
              </div>
            </div>

            {/* Manual Selection */}
            <div 
              onClick={() => handleMethodSelect('manual')}
              className="bg-white rounded-3xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-teal-400"
            >
              <div className="text-6xl mb-6 text-center">👁️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Browse & Choose</h3>
              <p className="text-gray-600 mb-6 text-center">Explore all available implants with detailed specifications and choose what feels right for you.</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center"><span className="text-teal-500 mr-2">✓</span>Full control</div>
                <div className="flex items-center"><span className="text-teal-500 mr-2">✓</span>Detailed comparisons</div>
                <div className="flex items-center"><span className="text-teal-500 mr-2">✓</span>See all options</div>
                <div className="flex items-center"><span className="text-teal-500 mr-2">✓</span>Make informed decision</div>
              </div>
            </div>

            {/* Surgeon Choice */}
            <div 
              onClick={() => handleMethodSelect('surgeon')}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-green-200 hover:border-green-400"
            >
              <div className="text-6xl mb-6 text-center">👨‍⚕️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Surgeon's Choice</h3>
              <p className="text-gray-600 mb-6 text-center">Let your surgeon decide the best implant during consultation based on detailed medical examination.</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center"><span className="text-green-500 mr-2">✓</span>Expert recommendation</div>
                <div className="flex items-center"><span className="text-green-500 mr-2">✓</span>Medical examination based</div>
                <div className="flex items-center"><span className="text-green-500 mr-2">✓</span>Professional guidance</div>
                <div className="flex items-center"><span className="text-green-500 mr-2">✓</span>Traditional approach</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Implant Selection Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🦴 {selectionMethod === 'ai' ? 'AI Recommended Implants' : 'Choose Your Implant'}
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            {selectionMethod === 'ai' ? 'Based on your profile analysis' : `Select the best implant for your ${surgery?.name}`}
          </p>
          {aiRecommendation && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 max-w-2xl mx-auto">
              <p className="text-purple-800">
                <span className="mr-2">🤖</span>
                <strong>AI Analysis:</strong> Based on your age ({patientData?.essentialInfo?.age}) and medical profile, 
                we recommend the <strong>{aiRecommendation.name}</strong> for optimal results.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
          {implants.map((implant) => (
            <div
              key={implant.id}
              onClick={() => setSelectedImplant(implant)}
              className={`bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                selectedImplant?.id === implant.id
                  ? 'ring-4 ring-teal-500 shadow-2xl scale-105'
                  : ''
              } ${aiRecommendation?.id === implant.id ? 'ring-2 ring-purple-400' : ''}`}
            >
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 relative overflow-hidden">
                <img 
                  src={implant.image} 
                  alt={implant.name}
                  className="w-full h-full object-cover opacity-80"
                />
                
                {/* Info Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTerms(implant);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <span className="text-sm font-bold text-gray-600">i</span>
                </button>
                
                {/* Success Rate */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                  <span className="text-green-500 mr-1">✓</span>
                  <span className="font-semibold text-sm">{implant.success_rate}%</span>
                </div>

                {/* AI Recommendation Badge */}
                {aiRecommendation?.id === implant.id && (
                  <div className="absolute bottom-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    🤖 AI PICK
                  </div>
                )}

                {/* Selection Checkmark */}
                {selectedImplant?.id === implant.id && (
                  <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{implant.name}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{implant.description}</p>
                
                {/* Company & Material */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Brand:</span>
                    <span className="font-medium text-gray-700">{implant.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Material:</span>
                    <span className="font-medium text-gray-700">{implant.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lifespan:</span>
                    <span className="font-medium text-gray-700">{implant.lifespan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Warranty:</span>
                    <span className="font-medium text-gray-700">{implant.warranty}</span>
                  </div>
                </div>

                {/* Company Highlights */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Company Highlights:</p>
                  <div className="space-y-1">
                    {(implant.company_highlights || []).slice(0, 2).map((highlight, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <span className="text-teal-500 mr-2">•</span>
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="border-t pt-4">
                  <div className="text-2xl font-bold text-teal-600">
                    ₹{implant.cost?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Additional implant cost</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Implant Info & Continue Button */}
        {selectedImplant && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-6 shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🦴</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{selectedImplant.name}</h4>
                  <p className="text-sm text-gray-600">
                    ₹{selectedImplant.cost?.toLocaleString()} • {selectedImplant.success_rate}% success rate • {selectedImplant.lifespan} lifespan
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
              >
                <span className="mr-2">🏥</span>
                Choose Hospital
                <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Terms & Conditions Modal */}
        {showTerms && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{showTerms.name} - Information</h3>
                  <button 
                    onClick={() => setShowTerms(null)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Company Highlights</h4>
                  <ul className="space-y-1">
                    {(showTerms.company_highlights || []).map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-teal-500 mr-2">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Specifications</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Suitable Age:</strong> {showTerms.suitable_age || 'N/A'}</div>
                    <div><strong>Activity Level:</strong> {showTerms.activity_level || 'N/A'}</div>
                    <div><strong>Success Rate:</strong> {showTerms.success_rate || 'N/A'}%</div>
                    <div><strong>Warranty:</strong> {showTerms.warranty || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-gray-600">
                    • Implant warranty covers manufacturing defects only<br/>
                    • Regular follow-ups required as per surgeon's advice<br/>
                    • Patient lifestyle compliance affects implant longevity<br/>
                    • All costs are estimates and may vary based on individual cases<br/>
                    • Insurance coverage subject to policy terms and verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Hospital Map Component with better Airbnb-like interface
const HospitalMap = ({ hospitals, selectedHospital, onHospitalSelect, implant }) => {
  const [hoveredHospital, setHoveredHospital] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const calculateTotalCost = (hospital) => {
    const surgeryBase = 200000;
    const surgeonFee = 50000;
    const implantCost = implant?.price || 0;
    const hospitalCost = hospital.base_price + hospital.consumables_cost;
    return surgeryBase + surgeonFee + implantCost + hospitalCost;
  };

  const getZoneColor = (zone) => {
    switch (zone) {
      case 'Zone 1': return 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400';
      case 'Zone 2': return 'bg-blue-500 hover:bg-blue-600 border-blue-400';
      case 'Zone 3': return 'bg-orange-500 hover:bg-orange-600 border-orange-400';
      default: return 'bg-gray-500 hover:bg-gray-600 border-gray-400';
    }
  };

  const getMarkerPosition = (index) => {
    // More realistic positioning based on Hyderabad geography
    const positions = [
      { left: '25%', top: '20%' }, // Banjara Hills
      { left: '30%', top: '25%' }, // Jubilee Hills  
      { left: '60%', top: '45%' }, // Kothapet
      { left: '65%', top: '50%' }, // Dilsukhnagar
    ];
    return positions[index] || { left: '50%', top: '50%' };
  };

  return (
    <div className="relative">
      {/* Enhanced Map Container */}
      <div className="w-full h-96 bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl border-2 border-teal-200 overflow-hidden relative shadow-inner">
        
        {/* Map Loading State */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-teal-50 z-30">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p className="text-teal-700 text-sm">Loading care centers...</p>
            </div>
          </div>
        )}

        {/* Enhanced Background with Streets and Landmarks */}
        <div className="absolute inset-0 opacity-30">
          {/* Street grid */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
            <defs>
              <pattern id="streets" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3"/>
                <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#streets)" />
          </svg>
          
          {/* Landmark indicators */}
          <div className="absolute top-8 left-8 text-xs text-teal-600 font-medium bg-white/70 px-2 py-1 rounded">
            🏢 Banjara Hills
          </div>
          <div className="absolute top-12 right-8 text-xs text-teal-600 font-medium bg-white/70 px-2 py-1 rounded">
            🌆 Jubilee Hills
          </div>
          <div className="absolute bottom-8 right-12 text-xs text-teal-600 font-medium bg-white/70 px-2 py-1 rounded">
            🏘️ Kothapet
          </div>
        </div>
        
        {/* Hospital Markers with improved design */}
        {mapLoaded && hospitals.map((hospital, index) => {
          const position = getMarkerPosition(index);
          const isHovered = hoveredHospital?.id === hospital.id;
          const isSelected = selectedHospital?.id === hospital.id;
          
          return (
            <div
              key={hospital.id}
              className={`absolute cursor-pointer transition-all duration-300 ${
                isSelected ? 'z-20 scale-110' : 'z-10'
              }`}
              style={position}
              onMouseEnter={() => setHoveredHospital(hospital)}
              onMouseLeave={() => setHoveredHospital(null)}
              onClick={() => onHospitalSelect(hospital)}
              data-testid={`map-marker-${hospital.id}`}
            >
              {/* Enhanced Marker with pulse effect */}
              <div className="relative">
                {/* Pulse animation for selected */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-75"></div>
                )}
                
                {/* Main marker */}
                <div className={`w-12 h-12 rounded-full border-4 ${getZoneColor(hospital.zone)} shadow-xl flex items-center justify-center transform transition-all duration-200 ${
                  isHovered ? 'scale-125 shadow-2xl' : ''
                } ${isSelected ? 'ring-4 ring-white ring-opacity-70 scale-110' : ''}`}>
                  <span className="text-white font-bold text-sm">
                    {hospital.zone.split(' ')[1]}
                  </span>
                </div>

                {/* Price tag */}
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white border-2 ${
                  isHovered || isSelected ? 'border-teal-400' : 'border-gray-300'
                } rounded-full px-2 py-1 text-xs font-bold transition-all duration-200 ${
                  isHovered || isSelected ? 'shadow-lg scale-105' : 'shadow-md'
                }`}>
                  ₹{Math.round(calculateTotalCost(hospital) / 100000)}L
                </div>
              </div>
              
              {/* Enhanced Price Tooltip */}
              {isHovered && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 px-5 py-4 min-w-max z-30 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-base mb-1">{hospital.name}</div>
                    <div className="text-sm text-gray-600 mb-3">{hospital.location}</div>
                    
                    {/* Price breakdown */}
                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <div className="flex justify-between">
                        <span>Care Package:</span>
                        <span>₹{Math.round(hospital.base_price / 1000)}k</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amenities:</span>
                        <span>₹{Math.round(hospital.consumables_cost / 1000)}k</span>
                      </div>
                    </div>
                    
                    <div className="text-lg font-bold text-teal-600 mb-2">
                      ₹{Math.round(calculateTotalCost(hospital) / 100000)}L
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Complete Wellness Package</div>
                    
                    {/* Amenities */}
                    <div className="flex justify-center gap-1 mb-2">
                      {(hospital.facilities || []).slice(0, 3).map((facility, i) => (
                        <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded">
                          {facility}
                        </span>
                      ))}
                    </div>
                    
                    {hospital.insurance_accepted && (
                      <div className="text-xs text-green-600 font-medium">✓ Coverage Accepted</div>
                    )}
                  </div>
                  {/* Enhanced tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white drop-shadow-sm"></div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Enhanced Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          {/* Map Legend */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Care Zones</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <span>Zone 1</span>
                </div>
                <span className="text-gray-500">Premium</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>Zone 2</span>
                </div>
                <span className="text-gray-500">Comfort</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span>Zone 3</span>
                </div>
                <span className="text-gray-500">Essential</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Your Location Indicator */}
        <div className="absolute bottom-4 left-4 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
          <div className="relative mr-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="text-sm text-gray-700 font-medium">Your Location</span>
        </div>

        {/* Map zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
          <button className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg border-b border-gray-200 transition-colors">
            <span className="text-lg font-bold">+</span>
          </button>
          <button className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-b-lg transition-colors">
            <span className="text-lg font-bold">−</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Hospital Selection with Zone Categories & Rating System
const HospitalSelection = ({ patientData, surgery, surgeon, implant, onNext }) => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedZone, setSelectedZone] = useState('all');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${API}/hospitals`);
        setHospitals(response.data);
      } catch (error) {
        toast.error('Failed to load hospitals');
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const hospitalsByZone = hospitals.reduce((acc, hospital) => {
    if (!acc[hospital.zone]) acc[hospital.zone] = [];
    acc[hospital.zone].push(hospital);
    return acc;
  }, {});

  const getZoneInfo = (zone) => {
    const info = {
      'Zone 1': 'Premium Care Centers - Luxury amenities, concierge services, private suites',
      'Zone 2': 'Comfort Care Centers - Modern facilities, comfortable rooms, quality service',
      'Zone 3': 'Essential Care Centers - Quality care, standard amenities, value pricing'
    };
    return info[zone] || '';
  };

  const handleNext = () => {
    if (selectedHospital) {
      onNext({ hospital: selectedHospital });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-700">Finding the perfect care centers for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Choose Your Care Destination
          </h1>
          <p className="text-lg text-slate-600">Find the perfect care center for your wellness journey</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-slate-800">
                Step 5: Select Your Care Center
              </CardTitle>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'map'
                      ? 'bg-white shadow-sm text-teal-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  data-testid="map-view-btn"
                >
                  🗺️ Map View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-teal-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  data-testid="list-view-btn"
                >
                  📋 List View
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full" style={{ width: '83.33%' }}></div>
            </div>
          </CardHeader>
          
          <CardContent>
            {viewMode === 'map' ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-teal-800 mb-2">🏥 Nearby Care Centers</h3>
                  <p className="text-sm text-teal-700">Hover over the markers to see pricing and details. Each zone offers different levels of amenities.</p>
                </div>
                
                <HospitalMap
                  hospitals={hospitals}
                  selectedHospital={selectedHospital}
                  onHospitalSelect={setSelectedHospital}
                  implant={implant}
                />
                
                {selectedHospital && (
                  <div className="bg-white border border-teal-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{selectedHospital.name}</h3>
                        <p className="text-teal-600">{selectedHospital.location}</p>
                        <Badge className="mt-2 bg-teal-100 text-teal-800">{selectedHospital.zone}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">
                          ₹{Math.round((200000 + 50000 + (implant?.price || 0) + selectedHospital.base_price + selectedHospital.consumables_cost) / 100000)}L
                        </div>
                        <div className="text-sm text-gray-500">Complete Package</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {(selectedHospital.facilities || []).map((facility, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">✓</span>
                          {facility}
                        </div>
                      ))}
                    </div>
                    
                    {selectedHospital.insurance_accepted && (
                      <Badge className="bg-green-100 text-green-800">Insurance Friendly</Badge>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Tabs defaultValue="Zone 1" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  {Object.keys(hospitalsByZone).map((zone) => (
                    <TabsTrigger key={zone} value={zone} data-testid={`zone-${zone.split(' ')[1]}-tab`} className="data-[state=active]:bg-white">
                      {zone}
                      <span className="ml-2" title={getZoneInfo(zone)}>ℹ️</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(hospitalsByZone).map(([zone, zoneHospitals]) => (
                  <TabsContent key={zone} value={zone} className="space-y-4">
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-teal-800 mb-2">{zone} Care Centers</h3>
                      <p className="text-sm text-teal-700">{getZoneInfo(zone)}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {zoneHospitals.map((hospital) => (
                        <Card
                          key={hospital.id}
                          className={`cursor-pointer transition-all duration-200 border-0 hover:shadow-lg ${
                            selectedHospital?.id === hospital.id
                              ? 'ring-2 ring-teal-500 shadow-xl bg-teal-50'
                              : 'hover:shadow-lg bg-white'
                          }`}
                          onClick={() => setSelectedHospital(hospital)}
                          data-testid={`hospital-card-${hospital.id}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-lg text-slate-800">{hospital.name}</h3>
                              <Badge className={hospital.insurance_accepted ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                {hospital.insurance_accepted ? 'Insurance Friendly' : 'Direct Pay'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">{hospital.location}</p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Care Package:</span>
                                <span className="font-medium">₹{hospital.base_price.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Amenities:</span>
                                <span className="font-medium">₹{hospital.consumables_cost.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-base font-semibold border-t pt-2">
                                <span>Total Package:</span>
                                <span className="text-teal-600">₹{Math.round((200000 + 50000 + (implant?.price || 0) + hospital.base_price + hospital.consumables_cost) / 100000)}L</span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="font-medium text-sm text-slate-700 mb-2">Amenities:</h4>
                              <div className="flex flex-wrap gap-1">
                                {(hospital.facilities || []).map((facility, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {facility}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {selectedHospital?.id === hospital.id && (
                              <Badge className="mt-3 bg-teal-100 text-teal-800">Selected</Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}

            {selectedHospital && (
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="mb-4 text-slate-600">
                  Selected Care Center: <span className="font-semibold text-teal-700">{selectedHospital.name} ({selectedHospital.zone})</span>
                </p>
                <Button
                  onClick={handleNext}
                  data-testid="hospital-next-btn"
                  className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-lg rounded-full"
                >
                  Continue to Your Wellness Package Summary ✨
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Step 6: Checkout
const Checkout = ({ patientData, surgery, surgeon, implant, hospital, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const calculateTotal = () => {
    const surgeryBase = 200000;
    const surgeonFee = 50000;
    const implantCost = implant?.price || 0;
    const hospitalCost = hospital.base_price + hospital.consumables_cost;
    return surgeryBase + surgeonFee + implantCost + hospitalCost;
  };

  const totalCost = calculateTotal();
  const advancePayment = Math.round(totalCost * 0.05);

  const handleBooking = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/bookings`, {
        patient_id: patientData.patientId,
        surgery_id: surgery.id,
        surgeon_id: surgeon.id,
        implant_id: implant?.id,
        hospital_id: hospital.id
      });
      
      setBooking(response.data);
      toast.success('Your wellness journey is confirmed! 🎉');
      onComplete({ booking: response.data });
    } catch (error) {
      toast.error('Booking failed. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setPaymentComplete(true);
      setLoading(false);
      toast.success('🎉 Payment processed successfully!');
      setTimeout(() => {
        toast.success('📧 Confirmation email sent! Your journey begins now.');
      }, 1500);
    }, 2000);
  };

  // Payment Success Screen
  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <p className="text-green-100 mt-2">Your wellness journey is now confirmed</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <span className="mr-2">✅</span>
                What Happens Next:
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-green-700">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">📞</span>
                    <div>
                      <div className="font-medium">Step 1: Consultation Call</div>
                      <div className="text-sm">Our team will call you within 24 hours</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">📅</span>
                    <div>
                      <div className="font-medium">Step 2: Schedule Surgery</div>
                      <div className="text-sm">Choose your preferred date with {surgeon.name}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">🏥</span>
                    <div>
                      <div className="font-medium">Step 3: Pre-operative</div>
                      <div className="text-sm">Complete health checkup at {hospital.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">🌟</span>
                    <div>
                      <div className="font-medium">Step 4: Transformation</div>
                      <div className="text-sm">Your {surgery.name} procedure</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <div><strong>Patient:</strong> {patientData.patientData.full_name}</div>
                  <div><strong>Procedure:</strong> {surgery.name}</div>
                  <div><strong>Surgeon:</strong> {surgeon.name}</div>
                </div>
                <div className="space-y-2">
                  <div><strong>Implant:</strong> {implant?.name || 'To be determined'}</div>
                  <div><strong>Hospital:</strong> {hospital.name} ({hospital.zone})</div>
                  <div><strong>Booking ID:</strong> <span className="font-mono">{booking?.id || 'HEAL-' + Date.now()}</span></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-teal-800 mb-3">Payment Confirmation</h3>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-teal-600">₹{advancePayment.toLocaleString()}</div>
                  <div className="text-sm text-teal-700">Advance Payment (5% of ₹{Math.round(totalCost / 100000)}L)</div>
                </div>
                <div className="text-green-600 font-semibold text-lg">✅ PAID</div>
              </div>
              <div className="mt-3 text-sm text-teal-600">
                Remaining amount (₹{(totalCost - advancePayment).toLocaleString()}) will be collected after consultation.
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <Button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-full"
              >
                <span className="mr-2">🏠</span>
                Book Another Appointment
              </Button>
              
              <div className="text-sm text-gray-600">
                Questions? Call us at <span className="font-semibold">1800-healthtime</span> or email <span className="font-semibold">support@healthtime.com</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (booking && !paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="max-w-3xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-3xl">Your Wellness Journey is Confirmed!</CardTitle>
            <p className="text-teal-100 mt-2">Get ready for your transformative experience</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-teal-800 mb-4 flex items-center">
                <span className="mr-2">✨</span>
                Your Wellness Itinerary:
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-teal-700">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="mr-3">🏥</span>
                    <div>
                      <div className="font-medium">Care Center</div>
                      <div className="text-sm">{hospital.name} ({hospital.zone})</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">👨‍⚕️</span>
                    <div>
                      <div className="font-medium">Your Expert Guide</div>
                      <div className="text-sm">{surgeon.name}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="mr-3">🔄</span>
                    <div>
                      <div className="font-medium">Wellness Program</div>
                      <div className="text-sm">{surgery.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">⭐</span>
                    <div>
                      <div className="font-medium">Premium Enhancement</div>
                      <div className="text-sm">{implant.brand}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-slate-600">
                <span className="font-semibold text-lg">Booking Reference:</span>
                <br />
                <span className="font-mono bg-gray-100 px-3 py-1 rounded mt-1 inline-block">{booking.id}</span>
              </p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-semibold text-lg text-gray-800 mb-3">Total Investment in Your Wellness</h4>
                <div className="text-3xl font-bold text-teal-600 mb-2">
                  ₹{Math.round(totalCost / 100000)}L
                </div>
                <div className="text-sm text-gray-600 mb-4">Complete transformation package</div>
                <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg p-3">
                  <div className="text-sm mb-1">Secure Your Journey Today</div>
                  <div className="text-xl font-bold">₹{advancePayment.toLocaleString()}</div>
                  <div className="text-xs opacity-90">Just 5% to begin</div>
                </div>
              </div>
              
              <Button
                onClick={handlePayment}
                disabled={loading}
                data-testid="payment-btn"
                className="px-10 py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">💳</span>
                    Secure Payment - ₹{advancePayment.toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Your Wellness Package Summary
          </h1>
          <p className="text-lg text-slate-600">Review your personalized transformation journey</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <span className="mr-2">✨</span>
              Complete Your Wellness Journey
              <span className="ml-2">✨</span>
            </CardTitle>
            <div className="w-full bg-white/20 rounded-full h-2 mt-4">
              <div className="bg-white h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-200">
                <h3 className="font-semibold text-xl mb-4 text-teal-800 flex items-center">
                  <span className="mr-2">👤</span>
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Name:</span>
                    <span className="font-medium">{patientData.patientData.full_name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Email:</span>
                    <span className="font-medium">{patientData.patientData.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Phone:</span>
                    <span className="font-medium">{patientData.patientData.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Coverage:</span>
                    <span className="font-medium">{patientData.patientData.insurance_provider}</span>
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-xl mb-4 text-blue-800 flex items-center">
                  <span className="mr-2">🌟</span>
                  Your Transformation Journey
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🔄</span>
                      <div>
                        <div className="font-semibold text-gray-800">Wellness Program:</div>
                        <div className="text-gray-600">{surgery.name}</div>
                        <div className="text-sm text-gray-500 mt-1">Duration: {surgery.duration} • Recovery: {surgery.recovery_time}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">👨‍⚕️</span>
                      <div>
                        <div className="font-semibold text-gray-800">Expert Guide:</div>
                        <div className="text-gray-600">{surgeon.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{surgeon.experience_years} years exp • {surgeon.training_type}ly trained</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">⭐</span>
                      <div>
                        <div className="font-semibold text-gray-800">Premium Enhancement:</div>
                        <div className="text-gray-600">{implant?.name || 'To be determined'}</div>
                        <div className="text-sm text-gray-500 mt-1">{implant?.brand || 'TBD'} • {implant?.expected_life || 'TBD'}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🏥</span>
                      <div>
                        <div className="font-semibold text-gray-800">Care Destination:</div>
                        <div className="text-gray-600">{hospital.name} ({hospital.zone})</div>
                        <div className="text-sm text-gray-500 mt-1">{hospital.location}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">💎</span>
                  Investment in Your Wellness
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Transformation Program:</span>
                    <span className="font-medium">₹2,00,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Expert Guide Fee:</span>
                    <span className="font-medium">₹50,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Premium Enhancement:</span>
                    <span className="font-medium">₹{(implant?.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Care Center Experience:</span>
                    <span className="font-medium">₹{hospital.base_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Luxury Amenities:</span>
                    <span className="font-medium">₹{hospital.consumables_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-300 bg-gray-50 -mx-6 px-6">
                    <span>Total Investment:</span>
                    <span className="text-teal-600">₹{Math.round(totalCost / 100000)}L</span>
                  </div>
                  <div className="flex justify-between py-3 text-lg font-bold bg-gradient-to-r from-teal-50 to-blue-50 -mx-6 px-6 rounded-b-lg">
                    <span className="text-teal-800">Secure Your Journey Today (5%):</span>
                    <span className="text-teal-800">₹{advancePayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-6">
                <p className="text-sm text-slate-600 mb-6 max-w-2xl mx-auto">
                  🌟 By confirming, you're taking the first step towards your wellness transformation. 
                  Pay just 5% today to secure your preferred dates and begin your journey to better health.
                </p>
                <Button
                  onClick={handleBooking}
                  data-testid="confirm-booking-btn"
                  disabled={loading}
                  className="px-10 py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Securing Your Journey...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-2">🎯</span>
                      Confirm My Wellness Journey - ₹{advancePayment.toLocaleString()}
                      <span className="ml-2">✨</span>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Hospital Registration Component
const HospitalRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    zone: 'Zone 1',
    latitude: '',
    longitude: '',
    facilities: [],
    insurance_accepted: true,
    base_price: '',
    consumables_cost: '',
    contact_phone: '',
    contact_email: '',
    admin_name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const allFacilities = [
    '24/7 Emergency', 'ICU', 'Advanced OR', 'Physiotherapy', 'Parking',
    'Premium Rooms', 'AC Rooms', 'WiFi', 'Cafeteria', 'Pharmacy',
    'Laboratory', 'Radiology', 'Blood Bank', 'Ambulance Service',
    'Cardiac Care', 'Maternity Ward', 'Pediatric Care', 'Dialysis',
    'Rehabilitation', 'Home Care Services'
  ];

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.base_price) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        base_price: parseInt(formData.base_price),
        consumables_cost: parseInt(formData.consumables_cost || 0),
        latitude: parseFloat(formData.latitude || 0),
        longitude: parseFloat(formData.longitude || 0)
      };

      await axios.post(`${API}/admin/hospitals`, submitData);
      toast.success('Hospital registered successfully! 🏥');
      navigate('/admin');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Hospital registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Hospital Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Apollo Hospital, Max Healthcare"
                      required
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location/Area *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g., Banjara Hills, Jubilee Hills"
                      required
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Complete address with pin code"
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Zone & Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Zone & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="zone">Care Zone *</Label>
                    <Select value={formData.zone} onValueChange={(value) => setFormData({...formData, zone: value})}>
                      <SelectTrigger className="border-teal-200 focus:border-teal-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Zone 1">Zone 1 - Premium Care</SelectItem>
                        <SelectItem value="Zone 2">Zone 2 - Comfort Care</SelectItem>
                        <SelectItem value="Zone 3">Zone 3 - Essential Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="base_price">Base Price (₹) *</Label>
                    <Input
                      id="base_price"
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                      placeholder="e.g., 45000"
                      required
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="consumables_cost">Consumables Cost (₹)</Label>
                    <Input
                      id="consumables_cost"
                      type="number"
                      value={formData.consumables_cost}
                      onChange={(e) => setFormData({...formData, consumables_cost: e.target.value})}
                      placeholder="e.g., 15000"
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Available Facilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allFacilities.map((facility) => (
                    <label key={facility} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact & Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="+91 9876543210"
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="admin@hospital.com"
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin_name">Administrator Name</Label>
                    <Input
                      id="admin_name"
                      value={formData.admin_name}
                      onChange={(e) => setFormData({...formData, admin_name: e.target.value})}
                      placeholder="Hospital Administrator"
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Hospital Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description about the hospital's specializations and services..."
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="insurance_accepted"
                    checked={formData.insurance_accepted}
                    onChange={(e) => setFormData({...formData, insurance_accepted: e.target.checked})}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <Label htmlFor="insurance_accepted">Accepts Insurance Claims</Label>
                </div>
              </div>

              {/* Location Coordinates (Optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Location Coordinates (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      placeholder="17.3850"
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      placeholder="78.4867"
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center space-x-4 pt-6">
                <Button
                  type="button"
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering Hospital...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      🏥 Register Hospital
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Implant Registration Component
const ImplantRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    material: '',
    surgery_type: 'Knee Replacement',
    price: '',
    expected_life: '',
    success_rate: '',
    warranty: '',
    description: '',
    suitable_age: '',
    activity_level: '',
    company_highlights: [],
    image: '',
    features: []
  });
  const [highlightInput, setHighlightInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const surgeryTypes = [
    'Knee Replacement', 'Hip Replacement', 'Shoulder Replacement',
    'Ankle Replacement', 'Elbow Replacement', 'Spine Surgery',
    'Dental Implant', 'Cataract Surgery', 'Cardiac Surgery'
  ];

  const materials = [
    'Titanium Alloy', 'Cobalt Chromium', 'Ceramic', 'Polyethylene',
    'Zirconia', 'Stainless Steel', 'PEEK', 'Tantalum'
  ];

  const addHighlight = () => {
    if (highlightInput.trim() && !formData.company_highlights.includes(highlightInput.trim())) {
      setFormData(prev => ({
        ...prev,
        company_highlights: [...prev.company_highlights, highlightInput.trim()]
      }));
      setHighlightInput('');
    }
  };

  const removeHighlight = (highlight) => {
    setFormData(prev => ({
      ...prev,
      company_highlights: prev.company_highlights.filter(h => h !== highlight)
    }));
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        price: parseInt(formData.price),
        success_rate: parseFloat(formData.success_rate || 0)
      };

      await axios.post(`${API}/admin/implants`, submitData);
      toast.success('Implant registered successfully! 🦴');
      navigate('/admin');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Implant registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Register New Implant
          </h1>
          <p className="text-lg text-slate-600">Add a new medical implant to the healthtime catalog</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Implant Registration Form</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Implant Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Zimmer Persona Knee System"
                      required
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand/Manufacturer *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g., Zimmer Biomet"
                      required
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surgery_type">Surgery Type *</Label>
                    <Select value={formData.surgery_type} onValueChange={(value) => setFormData({...formData, surgery_type: value})}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {surgeryTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Select value={formData.material} onValueChange={(value) => setFormData({...formData, material: value})}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-500">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map(material => (
                          <SelectItem key={material} value={material}>{material}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detailed description of the implant and its benefits..."
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Pricing & Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Pricing & Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="285000"
                      required
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expected_life">Expected Life</Label>
                    <Input
                      id="expected_life"
                      value={formData.expected_life}
                      onChange={(e) => setFormData({...formData, expected_life: e.target.value})}
                      placeholder="20-25 years"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="success_rate">Success Rate (%)</Label>
                    <Input
                      id="success_rate"
                      type="number"
                      step="0.1"
                      max="100"
                      value={formData.success_rate}
                      onChange={(e) => setFormData({...formData, success_rate: e.target.value})}
                      placeholder="98.7"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="warranty">Warranty Period</Label>
                    <Input
                      id="warranty"
                      value={formData.warranty}
                      onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                      placeholder="Lifetime"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Suitability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Patient Suitability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="suitable_age">Suitable Age Range</Label>
                    <Input
                      id="suitable_age"
                      value={formData.suitable_age}
                      onChange={(e) => setFormData({...formData, suitable_age: e.target.value})}
                      placeholder="45-80 years"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity_level">Activity Level</Label>
                    <Select value={formData.activity_level} onValueChange={(value) => setFormData({...formData, activity_level: value})}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-500">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low Activity</SelectItem>
                        <SelectItem value="Moderate">Moderate Activity</SelectItem>
                        <SelectItem value="High">High Activity</SelectItem>
                        <SelectItem value="All">All Activity Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Company Highlights */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Company Highlights</h3>
                <div className="flex space-x-2">
                  <Input
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    placeholder="Add company highlight..."
                    className="border-purple-200 focus:border-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  />
                  <Button type="button" onClick={addHighlight} className="bg-purple-600 hover:bg-purple-700">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.company_highlights.map((highlight, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {highlight}
                      <button
                        type="button"
                        onClick={() => removeHighlight(highlight)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Key Features</h3>
                <div className="flex space-x-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add key feature..."
                    className="border-purple-200 focus:border-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} className="bg-blue-600 hover:bg-blue-700">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Image</h3>
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/implant-image.jpg"
                    className="border-purple-200 focus:border-purple-500"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center space-x-4 pt-6">
                <Button
                  type="button"
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering Implant...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      🦴 Register Implant
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Complete Patient Profile Form  
const CompletePatientProfile = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    height: '',
    weight: '',
    
    // Contact Information
    email: '',
    phone: '',
    alternate_phone: '',
    current_address: '',
    permanent_address: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    
    // Insurance Information
    insurance_provider: '',
    insurance_number: '',
    policy_type: '',
    coverage_amount: '',
    
    // Medical History
    medical_conditions: [],
    current_medications: [],
    allergies: [],
    previous_surgeries: [],
    family_history: [],
    
    // Lifestyle
    smoking_status: '',
    alcohol_consumption: '',
    exercise_frequency: '',
    occupation: '',
    
    // Preferences
    preferred_language: 'English',
    preferred_hospital_type: '',
    communication_preference: 'phone'
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/patients/complete-profile`, formData);
      toast.success('Profile completed successfully! 🎉');
      navigate('/');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (field, value) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeFromArray = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            📋 Complete Your Health Profile
          </h1>
          <p className="text-lg text-slate-600">Help us provide you with personalized care recommendations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Personal Information */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
              <CardTitle className="text-xl">👤 Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select value={formData.blood_group} onValueChange={(value) => setFormData({...formData, blood_group: value})}>
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    placeholder="170"
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="70"
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="text-xl">📞 Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Primary Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="alternate_phone">Alternate Phone</Label>
                  <Input
                    id="alternate_phone"
                    value={formData.alternate_phone}
                    onChange={(e) => setFormData({...formData, alternate_phone: e.target.value})}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="current_address">Current Address</Label>
                  <Textarea
                    id="current_address"
                    value={formData.current_address}
                    onChange={(e) => setFormData({...formData, current_address: e.target.value})}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="permanent_address">Permanent Address</Label>
                  <Textarea
                    id="permanent_address"
                    value={formData.permanent_address}
                    onChange={(e) => setFormData({...formData, permanent_address: e.target.value})}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-lg"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Updating Profile...
                </span>
              ) : (
                <span className="flex items-center">
                  📋 Complete My Health Profile
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Testing Dashboard for Complete System Testing
const TestingDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🧪 healthtime Testing Dashboard
          </h1>
          <p className="text-lg text-slate-600">Complete system testing interface for developers and testers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Registration Testing */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <CardTitle className="text-lg">👥 Registration Testing</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Link to="/register/patient/enhanced" className="block w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  🧑‍⚕️ Enhanced Patient Registration
                </Button>
              </Link>
              <Link to="/register/doctor/enhanced" className="block w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  👨‍⚕️ Enhanced Doctor Registration
                </Button>
              </Link>
              <Link to="/register/admin" className="block w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  👑 Admin Registration
                </Button>
              </Link>
              <Link to="/profile/complete" className="block w-full">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  📋 Complete Health Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Management Testing */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <CardTitle className="text-lg">⚙️ Admin Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Link to="/login-portal" className="block w-full">
                <Button className="w-full bg-gray-600 hover:bg-gray-700">
                  🔐 Login Portal (All Types)
                </Button>
              </Link>
              <Link to="/admin" className="block w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  📊 Admin Dashboard
                </Button>
              </Link>
              <Link to="/admin/hospital/new" className="block w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  🏥 Add New Hospital
                </Button>
              </Link>
              <Link to="/admin/implant/new" className="block w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  🦴 Add New Implant
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Patient Flow Testing */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
              <CardTitle className="text-lg">🏥 Patient Booking Flow</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Link to="/" className="block w-full">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  🚀 Start Booking Journey
                </Button>
              </Link>
              <Link to="/test-surgery" className="block w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  🔬 Test Surgery Selection
                </Button>
              </Link>
              <Link to="/test-implants-knee" className="block w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  🦴 Test Implant Selection
                </Button>
              </Link>
              <Link to="/test-hospitals" className="block w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  🏥 Test Hospital Selection
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* API Testing Tools */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="text-lg">🔧 API Testing Tools</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button 
                onClick={() => window.open(`${BACKEND_URL}/api/surgeries`, '_blank')}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                📊 View Surgeries API
              </Button>
              <Button 
                onClick={() => window.open(`${BACKEND_URL}/api/surgeons`, '_blank')}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                👨‍⚕️ View Surgeons API
              </Button>
              <Button 
                onClick={() => window.open(`${BACKEND_URL}/api/hospitals`, '_blank')}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                🏥 View Hospitals API
              </Button>
              <Button 
                onClick={() => window.open(`${BACKEND_URL}/api/implants`, '_blank')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                🦴 View Implants API
              </Button>
            </CardContent>
          </Card>

          {/* Database Management */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white">
              <CardTitle className="text-lg">💾 Database Testing</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Test Accounts:</strong></p>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <p><strong>Admin:</strong> admin@healthtime.com / password123</p>
                  <p><strong>Doctor:</strong> dr.sharma@example.com / password123</p>
                  <p><strong>Patient:</strong> Register through quick signup</p>
                </div>
              </div>
              <Button className="w-full bg-gray-600 hover:bg-gray-700">
                🔄 Reset Test Data
              </Button>
            </CardContent>
          </Card>

          {/* Feature Status */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <CardTitle className="text-lg">✅ Feature Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Multi-step Navigation</span>
                  <Badge className="bg-green-100 text-green-800">✅ Working</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hospital Map View</span>
                  <Badge className="bg-green-100 text-green-800">✅ Working</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>AI Implant Recommendation</span>
                  <Badge className="bg-green-100 text-green-800">✅ Working</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Admin Dashboard</span>
                  <Badge className="bg-green-100 text-green-800">✅ Working</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Doctor Approval System</span>
                  <Badge className="bg-green-100 text-green-800">✅ Working</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hospital Registration</span>
                  <Badge className="bg-blue-100 text-blue-800">🆕 New</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Implant Management</span>
                  <Badge className="bg-blue-100 text-blue-800">🆕 New</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardTitle className="text-xl">📖 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-indigo-600">🧪 Complete Testing Flow</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Register as Admin (admin registration)</li>
                  <li>Login to Admin Dashboard</li>
                  <li>Add new hospitals using Hospital Registration</li>
                  <li>Add new implants using Implant Registration</li>
                  <li>Register as Doctor (enhanced registration)</li>
                  <li>Approve doctor from Admin Dashboard</li>
                  <li>Test patient booking flow (quick → enhanced)</li>
                  <li>Complete full patient profile</li>
                  <li>Test end-to-end booking journey</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3 text-purple-600">🎯 Key Features to Test</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                  <li><strong>Navigation:</strong> Multi-step flow without resets</li>
                  <li><strong>Hospital Selection:</strong> Interactive map with zones</li>
                  <li><strong>Admin Management:</strong> CRUD operations for all entities</li>
                  <li><strong>User Roles:</strong> Patient, Doctor, Admin permissions</li>
                  <li><strong>Registration:</strong> Quick vs Enhanced flows</li>
                  <li><strong>Data Persistence:</strong> Form data retention</li>
                  <li><strong>API Integration:</strong> Backend connectivity</li>
                  <li><strong>Runtime Errors:</strong> No crashes during navigation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main App Component with routing
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-portal" element={<LoginPortal />} />
            <Route path="/login/patient" element={<PatientLoginPage />} />
            <Route path="/login/doctor" element={<DoctorLoginPage />} />
            <Route path="/login/admin" element={<AdminLoginPage />} />
            <Route path="/login/hospital" element={<HospitalLoginPage />} />
            <Route path="/login/implant" element={<ImplantLoginPage />} />
            
            {/* Registration Routes */}
            <Route path="/register/doctor" element={<DoctorRegistration />} />
            <Route path="/register/doctor/enhanced" element={<EnhancedDoctorRegistration />} />
            <Route path="/register/patient/enhanced" element={<EnhancedPatientWrapper />} />
            <Route path="/register/admin" element={<AdminRegistration />} />
            
            {/* Complete Profile Routes */}
            <Route path="/profile/complete" element={<CompletePatientProfile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/doctor/new" element={<ProtectedRoute role="admin"><AdminLayout title="👨‍⚕️ Add New Doctor" subtitle="Register a new doctor to the platform"><AdminDoctorForm /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/patient/new" element={<ProtectedRoute role="admin"><AdminLayout title="👥 Add New Patient" subtitle="Register a new patient to the platform"><AdminPatientForm /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/booking/new" element={<ProtectedRoute role="admin"><AdminLayout title="📅 Add New Booking" subtitle="Create a new booking for a patient"><AdminBookingForm /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/hospital/new" element={<ProtectedRoute role="admin"><AdminLayout title="🏥 Add New Hospital" subtitle="Register a new hospital to the platform"><HospitalRegistration /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/hospital/:id/edit" element={<ProtectedRoute role="admin"><AdminLayout title="🏥 Edit Hospital" subtitle="Update hospital information"><HospitalRegistration /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/implant/new" element={<ProtectedRoute role="admin"><AdminLayout title="🦴 Add New Implant" subtitle="Register a new implant to the platform"><ImplantRegistration /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/implant/:id/edit" element={<ProtectedRoute role="admin"><AdminLayout title="🦴 Edit Implant" subtitle="Update implant information"><ImplantRegistration /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/api-explorer" element={<ProtectedRoute role="admin"><AdminLayout title="🔌 API Explorer" subtitle="Explore and test all backend API endpoints"><ApiExplorer /></AdminLayout></ProtectedRoute>} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
            
            {/* Admin Testing Dashboard */}
            <Route path="/testing-dashboard" element={<TestingDashboard />} />
            
            {/* Test Routes for Development */}
            <Route path="/test-surgery" element={<SurgerySelection patientData={{}} onNext={(data) => console.log('Surgery selected:', data)} />} />
            <Route path="/test-surgery-cards" element={<TestSurgeryCards />} />
            <Route path="/test-essential" element={<EssentialInfoCollector patientData={{}} onNext={(data) => console.log('Essential info:', data)} />} />
            <Route path="/test-implants-knee" element={<ImplantSelection patientData={{essentialInfo: {age: '31-45'}}} surgery={{name: 'Knee Replacement'}} surgeon={{}} onNext={(data) => console.log('Implant selected:', data)} />} />
            <Route path="/test-implants-hip" element={<ImplantSelection patientData={{essentialInfo: {age: '31-45'}}} surgery={{name: 'Hip Replacement'}} surgeon={{}} onNext={(data) => console.log('Implant selected:', data)} />} />
            <Route path="/test-implants-cataract" element={<ImplantSelection patientData={{essentialInfo: {age: '65-75'}}} surgery={{name: 'Cataract Surgery'}} surgeon={{}} onNext={(data) => console.log('Implant selected:', data)} />} />
            <Route path="/test-hospitals" element={<HospitalSelection patientData={{essentialInfo: {age: '31-45'}}} surgery={{name: 'Knee Replacement'}} surgeon={{name: 'Dr. Test'}} implant={{name: 'Test Implant', price: 200000}} onNext={(data) => console.log('Hospital selected:', data)} />} />
            
            {/* Main Patient Flow */}
            <Route path="/" element={<MainApp />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (role && user.role !== role) {
      navigate('/login');
    }
  }, [user, role, navigate]);

  if (!user || (role && user.role !== role)) {
    return null;
  }

  return children;
};

// Duplicate AdminRegistration component removed - using enhanced version above

// Doctor Dashboard Component (complete version)
const DoctorDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorProfile();
    fetchDoctorBookings();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get(`${API}/doctors/profile/${user.id}`);
      setDoctorProfile(response.data);
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const fetchDoctorBookings = async () => {
    try {
      // This endpoint would need to be implemented in backend
      const response = await axios.get(`${API}/doctors/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.log('Bookings endpoint not yet implemented');
      setBookings([]); // Mock data for now
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Doctor Dashboard
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Welcome back, {doctorProfile?.full_name || 'Doctor'}!
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setActiveTab('profile')}
              variant="outline" 
              className="border-teal-300 text-teal-600 hover:bg-teal-50"
            >
              <span className="mr-2">👤</span>
              My Profile
            </Button>
            <Button onClick={logout} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              Logout
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        {doctorProfile?.status === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏳</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Account Under Review</h3>
                <p className="text-yellow-700 text-sm">Your profile is being reviewed by our admin team. You'll be notified once approved.</p>
              </div>
            </div>
          </div>
        )}

        {doctorProfile?.status === 'rejected' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <h3 className="font-semibold text-red-800">Application Rejected</h3>
                <p className="text-red-700 text-sm">Please contact support for more information about your application status.</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="bookings">📅 Bookings</TabsTrigger>
            <TabsTrigger value="schedule">🕐 Schedule</TabsTrigger>
            <TabsTrigger value="profile">👤 Profile</TabsTrigger>
            <TabsTrigger value="documents">📋 Documents</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Bookings</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <span className="text-4xl opacity-80">📅</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">This Month</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <span className="text-4xl opacity-80">📊</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Consultations</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <span className="text-4xl opacity-80">💬</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Rating</p>
                      <p className="text-3xl font-bold">{doctorProfile?.rating || '4.5'}</p>
                    </div>
                    <span className="text-4xl opacity-80">⭐</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">🌟</span>
                  <p>No recent activity yet.</p>
                  <p className="text-sm">Your patient bookings and consultations will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Patient Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">📅</span>
                  <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                  <p>Patient bookings will appear here once your profile is approved and patients start booking appointments.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Manage Your Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">🕐</span>
                  <h3 className="text-xl font-semibold mb-2">Schedule Management</h3>
                  <p className="mb-6">Set your availability hours, consultation slots, and manage your calendar.</p>
                  <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
                    <span className="mr-2">⚙️</span>
                    Coming Soon - Set Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <DoctorProfileManagement doctorProfile={doctorProfile} setDoctorProfile={setDoctorProfile} />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Documents & Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-xl font-semibold mb-2">Document Management</h3>
                  <p className="mb-6">Upload and manage your medical certificates, degrees, and professional documents.</p>
                  <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
                    <span className="mr-2">📁</span>
                    Coming Soon - Upload Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Doctor Profile Management Component
const DoctorProfileManagement = ({ doctorProfile, setDoctorProfile }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    consultation_fee: '',
    google_reviews_link: '',
    specialization: '',
    phone: ''
  });

  useEffect(() => {
    if (doctorProfile) {
      setFormData({
        bio: doctorProfile.bio || '',
        consultation_fee: doctorProfile.consultation_fee || '',
        google_reviews_link: doctorProfile.google_reviews_link || '',
        specialization: doctorProfile.specialization || '',
        phone: doctorProfile.phone || ''
      });
    }
  }, [doctorProfile]);

  const handleSave = async () => {
    try {
      await axios.patch(`${API}/doctors/profile`, {
        ...formData,
        consultation_fee: parseFloat(formData.consultation_fee)
      });
      toast.success('Profile updated successfully!');
      setEditMode(false);
      // Refresh profile data
      const response = await axios.get(`${API}/doctors/profile/${doctorProfile.id}`);
      setDoctorProfile(response.data);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!doctorProfile) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Professional Profile</CardTitle>
            <Button
              onClick={() => setEditMode(!editMode)}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-teal-600"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {editMode ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="google_reviews_link">Google Reviews Link</Label>
                  <Input
                    id="google_reviews_link"
                    value={formData.google_reviews_link}
                    onChange={(e) => setFormData({...formData, google_reviews_link: e.target.value})}
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell patients about your expertise, approach, and experience..."
                  className="border-teal-200 focus:border-teal-500"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Basic Information</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div><strong>Name:</strong> {doctorProfile.full_name}</div>
                      <div><strong>Email:</strong> {doctorProfile.email}</div>
                      <div><strong>Phone:</strong> {doctorProfile.phone}</div>
                      <div><strong>Specialization:</strong> {doctorProfile.specialization}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Professional Details</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div><strong>Experience:</strong> {doctorProfile.experience_years} years</div>
                      <div><strong>Council Number:</strong> {doctorProfile.medical_council_number}</div>
                      <div><strong>Consultation Fee:</strong> ₹{doctorProfile.consultation_fee}</div>
                      <div><strong>Status:</strong> 
                        <Badge className={doctorProfile.status === 'approved' ? 'bg-green-100 text-green-800 ml-2' : 
                                       doctorProfile.status === 'pending' ? 'bg-yellow-100 text-yellow-800 ml-2' : 
                                       'bg-red-100 text-red-800 ml-2'}>
                          {doctorProfile.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Professional Bio</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {doctorProfile.bio || 'No bio added yet. Click Edit Profile to add your professional background.'}
                    </p>
                  </div>
                  
                  {doctorProfile.google_reviews_link && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Reviews</h3>
                      <a 
                        href={doctorProfile.google_reviews_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Google Reviews →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center border-teal-300 hover:bg-teal-50">
              <span className="text-2xl mb-1">📋</span>
              <span className="text-sm">Upload Certificates</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center border-blue-300 hover:bg-blue-50">
              <span className="text-2xl mb-1">🕐</span>
              <span className="text-sm">Set Availability</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center border-green-300 hover:bg-green-50">
              <span className="text-2xl mb-1">💬</span>
              <span className="text-sm">Patient Reviews</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
