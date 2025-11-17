import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HospitalDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      // Fetch hospital profile using the current user's hospital
      const profileResponse = await axios.get(`${API}/hospitals/my-hospital`);
      const hospitalData = profileResponse.data;
      setHospitalProfile(hospitalData);
      
      // Use the actual hospital ID for subsequent requests
      const hospitalId = hospitalData.id;
      
      // Fetch hospital bookings
      try {
        const bookingsResponse = await axios.get(`${API}/hospitals/${hospitalId}/bookings`);
        setBookings(bookingsResponse.data);
      } catch (bookingError) {
        console.log('No bookings found:', bookingError);
        setBookings([]);
      }

      // Fetch analytics
      try {
        const analyticsResponse = await axios.get(`${API}/hospitals/${hospitalId}/analytics`);
        setAnalytics(analyticsResponse.data);
      } catch (analyticsError) {
        console.log('No analytics found:', analyticsError);
      }
    } catch (error) {
      console.error('Failed to fetch hospital data:', error);
      toast.error('Failed to load hospital data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hospital Dashboard
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Welcome back, {hospitalProfile?.name || 'Hospital'}! 🏥
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setActiveTab('profile')}
              variant="outline" 
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <span className="mr-2">🏥</span>
              Hospital Profile
            </Button>
            <Button onClick={logout} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              <span className="mr-2">🚪</span>
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="bookings">📅 Bookings</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
            <TabsTrigger value="profile">🏥 Profile</TabsTrigger>
            <TabsTrigger value="documents">📋 Documents</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Bookings</p>
                      <p className="text-3xl font-bold">{analytics?.total_bookings || 0}</p>
                    </div>
                    <span className="text-4xl opacity-80">📅</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Confirmed</p>
                      <p className="text-3xl font-bold">{analytics?.confirmed_bookings || 0}</p>
                    </div>
                    <span className="text-4xl opacity-80">✅</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Pending</p>
                      <p className="text-3xl font-bold">{analytics?.pending_bookings || 0}</p>
                    </div>
                    <span className="text-4xl opacity-80">⏳</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Revenue</p>
                      <p className="text-3xl font-bold">₹{(analytics?.total_revenue || 0).toLocaleString()}</p>
                    </div>
                    <span className="text-4xl opacity-80">💰</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl mb-4 block">📅</span>
                    <p className="text-xl">No bookings yet</p>
                    <p className="text-sm">Patient bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{booking.patient?.full_name || 'Patient'}</p>
                          <p className="text-sm text-slate-600">
                            {booking.surgery?.name || 'Surgery'} • Dr. {booking.doctor?.full_name || 'Doctor'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {booking.surgery_date ? new Date(booking.surgery_date).toLocaleDateString() : 'Date TBD'}
                          </p>
                        </div>
                        <Badge className={
                          booking.status === 'confirmed' ? 'bg-green-500' :
                          booking.status === 'pending' ? 'bg-yellow-500' :
                          booking.status === 'completed' ? 'bg-blue-500' :
                          'bg-slate-500'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl mb-4 block">📅</span>
                    <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                    <p>Patient bookings will appear here once they start booking surgeries at your hospital.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="border-2">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="text-xl font-bold">{booking.surgery?.name || 'Surgery'}</h3>
                              <p className="text-slate-600">👤 {booking.patient?.full_name || 'Patient'}</p>
                              <p className="text-slate-600">👨‍⚕️ Dr. {booking.doctor?.full_name || 'Doctor'}</p>
                              <p className="text-slate-600">📅 {booking.surgery_date ? new Date(booking.surgery_date).toLocaleDateString() : 'Date TBD'}</p>
                              <p className="text-slate-600">💰 ₹{(booking.total_cost || 0).toLocaleString()}</p>
                            </div>
                            <Badge className={
                              booking.status === 'confirmed' ? 'bg-green-500' :
                              booking.status === 'pending' ? 'bg-yellow-500' :
                              booking.status === 'completed' ? 'bg-blue-500' :
                              'bg-slate-500'
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Hospital Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Booking Statistics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Bookings:</span>
                            <span className="font-bold">{analytics.total_bookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Confirmed:</span>
                            <span className="font-bold text-green-600">{analytics.confirmed_bookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Pending:</span>
                            <span className="font-bold text-yellow-600">{analytics.pending_bookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Completed:</span>
                            <span className="font-bold text-blue-600">{analytics.completed_bookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Cancelled:</span>
                            <span className="font-bold text-red-600">{analytics.cancelled_bookings}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-green-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">Revenue Statistics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Revenue:</span>
                            <span className="font-bold text-green-600">₹{analytics.total_revenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Average Booking Value:</span>
                            <span className="font-bold">₹{Math.round(analytics.average_booking_value).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl mb-4 block">📊</span>
                    <p className="text-xl">No analytics data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Hospital Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {hospitalProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-600">Hospital Name</Label>
                        <p className="font-semibold text-lg">{hospitalProfile.name}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Zone</Label>
                        <p className="font-semibold">{hospitalProfile.zone}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Location</Label>
                        <p className="font-semibold">{hospitalProfile.location}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Base Price</Label>
                        <p className="font-semibold">₹{(hospitalProfile.base_price || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Consumables Cost</Label>
                        <p className="font-semibold">₹{(hospitalProfile.consumables_cost || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Insurance Accepted</Label>
                        <p className="font-semibold">{hospitalProfile.insurance_accepted ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-slate-600">Address</Label>
                      <p className="font-semibold">{hospitalProfile.address || 'N/A'}</p>
                    </div>
                    {hospitalProfile.facilities && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-slate-600">Facilities</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(Array.isArray(hospitalProfile.facilities) ? hospitalProfile.facilities : []).map((facility, idx) => (
                              <Badge key={idx} variant="outline" className="bg-blue-50">{facility}</Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No profile data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Hospital Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-xl font-semibold mb-2">Document Management</h3>
                  <p className="mb-6">Upload and manage hospital licenses, accreditations, and certificates.</p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
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

export default HospitalDashboard;
