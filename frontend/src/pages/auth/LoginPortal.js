import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const LoginPortal = () => {
  const loginOptions = [
    {
      title: 'Patient Login',
      description: 'Access your medical records and book appointments',
      icon: '🏥',
      path: '/login/patient',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Doctor Login',
      description: 'Manage your practice and patient appointments',
      icon: '👨‍⚕️',
      path: '/login/doctor',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Admin Login',
      description: 'System administration and management',
      icon: '⚙️',
      path: '/login/admin',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Hospital Login',
      description: 'Hospital management and operations',
      icon: '🏢',
      path: '/login/hospital',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Implant Manufacturer',
      description: 'Manage implant products and inventory',
      icon: '🦴',
      path: '/login/implant',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-blue-600">🏥</span> healthtime Login Portal
          </h1>
          <p className="text-xl text-gray-600">
            Choose your login type to access your dashboard
          </p>
        </div>

        {/* Login Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loginOptions.map((option, index) => (
            <Link key={index} to={option.path} className="block group">
              <Card className="h-full transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer border-2 hover:border-blue-200">
                <CardHeader className={`bg-gradient-to-r ${option.color} text-white rounded-t-lg`}>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{option.icon}</div>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-blue-50 group-hover:border-blue-300"
                  >
                    Login Now →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Registration Links */}
        <div className="text-center">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Don't have an account?</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register/patient">
                  <Button variant="outline" size="sm">Register as Patient</Button>
                </Link>
                <Link to="/register/doctor">
                  <Button variant="outline" size="sm">Register as Doctor</Button>
                </Link>
                <Link to="/register/hospital">
                  <Button variant="outline" size="sm">Register Hospital</Button>
                </Link>
                <Link to="/register/implant">
                  <Button variant="outline" size="sm">Register Manufacturer</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;
