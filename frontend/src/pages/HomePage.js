import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">🏥</span> healthtime
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link to="/login-portal">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register/patient">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your Health, Our Priority
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with top surgeons, book procedures, and manage your healthcare journey 
            with our comprehensive medical platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register/patient">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Book a Surgery
              </Button>
            </Link>
            <Link to="/register/doctor">
              <Button size="lg" variant="outline">
                Join as Doctor
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">👨‍⚕️</div>
              <CardTitle>Expert Surgeons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect with board-certified surgeons and specialists for your medical needs.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">📅</div>
              <CardTitle>Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Schedule your procedures with our streamlined booking system.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">🏥</div>
              <CardTitle>Quality Care</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access top-rated hospitals and medical facilities in your area.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-8">Quick Access</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/login/patient" className="block">
              <Button variant="outline" className="w-full h-16 text-lg">
                🏥 Patient Portal
              </Button>
            </Link>
            <Link to="/login/doctor" className="block">
              <Button variant="outline" className="w-full h-16 text-lg">
                👨‍⚕️ Doctor Portal
              </Button>
            </Link>
            <Link to="/login/hospital" className="block">
              <Button variant="outline" className="w-full h-16 text-lg">
                🏢 Hospital Portal
              </Button>
            </Link>
            <Link to="/api-explorer" className="block">
              <Button variant="outline" className="w-full h-16 text-lg">
                🔧 API Explorer
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 healthtime. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
