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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EnhancedPatientRegistration = ({ onNext }) => {
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    full_name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    date_of_birth: '',
    gender: '',
    occupation: '',
    preferred_language: 'English',
    
    // Address Information
    current_address: '',
    permanent_address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Communication Preferences
    preferred_communication: 'email',
    
    // Insurance Information
    insurance_provider: '',
    insurance_number: '',
    insurance_plan_type: '',
    insurance_group_number: '',
    policy_holder_name: '',
    employer_name: '',
    secondary_insurance_provider: '',
    secondary_insurance_number: '',
    
    // Financial Information
    preferred_payment_method: 'insurance',
    financial_assistance_needed: false,
    
    // Medical Information
    blood_group: '',
    height_cm: '',
    weight_kg: '',
    
    // Lifestyle
    smoking_status: 'never',
    alcohol_consumption: 'none',
    substance_use_history: '',
    
    // Medical History
    current_medications: [],
    known_allergies: [],
    chronic_conditions: [],
    past_surgeries: [],
    family_medical_history: [],
    
    // Current Health
    chief_complaint: '',
    current_symptoms: [],
    pain_scale: '',
    
    // Healthcare Providers
    primary_care_physician_name: '',
    primary_care_physician_phone: '',
    primary_care_physician_address: ''
  });

  // Medication management
  const [currentMedication, setCurrentMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    prescribing_doctor: '',
    reason: ''
  });

  // Allergy management
  const [currentAllergy, setCurrentAllergy] = useState({
    type: 'drug',
    allergen: '',
    severity: 'mild',
    reaction: ''
  });

  // Symptom management
  const [currentSymptom, setCurrentSymptom] = useState({
    symptom: '',
    duration: '',
    severity: 1,
    frequency: ''
  });

  const addMedication = () => {
    if (currentMedication.name && currentMedication.dosage) {
      setFormData(prev => ({
        ...prev,
        current_medications: [...prev.current_medications, currentMedication]
      }));
      setCurrentMedication({
        name: '',
        dosage: '',
        frequency: '',
        prescribing_doctor: '',
        reason: ''
      });
    }
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      current_medications: prev.current_medications.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (currentAllergy.allergen && currentAllergy.reaction) {
      setFormData(prev => ({
        ...prev,
        known_allergies: [...prev.known_allergies, currentAllergy]
      }));
      setCurrentAllergy({
        type: 'drug',
        allergen: '',
        severity: 'mild',
        reaction: ''
      });
    }
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      known_allergies: prev.known_allergies.filter((_, i) => i !== index)
    }));
  };

  const addSymptom = () => {
    if (currentSymptom.symptom && currentSymptom.duration) {
      setFormData(prev => ({
        ...prev,
        current_symptoms: [...prev.current_symptoms, currentSymptom]
      }));
      setCurrentSymptom({
        symptom: '',
        duration: '',
        severity: 1,
        frequency: ''
      });
    }
  };

  const removeSymptom = (index) => {
    setFormData(prev => ({
      ...prev,
      current_symptoms: prev.current_symptoms.filter((_, i) => i !== index)
    }));
  };

  const addCondition = (type, condition) => {
    if (condition.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], condition.trim()]
      }));
    }
  };

  const removeCondition = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Validate required fields
      const requiredFields = ['full_name', 'email', 'phone', 'date_of_birth', 'gender', 
                             'current_address', 'city', 'state', 'pincode',
                             'emergency_contact_name', 'emergency_contact_phone', 
                             'insurance_provider', 'insurance_number'];
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          toast.error(`Please fill in ${field.replace('_', ' ')}`);
          setLoading(false);
          return;
        }
      }

      const response = await axios.post(`${API}/patients/enhanced`, formData);
      
      toast.success(`Registration successful! Profile ${response.data.profile_completeness}% complete`);
      onNext({ 
        patientId: response.data.patient_id, 
        patientData: formData,
        profileCompleteness: response.data.profile_completeness 
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSection = () => {
    if (currentSection < 6) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const getSectionProgress = () => {
    return (currentSection / 6) * 100;
  };

  const renderSection1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-teal-700 flex items-center">
        <span className="mr-2">👤</span>
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
          <Label htmlFor="alternate_phone">Alternate Phone</Label>
          <Input
            id="alternate_phone"
            value={formData.alternate_phone}
            onChange={(e) => setFormData({...formData, alternate_phone: e.target.value})}
            className="border-teal-200 focus:border-teal-500"
          />
        </div>
        <div>
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
            required
            className="border-teal-200 focus:border-teal-500"
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})} required>
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
        <div>
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e) => setFormData({...formData, occupation: e.target.value})}
            className="border-teal-200 focus:border-teal-500"
          />
        </div>
        <div>
          <Label htmlFor="preferred_language">Preferred Language</Label>
          <Select value={formData.preferred_language} onValueChange={(value) => setFormData({...formData, preferred_language: value})}>
            <SelectTrigger className="border-teal-200 focus:border-teal-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Telugu">Telugu</SelectItem>
              <SelectItem value="Tamil">Tamil</SelectItem>
              <SelectItem value="Kannada">Kannada</SelectItem>
              <SelectItem value="Malayalam">Malayalam</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-teal-700 flex items-center">
        <span className="mr-2">🏠</span>
        Address & Contact Information
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="current_address">Current Address *</Label>
          <Textarea
            id="current_address"
            value={formData.current_address}
            onChange={(e) => setFormData({...formData, current_address: e.target.value})}
            required
            className="border-teal-200 focus:border-teal-500"
          />
        </div>
        <div>
          <Label htmlFor="permanent_address">Permanent Address (if different)</Label>
          <Textarea
            id="permanent_address"
            value={formData.permanent_address}
            onChange={(e) => setFormData({...formData, permanent_address: e.target.value})}
            className="border-teal-200 focus:border-teal-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required
              className="border-teal-200 focus:border-teal-500"
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
            />
          </div>
          <div>
            <Label htmlFor="pincode">PIN Code *</Label>
            <Input
              id="pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({...formData, pincode: e.target.value})}
              required
              pattern="[0-9]{6}"
              className="border-teal-200 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-teal-200" />
      
      <h4 className="text-md font-semibold text-teal-600">Emergency Contact</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
          <Input
            id="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
            required
            className="border-teal-200 focus:border-teal-500"
          />
        </div>
        <div>
          <Label htmlFor="emergency_contact_phone">Emergency Contact Phone *</Label>
          <Input
            id="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
            required
            className="border-teal-200 focus:border-teal-500"
          />
        </div>
        <div>
          <Label htmlFor="emergency_contact_relationship">Relationship</Label>
          <Select value={formData.emergency_contact_relationship} onValueChange={(value) => setFormData({...formData, emergency_contact_relationship: value})}>
            <SelectTrigger className="border-teal-200 focus:border-teal-500">
              <SelectValue placeholder="Select Relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spouse">Spouse</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="sibling">Sibling</SelectItem>
              <SelectItem value="child">Child</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="preferred_communication">Preferred Communication</Label>
        <Select value={formData.preferred_communication} onValueChange={(value) => setFormData({...formData, preferred_communication: value})}>
          <SelectTrigger className="border-teal-200 focus:border-teal-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="call">Phone Call</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            ✨ Enhanced Health Profile ✨
          </h1>
          <p className="text-xl text-slate-600">Complete your comprehensive health journey</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              <span className="mr-2">🏥</span>
              Step {currentSection} of 6: {
                currentSection === 1 ? 'Basic Information' :
                currentSection === 2 ? 'Address & Contact' :
                currentSection === 3 ? 'Insurance & Financial' :
                currentSection === 4 ? 'Medical History' :
                currentSection === 5 ? 'Current Health' :
                'Healthcare Providers'
              }
              <span className="ml-2">📋</span>
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
            {/* Additional sections will be implemented in part 2 */}
            
            <div className="flex justify-between mt-8">
              <Button
                onClick={prevSection}
                disabled={currentSection === 1}
                variant="outline"
                className="border-teal-300 text-teal-600 hover:bg-teal-50"
              >
                Previous
              </Button>
              
              {currentSection < 6 ? (
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
                      Completing Profile...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-2">✅</span>
                      Complete Registration
                      <span className="ml-2">🚀</span>
                    </span>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedPatientRegistration;