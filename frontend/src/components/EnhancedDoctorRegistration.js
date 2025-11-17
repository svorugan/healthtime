import React, { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EnhancedDoctorRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    full_name: '',
    email: '',
    password: '',
    phone: '',
    alternate_phone: '',
    date_of_birth: '',
    gender: '',
    
    // Professional Credentials
    primary_specialization: '',
    secondary_specializations: [],
    sub_specialties: [],
    medical_council_number: '',
    additional_registrations: [],
    
    // Education
    medical_degree: '',
    medical_degree_institution: '',
    medical_degree_year: '',
    medical_degree_percentage: '',
    
    postgraduate_degree: '',
    postgraduate_institution: '',
    postgraduate_year: '',
    postgraduate_percentage: '',
    
    // Fellowship and Certifications
    fellowship_details: [],
    board_certifications: [],
    continuing_education_points: 0,
    
    // Experience
    experience_years: '',
    total_experience_years: '',
    total_surgeries_performed: 0,
    
    // Practice Information
    clinic_address: '',
    hospital_affiliations: [],
    consultation_languages: ['English'],
    languages_spoken: '',
    city: '',
    state: '',
    
    // Professional Details
    bio: '',
    areas_of_expertise: [],
    research_interests: [],
    
    // Financial
    consultation_fee: '',
    online_consultation_fee: '',
    surgery_fee: '',
    emergency_consultation_fee: '',
    
    // Services
    online_consultation: false,
    home_visits: false,
    emergency_services: false,
    second_opinion_services: false,
    
    // Optional Professional Links
    google_reviews_link: '',
    professional_website: '',
    linkedin_profile: '',
    
    // Professional References
    professional_references: []
  });

  // State for adding dynamic entries
  const [currentSpecialization, setCurrentSpecialization] = useState('');
  const [currentSubSpecialty, setCurrentSubSpecialty] = useState('');
  const [currentExpertise, setCurrentExpertise] = useState('');
  const [currentResearchInterest, setCurrentResearchInterest] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [currentCertification, setCurrentCertification] = useState('');
  const [currentFellowship, setCurrentFellowship] = useState({
    fellowship: '',
    institution: '',
    year: '',
    specialization: ''
  });
  const [currentHospital, setCurrentHospital] = useState({
    hospital_name: '',
    address: '',
    privileges: []
  });
  const [currentReference, setCurrentReference] = useState({
    name: '',
    designation: '',
    contact: '',
    relation: ''
  });

  const addArrayItem = (fieldName, item, clearState) => {
    if (item && item.trim()) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], item.trim()]
      }));
      clearState('');
    }
  };

  const removeArrayItem = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const addComplexItem = (fieldName, item, clearState) => {
    if (item && Object.values(item).some(val => val && val.toString().trim())) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], item]
      }));
      clearState();
    }
  };

  // Try to autofill full_name from previous flows (location.state, localStorage 'user' or 'patientData')
  React.useEffect(() => {
    if (formData.full_name && formData.full_name.trim()) return; // already filled

    // 1) Check navigation state (if previous page passed data)
    try {
      const state = location && location.state ? location.state : null;
      const candidates = [];
      if (state) {
        // common shapes
        if (state.full_name) candidates.push(state.full_name);
        if (state.user && state.user.full_name) candidates.push(state.user.full_name);
        if (state.patientData && state.patientData.full_name) candidates.push(state.patientData.full_name);
        if (state.patientData && state.patientData.name) candidates.push(state.patientData.name);
      }

      // 2) Check localStorage 'user' (set on login/quick flows)
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed) {
            if (parsed.full_name) candidates.push(parsed.full_name);
            if (parsed.name) candidates.push(parsed.name);
          }
        }
      } catch (e) {
        // ignore parse errors
      }

      // 3) Check other stored quick-registration keys
      try {
        const pd = localStorage.getItem('patientData') || localStorage.getItem('registrationData');
        if (pd) {
          const parsed = JSON.parse(pd);
          if (parsed && parsed.full_name) candidates.push(parsed.full_name);
          if (parsed && parsed.name) candidates.push(parsed.name);
        }
      } catch (e) {}

      // pick first non-empty candidate
      const name = candidates.find(n => n && typeof n === 'string' && n.trim());
      if (name) {
        setFormData(prev => ({ ...prev, full_name: name.trim() }));
      }
    } catch (e) {
      // ignore
    }
  }, []); // run once on mount

  const removeComplexItem = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      console.log('Starting form submission...');
      
      // Validate required fields with better error messages
      const requiredFields = [
        { field: 'full_name', label: 'Full Name' },
        { field: 'email', label: 'Email' },
        { field: 'password', label: 'Password' },
        { field: 'phone', label: 'Phone Number' },
        { field: 'primary_specialization', label: 'Primary Specialization' },
        { field: 'medical_council_number', label: 'Medical Council Number' },
        { field: 'medical_degree', label: 'Medical Degree' },
        { field: 'medical_degree_institution', label: 'Medical Institution' },
        { field: 'medical_degree_year', label: 'Year of Medical Degree' },
        { field: 'total_experience_years', label: 'Total Experience Years' },
        { field: 'city', label: 'City' },
        { field: 'state', label: 'State' }
      ];

      // Check for missing required fields
      const missingFields = requiredFields
        .filter(({ field }) => !formData[field]?.toString().trim())
        .map(({ label }) => label);

      if (missingFields.length > 0) {
        const message = `Please fill in all required fields: ${missingFields.join(', ')}`;
        console.log('Validation failed - missing fields:', missingFields);
        toast.error(message);
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        console.log('Validation failed - invalid email format:', formData.email);
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        console.log('Validation failed - password too short');
        toast.error('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // Prepare data for submission with proper type conversion
      const cleanValue = (value) => {
        if (value === '' || value === undefined || value === null) return null;
        if (typeof value === 'string') return value.trim();
        return value;
      };

      const submitData = {
        ...formData,
        // Clean and trim string fields
        full_name: cleanValue(formData.full_name),
        email: cleanValue(formData.email),
        phone: cleanValue(formData.phone),
        alternate_phone: cleanValue(formData.alternate_phone),
        primary_specialization: cleanValue(formData.primary_specialization),
        medical_council_number: cleanValue(formData.medical_council_number),
        medical_degree: cleanValue(formData.medical_degree),
        medical_degree_institution: cleanValue(formData.medical_degree_institution),
        city: cleanValue(formData.city),
        state: cleanValue(formData.state),
        
        // Convert string numbers to numbers
        medical_degree_year: formData.medical_degree_year ? parseInt(formData.medical_degree_year, 10) : null,
        total_experience_years: formData.total_experience_years ? parseInt(formData.total_experience_years, 10) : null,
        consultation_fee: formData.consultation_fee ? Number(formData.consultation_fee) : null,
        online_consultation_fee: formData.online_consultation_fee ? Number(formData.online_consultation_fee) : null,
        surgery_fee: formData.surgery_fee ? Number(formData.surgery_fee) : null,
        emergency_consultation_fee: formData.emergency_consultation_fee ? Number(formData.emergency_consultation_fee) : null,
        
        // Ensure arrays are always arrays (not null/undefined)
        consultation_languages: Array.isArray(formData.consultation_languages) && formData.consultation_languages.length > 0 
          ? formData.consultation_languages 
          : ['English'],
        
        // Convert empty strings to null for optional fields
        ...(formData.date_of_birth ? { date_of_birth: formData.date_of_birth } : { date_of_birth: null }),
        ...(formData.gender ? { gender: formData.gender } : { gender: null }),
        ...(formData.languages_spoken ? { languages_spoken: formData.languages_spoken } : { languages_spoken: null }),
        ...(formData.bio ? { bio: formData.bio } : { bio: null })
      };
      
      console.log('Processed submitData:', JSON.stringify(submitData, null, 2));

      console.log('Submitting data to server:', JSON.stringify(submitData, null, 2));

      // Make the API request with better error handling
      const response = await axios.post(
        `${API}/auth/register/doctor/enhanced`,
        submitData,
        {
          validateStatus: (status) => status < 500, // Don't throw for 4xx errors
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Server response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (response.status === 201) {
        console.log('Registration successful');
        toast.success('Registration submitted successfully! Awaiting admin approval.');
        navigate('/login-portal');
      } else {
        // Handle server-side validation errors
        let errorMessage = 'Registration failed. Please check your information.';
        
        if (response.data) {
          console.log('Error response data:', response.data);
          
          if (response.data.detail) {
            errorMessage = response.data.detail;
          } else if (response.data.errors) {
            errorMessage = Object.entries(response.data.errors)
              .map(([field, errors]) => 
                `${field.replace(/_/g, ' ')}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
              )
              .join('. ');
          }
        }
        
        console.error('Registration failed:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      
      let errorMessage = 'An error occurred during registration. Please try again.';
      
      if (error.response) {
        // Server responded with an error status
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        
        const { data } = error.response;
        if (data?.detail) {
          errorMessage = data.detail;
        } else if (data?.errors) {
          errorMessage = Object.entries(data.errors)
            .map(([field, errors]) => 
              `${field.replace(/_/g, ' ')}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
            )
            .join('. ');
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        // Something else happened in setting up the request
        console.error('Request setup error:', error.message);
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextSection = () => {
    if (currentSection < 5) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const getSectionProgress = () => {
    return (currentSection / 5) * 100;
  };

  const renderSection4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-teal-700 flex items-center">
        <span className="mr-2">💼</span>
        Experience & Services
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total_experience_years">Total Experience (Years) *</Label>
          <Input
            id="total_experience_years"
            type="number"
            value={formData.total_experience_years}
            onChange={(e) => setFormData({...formData, total_experience_years: e.target.value})}
            required
            className="border-teal-200 focus:border-teal-500"
            placeholder="5"
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
            placeholder="500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          className="border-teal-200 focus:border-teal-500"
          placeholder="Brief description of your medical practice and expertise..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="languages_spoken">Languages Spoken</Label>
        <Input
          id="languages_spoken"
          value={formData.languages_spoken}
          onChange={(e) => setFormData({...formData, languages_spoken: e.target.value})}
          className="border-teal-200 focus:border-teal-500"
          placeholder="English, Hindi, Tamil (comma-separated)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            required
            className="border-teal-200 focus:border-teal-500"
            placeholder="Mumbai"
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            required
            className="border-teal-200 focus:border-teal-500"
            placeholder="Maharashtra"
          />
        </div>
      </div>

      <Separator className="bg-teal-200" />
    </div>
  );

  const renderSection5 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-teal-700 flex items-center">
        <span className="mr-2">📋</span>
        Professional Profile Summary
      </h3>
      
      <div className="bg-teal-50 p-6 rounded-lg space-y-4">
        <h4 className="font-semibold text-teal-800 mb-4">Review Your Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-teal-700">Name:</strong> {formData.full_name || 'Not provided'}
          </div>
          <div>
            <strong className="text-teal-700">Email:</strong> {formData.email || 'Not provided'}
          </div>
          <div>
            <strong className="text-teal-700">Phone:</strong> {formData.phone || 'Not provided'}
          </div>
          <div>
            <strong className="text-teal-700">Specialization:</strong> {formData.primary_specialization || 'Not provided'}
          </div>
          <div>
            <strong className="text-teal-700">Medical Council No:</strong> {formData.medical_council_number || 'Not provided'}
          </div>
          <div>
            <strong className="text-teal-700">Experience:</strong> {formData.total_experience_years || 'Not provided'} years
          </div>
          <div>
            <strong className="text-teal-700">City:</strong> {formData.city || 'Not provided'}
          </div>
          <div>
            <strong className="text-teal-700">Consultation Fee:</strong> ₹{formData.consultation_fee || 'Not set'}
          </div>
        </div>

        <div className="mt-4">
          <strong className="text-teal-700">Medical Degree:</strong> {formData.medical_degree || 'Not provided'}
          {formData.medical_degree_institution && (
            <span> from {formData.medical_degree_institution}</span>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-2">📝 Application Status</h5>
          <p className="text-blue-700 text-sm">
            Your registration is complete and ready for submission. Our medical board will review your application and verify your credentials. 
            You will receive an approval notification via email within 24-48 hours.
          </p>
        </div>
      </div>

      <Separator className="bg-teal-200" />
    </div>
  );

  const renderSection1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-teal-700 flex items-center">
        <span className="mr-2">👨‍⚕️</span>
        Basic Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            required
            className="border-teal-200 focus:border-teal-500"
            placeholder="Dr. John Doe"
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
            placeholder="doctor@example.com"
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
            minLength={8}
            className="border-teal-200 focus:border-teal-500"
            placeholder="Minimum 8 characters"
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
            placeholder="+91 9876543210"
          />
        </div>
        <div>
          <Label htmlFor="alternate_phone">Alternate Phone</Label>
          <Input
            id="alternate_phone"
            value={formData.alternate_phone}
            onChange={(e) => setFormData({...formData, alternate_phone: e.target.value})}
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
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="bg-teal-200" />

      <div className="space-y-4">
        <h4 className="text-md font-semibold text-teal-600">Practice Location</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required
              className="border-teal-200 focus:border-teal-500"
              placeholder="Hyderabad"
            />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              required
              className="border-teal-200 focus:border-teal-500"
              placeholder="Telangana"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="clinic_address">Clinic Address</Label>
          <Textarea
            id="clinic_address"
            value={formData.clinic_address}
            onChange={(e) => setFormData({...formData, clinic_address: e.target.value})}
            className="border-teal-200 focus:border-teal-500"
            placeholder="Complete clinic address with landmarks"
          />
        </div>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-teal-700 flex items-center">
        <span className="mr-2">🎓</span>
        Professional Credentials
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primary_specialization">Primary Specialization *</Label>
          <Input
            id="primary_specialization"
            value={formData.primary_specialization}
            onChange={(e) => setFormData({...formData, primary_specialization: e.target.value})}
            required
            className="border-teal-200 focus:border-teal-500"
            placeholder="Orthopedic Surgery"
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
            placeholder="MCI12345"
          />
        </div>
      </div>

      {/* Secondary Specializations */}
      <div className="space-y-3">
        <Label>Secondary Specializations</Label>
        <div className="flex gap-2">
          <Input
            value={currentSpecialization}
            onChange={(e) => setCurrentSpecialization(e.target.value)}
            placeholder="Add secondary specialization"
            className="border-teal-200 focus:border-teal-500"
          />
          <Button
            type="button"
            onClick={() => addArrayItem('secondary_specializations', currentSpecialization, setCurrentSpecialization)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.secondary_specializations.map((spec, index) => (
            <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-700">
              {spec}
              <button
                onClick={() => removeArrayItem('secondary_specializations', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Sub-Specialties */}
      <div className="space-y-3">
        <Label>Sub-Specialties</Label>
        <div className="flex gap-2">
          <Input
            value={currentSubSpecialty}
            onChange={(e) => setCurrentSubSpecialty(e.target.value)}
            placeholder="Add sub-specialty"
            className="border-teal-200 focus:border-teal-500"
          />
          <Button
            type="button"
            onClick={() => addArrayItem('sub_specialties', currentSubSpecialty, setCurrentSubSpecialty)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.sub_specialties.map((spec, index) => (
            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
              {spec}
              <button
                onClick={() => removeArrayItem('sub_specialties', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Areas of Expertise */}
      <div className="space-y-3">
        <Label>Areas of Expertise</Label>
        <div className="flex gap-2">
          <Input
            value={currentExpertise}
            onChange={(e) => setCurrentExpertise(e.target.value)}
            placeholder="Add area of expertise"
            className="border-teal-200 focus:border-teal-500"
          />
          <Button
            type="button"
            onClick={() => addArrayItem('areas_of_expertise', currentExpertise, setCurrentExpertise)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.areas_of_expertise.map((area, index) => (
            <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
              {area}
              <button
                onClick={() => removeArrayItem('areas_of_expertise', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-teal-700 flex items-center">
        <span className="mr-2">📜</span>
        Education & Qualifications
      </h3>
      
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-teal-600">Medical Degree</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="medical_degree">Medical Degree *</Label>
            <Input
              id="medical_degree"
              value={formData.medical_degree}
              onChange={(e) => setFormData({...formData, medical_degree: e.target.value})}
              required
              className="border-teal-200 focus:border-teal-500"
              placeholder="MBBS"
            />
          </div>
          <div>
            <Label htmlFor="medical_degree_institution">Institution *</Label>
            <Input
              id="medical_degree_institution"
              value={formData.medical_degree_institution}
              onChange={(e) => setFormData({...formData, medical_degree_institution: e.target.value})}
              required
              className="border-teal-200 focus:border-teal-500"
              placeholder="AIIMS Delhi"
            />
          </div>
          <div>
            <Label htmlFor="medical_degree_year">Year of Completion *</Label>
            <Input
              id="medical_degree_year"
              type="number"
              min="1950"
              max="2030"
              value={formData.medical_degree_year}
              onChange={(e) => setFormData({...formData, medical_degree_year: e.target.value})}
              required
              className="border-teal-200 focus:border-teal-500"
              placeholder="2015"
            />
          </div>
          <div>
            <Label htmlFor="medical_degree_percentage">Percentage</Label>
            <Input
              id="medical_degree_percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.medical_degree_percentage}
              onChange={(e) => setFormData({...formData, medical_degree_percentage: e.target.value})}
              className="border-teal-200 focus:border-teal-500"
              placeholder="85.5"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-teal-200" />

      <div className="space-y-4">
        <h4 className="text-md font-semibold text-teal-600">Post-Graduate Degree</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postgraduate_degree">Post-Graduate Degree</Label>
            <Input
              id="postgraduate_degree"
              value={formData.postgraduate_degree}
              onChange={(e) => setFormData({...formData, postgraduate_degree: e.target.value})}
              className="border-teal-200 focus:border-teal-500"
              placeholder="MS Orthopedics"
            />
          </div>
          <div>
            <Label htmlFor="postgraduate_institution">Institution</Label>
            <Input
              id="postgraduate_institution"
              value={formData.postgraduate_institution}
              onChange={(e) => setFormData({...formData, postgraduate_institution: e.target.value})}
              className="border-teal-200 focus:border-teal-500"
              placeholder="PGI Chandigarh"
            />
          </div>
          <div>
            <Label htmlFor="postgraduate_year">Year of Completion</Label>
            <Input
              id="postgraduate_year"
              type="number"
              min="1950"
              max="2030"
              value={formData.postgraduate_year}
              onChange={(e) => setFormData({...formData, postgraduate_year: e.target.value})}
              className="border-teal-200 focus:border-teal-500"
              placeholder="2018"
            />
          </div>
          <div>
            <Label htmlFor="postgraduate_percentage">Percentage</Label>
            <Input
              id="postgraduate_percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.postgraduate_percentage}
              onChange={(e) => setFormData({...formData, postgraduate_percentage: e.target.value})}
              className="border-teal-200 focus:border-teal-500"
              placeholder="88.2"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            👨‍⚕️ Enhanced Doctor Registration 👨‍⚕️
          </h1>
          <p className="text-xl text-slate-600">Join healthtime's network of verified medical professionals</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              <span className="mr-2">📋</span>
              Step {currentSection} of 5: {
                currentSection === 1 ? 'Basic Information' :
                currentSection === 2 ? 'Professional Credentials' :
                currentSection === 3 ? 'Education & Qualifications' :
                currentSection === 4 ? 'Experience & Services' :
                'Professional Profile'
              }
              <span className="ml-2">🏥</span>
            </CardTitle>
            <div className="w-full bg-white/20 rounded-full h-2 mt-4">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getSectionProgress()}%` }}
              ></div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {currentSection === 1 && renderSection1()}
            {currentSection === 2 && renderSection2()}
            {currentSection === 3 && renderSection3()}
            {currentSection === 4 && renderSection4()}
            {currentSection === 5 && renderSection5()}
            
            <div className="flex justify-between mt-8">
              <Button
                onClick={prevSection}
                disabled={currentSection === 1}
                variant="outline"
                className="border-teal-300 text-teal-600 hover:bg-teal-50"
              >
                Previous
              </Button>
              
              {currentSection < 5 ? (
                <Button
                  onClick={nextSection}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  Next Section
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting Application...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-2">✅</span>
                      Submit for Approval
                      <span className="ml-2">🚀</span>
                    </span>
                  )}
                </Button>
              )}
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm text-center">
                <span className="mr-2">ℹ️</span>
                Your application will be reviewed by our medical board. 
                You'll receive approval notification via email within 24-48 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDoctorRegistration;