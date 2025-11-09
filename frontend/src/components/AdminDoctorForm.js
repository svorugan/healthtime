import React, { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDoctorForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    primary_specialization: '',
    medical_council_number: '',
    experience_years: '',
    consultation_fee: '',
    city: '',
    state: '',
    bio: '',
    gender: '',
    medical_degree: '',
    medical_degree_institution: '',
    medical_degree_year: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.password || !formData.primary_specialization || !formData.phone) {
      toast.error('Please fill in all required fields (Name, Email, Password, Specialization, Phone)');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Clean up formData - convert empty strings to null for optional fields
      const cleanedData = { ...formData };
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '') {
          cleanedData[key] = null;
        }
      });
      
      await axios.post(`${API}/admin/doctors`, cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Doctor added successfully! 🎉');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add doctor');
      console.error('Add doctor error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              👨‍⚕️ Add New Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      required
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      placeholder="doctor@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                      placeholder="Secure password"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                      placeholder="+1234567890"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Professional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_specialization">Specialization *</Label>
                    <Select value={formData.primary_specialization} onValueChange={(value) => handleChange('primary_specialization', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="General Surgery">General Surgery</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                        <SelectItem value="ENT">ENT</SelectItem>
                        <SelectItem value="Gynecology">Gynecology</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="medical_council_number">Medical Council Number</Label>
                    <Input
                      id="medical_council_number"
                      value={formData.medical_council_number}
                      onChange={(e) => handleChange('medical_council_number', e.target.value)}
                      placeholder="MCI-12345"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="experience_years">Experience (Years)</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => handleChange('experience_years', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                    <Input
                      id="consultation_fee"
                      type="number"
                      value={formData.consultation_fee}
                      onChange={(e) => handleChange('consultation_fee', e.target.value)}
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="medical_degree">Medical Degree</Label>
                    <Input
                      id="medical_degree"
                      value={formData.medical_degree}
                      onChange={(e) => handleChange('medical_degree', e.target.value)}
                      placeholder="MBBS"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="medical_degree_institution">Institution</Label>
                    <Input
                      id="medical_degree_institution"
                      value={formData.medical_degree_institution}
                      onChange={(e) => handleChange('medical_degree_institution', e.target.value)}
                      placeholder="Medical College"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="medical_degree_year">Year</Label>
                    <Input
                      id="medical_degree_year"
                      type="number"
                      value={formData.medical_degree_year}
                      onChange={(e) => handleChange('medical_degree_year', e.target.value)}
                      placeholder="2015"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Brief professional biography..."
                  rows={4}
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
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  {loading ? 'Adding Doctor...' : 'Add Doctor'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDoctorForm;
