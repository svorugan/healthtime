import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ImplantDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [implantProfile, setImplantProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myImplants, setMyImplants] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImplant, setEditingImplant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    brand_type: '',
    expected_life: '',
    range_of_motion: '',
    peer_reviewed_studies: '',
    price: '',
    description: '',
    surgery_type: ''
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        toast.error('Request timed out. Please check your connection and try again.');
      }
    }, 10000); // 10 second timeout

    const fetchData = async () => {
      try {
        await fetchMyImplants();
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);
  
  const fetchMyImplants = async () => {
    setLoading(true);
    try {
      console.log('Fetching implants from:', `${API}/implants/my`);
      const response = await axios.get(`${API}/implants/my`, {
        withCredentials: true, // Include cookies for authentication
        timeout: 8000, // 8 second timeout
        signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : null,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 200) {
        console.log('Implants response:', response.data);
        setMyImplants(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.detail || 
                         error.message || 
                         'Failed to load implants';
      
      console.error('Failed to fetch implants:', {
        error: errorMessage,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Only show error toast if it's not a 401/403 (handled by auth)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error(`Error: ${errorMessage}`);
      }
      
      // If unauthorized, the auth system should handle redirection
      if (error.response?.status === 401) {
        // Let the auth system handle this
        console.log('Authentication required, redirecting to login...');
      }
      
      setMyImplants([]);
      throw error; // Re-throw to be caught by the useEffect
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      brand_type: '',
      expected_life: '',
      range_of_motion: '',
      peer_reviewed_studies: '',
      price: '',
      description: '',
      surgery_type: ''
    });
  };

  const handleCreateImplant = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.brand || !formData.surgery_type) {
        toast.error('Name, brand, and surgery type are required');
        return;
      }

      // Prepare the data with proper types
      const dataToSend = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        brand_type: formData.brand_type?.trim() || 'Standard',
        expected_life: formData.expected_life ? parseInt(formData.expected_life) || 0 : 10, // Default to 10 years
        range_of_motion: formData.range_of_motion?.trim() || 'Standard',
        peer_reviewed_studies: formData.peer_reviewed_studies ? parseInt(formData.peer_reviewed_studies) || 0 : 0,
        price: formData.price ? parseFloat(formData.price) || 0 : 0,
        description: formData.description?.trim() || `New ${formData.surgery_type} implant`,
        surgery_type: formData.surgery_type,
        status: 'active',  // Ensure status is set
        is_approved: false  // New implants should be approved by admin
      };

      console.log('Creating implant with data:', dataToSend);

      // Make the API call to create implant for the current user
      const response = await axios.post(`${API}/implants`, dataToSend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 201 || response.status === 200) {
        toast.success('Implant created successfully!');
        // Close the modal and refresh the list
        setIsCreateModalOpen(false);
        resetForm();
        await fetchMyImplants();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to create implant:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Failed to create implant';
      
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleEditImplant = async () => {
    try {
      const response = await axios.put(`${API}/implants/${editingImplant.id}`, formData);
      toast.success('Implant updated successfully!');
      setIsEditModalOpen(false);
      setEditingImplant(null);
      resetForm();
      fetchMyImplants();
      if (editingImplant.id === (user.implant_id || user.id)) {
        fetchImplantData();
      }
    } catch (error) {
      console.error('Failed to update implant:', error);
      toast.error('Failed to update implant: ' + (error.response?.data?.detail || error.message));
    }
  };

  const openEditModal = (implant) => {
    setEditingImplant(implant);
    setFormData({
      name: implant.name || '',
      brand: implant.brand || '',
      brand_type: implant.brand_type || '',
      expected_life: implant.expected_life || '',
      range_of_motion: implant.range_of_motion || '',
      peer_reviewed_studies: implant.peer_reviewed_studies || '',
      price: implant.price?.toString() || '',
      description: implant.description || '',
      surgery_type: implant.surgery_type || ''
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Implant Dashboard
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Welcome back, {implantProfile?.brand || 'Implant Provider'}! 🦴
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setActiveTab('profile')}
              variant="outline" 
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <span className="mr-2">🦴</span>
              Implant Profile
            </Button>
            <Button onClick={logout} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              <span className="mr-2">🚪</span>
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="bookings">📅 Usage</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
            <TabsTrigger value="profile">🦴 Profile</TabsTrigger>
            <TabsTrigger value="manage">⚙️ Manage</TabsTrigger>
            <TabsTrigger value="documents">📋 Documents</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Usage</p>
                      <p className="text-3xl font-bold">{analytics?.total_usage || 0}</p>
                    </div>
                    <span className="text-4xl opacity-80">🦴</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Revenue</p>
                      <p className="text-3xl font-bold">₹{(analytics?.total_revenue || 0).toLocaleString()}</p>
                    </div>
                    <span className="text-4xl opacity-80">💰</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Avg. Value</p>
                      <p className="text-3xl font-bold">₹{Math.round(analytics?.average_booking_value || 0).toLocaleString()}</p>
                    </div>
                    <span className="text-4xl opacity-80">📊</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Price</p>
                      <p className="text-3xl font-bold">₹{(implantProfile?.price || 0).toLocaleString()}</p>
                    </div>
                    <span className="text-4xl opacity-80">💵</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Usage */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Recent Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl mb-4 block">🦴</span>
                    <p className="text-xl">No usage data yet</p>
                    <p className="text-sm">Implant usage will appear here when patients select your implant</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{booking.surgery?.name || 'Surgery'}</p>
                          <p className="text-sm text-slate-600">
                            {booking.hospital?.name || 'Hospital'} • Dr. {booking.doctor?.full_name || 'Doctor'}
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

          {/* Bookings/Usage Tab */}
          <TabsContent value="bookings">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">All Usage Records</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl mb-4 block">🦴</span>
                    <h3 className="text-xl font-semibold mb-2">No Usage Records Yet</h3>
                    <p>Usage data will appear here when patients select your implant for their surgeries.</p>
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
                              <p className="text-slate-600">🏥 {booking.hospital?.name || 'Hospital'}</p>
                              <p className="text-slate-600">👨‍⚕️ Dr. {booking.doctor?.full_name || 'Doctor'}</p>
                              <p className="text-slate-600">📅 {booking.surgery_date ? new Date(booking.surgery_date).toLocaleDateString() : 'Date TBD'}</p>
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
                <CardTitle className="text-xl text-slate-800">Implant Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-purple-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-900 mb-4">Usage Statistics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Usage:</span>
                            <span className="font-bold">{analytics.total_usage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Revenue:</span>
                            <span className="font-bold text-green-600">₹{analytics.total_revenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Average Value:</span>
                            <span className="font-bold">₹{Math.round(analytics.average_booking_value).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-pink-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-pink-900 mb-4">Usage by Surgery Type</h3>
                        <div className="space-y-2">
                          {analytics.usage_by_surgery && Object.keys(analytics.usage_by_surgery).length > 0 ? (
                            Object.entries(analytics.usage_by_surgery).map(([surgery, count]) => (
                              <div key={surgery} className="flex justify-between">
                                <span className="text-slate-600">{surgery}:</span>
                                <span className="font-bold">{count}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-500 text-sm">No usage data by surgery type yet</p>
                          )}
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
                <CardTitle className="text-xl text-slate-800">Implant Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {implantProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-600">Implant Name</Label>
                        <p className="font-semibold text-lg">{implantProfile.name}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Brand</Label>
                        <p className="font-semibold">{implantProfile.brand}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Brand Type</Label>
                        <p className="font-semibold">{implantProfile.brand_type}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Price</Label>
                        <p className="font-semibold text-green-600">₹{(implantProfile.price || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Expected Life</Label>
                        <p className="font-semibold">{implantProfile.expected_life || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Range of Motion</Label>
                        <p className="font-semibold">{implantProfile.range_of_motion || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Peer Reviewed Studies</Label>
                        <p className="font-semibold">{implantProfile.peer_reviewed_studies || 'N/A'}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-slate-600">Description</Label>
                      <p className="font-semibold">{implantProfile.description || 'No description available'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No profile data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage">
            <div className="space-y-6">
              {/* Header with Add Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Manage My Implants</h2>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <span className="mr-2">➕</span>
                      Add New Implant
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Implant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Implant Name</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., TotalKnee Pro X1"
                          />
                        </div>
                        <div>
                          <Label>Brand</Label>
                          <Input
                            value={formData.brand}
                            onChange={(e) => handleInputChange('brand', e.target.value)}
                            placeholder="e.g., Johnson & Johnson"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Brand Type</Label>
                          <Select value={formData.brand_type} onValueChange={(value) => handleInputChange('brand_type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Premium">Premium</SelectItem>
                              <SelectItem value="Standard">Standard</SelectItem>
                              <SelectItem value="Economy">Economy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Surgery Type</Label>
                          <Select value={formData.surgery_type} onValueChange={(value) => handleInputChange('surgery_type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select surgery type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Knee Replacement">Knee Replacement</SelectItem>
                              <SelectItem value="Hip Replacement">Hip Replacement</SelectItem>
                              <SelectItem value="Shoulder Replacement">Shoulder Replacement</SelectItem>
                              <SelectItem value="Ankle Replacement">Ankle Replacement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Expected Life (years)</Label>
                          <Input
                            value={formData.expected_life}
                            onChange={(e) => handleInputChange('expected_life', e.target.value)}
                            placeholder="e.g., 15-20 years"
                          />
                        </div>
                        <div>
                          <Label>Range of Motion</Label>
                          <Input
                            value={formData.range_of_motion}
                            onChange={(e) => handleInputChange('range_of_motion', e.target.value)}
                            placeholder="e.g., 0-135 degrees"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Peer Reviewed Studies</Label>
                          <Input
                            value={formData.peer_reviewed_studies}
                            onChange={(e) => handleInputChange('peer_reviewed_studies', e.target.value)}
                            placeholder="e.g., 25+ studies"
                          />
                        </div>
                        <div>
                          <Label>Price (₹)</Label>
                          <Input
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            placeholder="e.g., 150000"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Detailed description of the implant..."
                          rows={4}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateImplant} className="bg-gradient-to-r from-purple-600 to-pink-600">
                          Create Implant
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Implants List */}
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">My Implants</CardTitle>
                </CardHeader>
                <CardContent>
                  {myImplants.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <span className="text-6xl mb-4 block">🦴</span>
                      <h3 className="text-xl font-semibold mb-2">No Implants Yet</h3>
                      <p className="mb-6">Create your first implant to get started.</p>
                      <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        <span className="mr-2">➕</span>
                        Add Your First Implant
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myImplants.map((implant) => (
                        <Card key={implant.id} className="border-2 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-slate-800">{implant.name}</h3>
                                <Badge className="bg-purple-100 text-purple-800">{implant.brand_type}</Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm text-slate-600">
                                <p><strong>Brand:</strong> {implant.brand}</p>
                                <p><strong>Price:</strong> ₹{(implant.price || 0).toLocaleString()}</p>
                                <p><strong>Expected Life:</strong> {implant.expected_life || 'N/A'}</p>
                                <p><strong>Range of Motion:</strong> {implant.range_of_motion || 'N/A'}</p>
                              </div>

                              <div className="pt-3 border-t">
                                <p className="text-xs text-slate-500 mb-3">
                                  {implant.description ? 
                                    (implant.description.length > 100 ? 
                                      implant.description.substring(0, 100) + '...' : 
                                      implant.description
                                    ) : 
                                    'No description available'
                                  }
                                </p>
                                
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => openEditModal(implant)}
                                    className="flex-1"
                                  >
                                    <span className="mr-1">✏️</span>
                                    Edit
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex-1 border-green-300 text-green-600 hover:bg-green-50"
                                  >
                                    <span className="mr-1">👁️</span>
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Implant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Implant Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., TotalKnee Pro X1"
                      />
                    </div>
                    <div>
                      <Label>Brand</Label>
                      <Input
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="e.g., Johnson & Johnson"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Brand Type</Label>
                      <Select value={formData.brand_type} onValueChange={(value) => handleInputChange('brand_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Economy">Economy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Surgery Type</Label>
                      <Select value={formData.surgery_type} onValueChange={(value) => handleInputChange('surgery_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select surgery type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Knee Replacement">Knee Replacement</SelectItem>
                          <SelectItem value="Hip Replacement">Hip Replacement</SelectItem>
                          <SelectItem value="Shoulder Replacement">Shoulder Replacement</SelectItem>
                          <SelectItem value="Ankle Replacement">Ankle Replacement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expected Life (years)</Label>
                      <Input
                        value={formData.expected_life}
                        onChange={(e) => handleInputChange('expected_life', e.target.value)}
                        placeholder="e.g., 15-20 years"
                      />
                    </div>
                    <div>
                      <Label>Range of Motion</Label>
                      <Input
                        value={formData.range_of_motion}
                        onChange={(e) => handleInputChange('range_of_motion', e.target.value)}
                        placeholder="e.g., 0-135 degrees"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Peer Reviewed Studies</Label>
                      <Input
                        value={formData.peer_reviewed_studies}
                        onChange={(e) => handleInputChange('peer_reviewed_studies', e.target.value)}
                        placeholder="e.g., 25+ studies"
                      />
                    </div>
                    <div>
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="e.g., 150000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Detailed description of the implant..."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditImplant} className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Update Implant
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Implant Certificates & Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-xl font-semibold mb-2">Document Management</h3>
                  <p className="mb-6">Upload and manage implant certificates, FDA approvals, and clinical studies.</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
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

export default ImplantDashboard;  
