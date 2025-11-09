import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDoctorManagementPanel = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to fetch doctors');
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
        endpoint = `${API}/admin/doctors/${id}/approve`;
        successMsg = 'Doctor approved!';
      } else if (action === 'reject') {
        endpoint = `${API}/admin/doctors/${id}/reject`;
        successMsg = 'Doctor rejected!';
      } else if (action === 'request-info') {
        endpoint = `${API}/admin/doctors/${id}/request-info`;
        successMsg = 'Requested more information!';
      }
      await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(successMsg);
      fetchDoctors(); // Refresh list
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              👨‍⚕️ Doctor Management Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="text-center text-lg text-teal-600">Loading...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center text-lg text-gray-500">No doctors found.</div>
            ) : (
              <div className="space-y-6">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm bg-white mb-2">
                    <div>
                      <div className="font-bold text-lg text-teal-700">{doctor.full_name}</div>
                      <div className="text-sm text-gray-600">{doctor.email}</div>
                      <div className="text-sm text-gray-500">Status: <span className="font-semibold">{doctor.status}</span></div>
                      <div className="text-sm text-gray-500">Specialization: {doctor.primary_specialization}</div>
                      <div className="text-sm text-gray-500">City: {doctor.city}</div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button onClick={() => handleAction(doctor.id, 'approve')} className="bg-green-500 hover:bg-green-600 text-white">Approve</Button>
                      <Button onClick={() => handleAction(doctor.id, 'reject')} className="bg-red-500 hover:bg-red-600 text-white">Reject</Button>
                      <Button onClick={() => handleAction(doctor.id, 'request-info')} className="bg-yellow-500 hover:bg-yellow-600 text-white">Request Info</Button>
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

export default AdminDoctorManagementPanel;
