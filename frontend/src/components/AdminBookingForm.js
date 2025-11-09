import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminBookingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [implants, setImplants] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    surgery_id: '',
    surgeon_id: '',
    hospital_id: '',
    implant_id: '',
    surgery_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [patientsRes, doctorsRes, surgeriesRes, hospitalsRes, implantsRes] = await Promise.all([
        axios.get(`${API}/admin/patients`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        axios.get(`${API}/doctors`).catch(() => ({ data: [] })),
        axios.get(`${API}/surgeries`).catch(() => ({ data: [] })),
        axios.get(`${API}/hospitals`).catch(() => ({ data: [] })),
        axios.get(`${API}/implants`).catch(() => ({ data: [] }))
      ]);
      
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setSurgeries(surgeriesRes.data);
      setHospitals(hospitalsRes.data);
      setImplants(implantsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.surgery_id || !formData.surgeon_id || !formData.hospital_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/bookings`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Booking created successfully! 🎉');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create booking');
      console.error('Create booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              📅 Create New Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div>
                <Label htmlFor="patient_id">Patient *</Label>
                <Select value={formData.patient_id} onValueChange={(value) => handleChange('patient_id', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name || patient.full_name} - {patient.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Surgery Selection */}
              <div>
                <Label htmlFor="surgery_id">Surgery Type *</Label>
                <Select value={formData.surgery_id} onValueChange={(value) => handleChange('surgery_id', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select surgery type" />
                  </SelectTrigger>
                  <SelectContent>
                    {surgeries.map((surgery) => (
                      <SelectItem key={surgery.id} value={surgery.id.toString()}>
                        {surgery.name} - ₹{surgery.base_price?.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Selection */}
              <div>
                <Label htmlFor="surgeon_id">Surgeon *</Label>
                <Select value={formData.surgeon_id} onValueChange={(value) => handleChange('surgeon_id', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select surgeon" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.full_name} - {doctor.primary_specialization || doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hospital Selection */}
              <div>
                <Label htmlFor="hospital_id">Hospital *</Label>
                <Select value={formData.hospital_id} onValueChange={(value) => handleChange('hospital_id', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id.toString()}>
                        {hospital.name} - {hospital.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Implant Selection (Optional) */}
              <div>
                <Label htmlFor="implant_id">Implant (Optional)</Label>
                <Select value={formData.implant_id} onValueChange={(value) => handleChange('implant_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select implant (if needed)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {implants.map((implant) => (
                      <SelectItem key={implant.id} value={implant.id.toString()}>
                        {implant.name} - {implant.brand} - ₹{implant.price?.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Surgery Date */}
              <div>
                <Label htmlFor="surgery_date">Surgery Date</Label>
                <Input
                  id="surgery_date"
                  type="date"
                  value={formData.surgery_date}
                  onChange={(e) => handleChange('surgery_date', e.target.value)}
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any special requirements or notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? 'Creating Booking...' : 'Create Booking'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBookingForm;
