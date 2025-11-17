import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminHospitalManagementPanel = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all hospitals on mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/admin/hospitals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHospitals(response.data);
    } catch (error) {
      toast.error('Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  // Admin actions
  const handleAction = async (id, action) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let successMsg = '';
      if (action === 'approve') {
        endpoint = `${API}/admin/hospitals/${id}/approve`;
        successMsg = 'Hospital approved!';
      } else if (action === 'reject') {
        endpoint = `${API}/admin/hospitals/${id}/reject`;
        successMsg = 'Hospital rejected!';
      }
      await axios.patch(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(successMsg);
      fetchHospitals(); // Refresh list
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              🏥 Hospital Management Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="text-center text-lg text-teal-600">Loading...</div>
            ) : hospitals.length === 0 ? (
              <div className="text-center text-lg text-gray-500">No hospitals found.</div>
            ) : (
              <div className="space-y-6">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="border rounded-lg p-4 shadow-sm bg-white mb-2">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-bold text-lg text-teal-700">{hospital.name}</div>
                          {getStatusBadge(hospital.status)}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">📧 {hospital.email}</div>
                        <div className="text-sm text-gray-600 mb-1">📞 {hospital.phone}</div>
                        <div className="text-sm text-gray-500 mb-1">📍 {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}</div>
                        <div className="text-sm text-gray-500 mb-1">🗺️ Zone: {hospital.zone}</div>
                        <div className="text-sm text-gray-500 mb-1">🏢 Location: {hospital.location}</div>
                        <div className="text-sm text-gray-500 mb-1">💰 Base Price: ₹{(hospital.base_price || 0).toLocaleString()}</div>
                        <div className="text-sm text-gray-500 mb-1">💊 Consumables Cost: ₹{(hospital.consumables_cost || 0).toLocaleString()}</div>
                        <div className="text-sm text-gray-500 mb-1">📋 Insurance: {hospital.insurance_accepted ? 'Accepted' : 'Not Accepted'}</div>
                        <div className="text-sm text-gray-500">📅 Registered: {new Date(hospital.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        {hospital.status === 'pending' && (
                          <>
                            <Button 
                              onClick={() => handleAction(hospital.id, 'approve')} 
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Approve
                            </Button>
                            <Button 
                              onClick={() => handleAction(hospital.id, 'reject')} 
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {hospital.status === 'approved' && (
                          <Badge className="bg-green-500">Active</Badge>
                        )}
                        {hospital.status === 'rejected' && (
                          <Badge className="bg-red-500">Rejected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHospitalManagementPanel;
