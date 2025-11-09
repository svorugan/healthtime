import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, FileText, Heart, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PatientProfileModal = ({ patient, isOpen, onClose }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-t-xl flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{patient.full_name || patient.name}</h2>
            <p className="text-green-100">Patient ID: #{patient.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Mail className="mr-2" size={20} />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{patient.phone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2" size={20} />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {patient.date_of_birth && (
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                </div>
              )}
              {patient.gender && (
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{patient.gender}</p>
                </div>
              )}
              {patient.blood_group && (
                <div>
                  <p className="text-xs text-gray-500">Blood Group</p>
                  <p className="font-medium">{patient.blood_group}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2" size={20} />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">City</p>
                  <p className="font-medium">{patient.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">State</p>
                  <p className="font-medium">{patient.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pincode</p>
                  <p className="font-medium">{patient.pincode || 'N/A'}</p>
                </div>
              </div>
              {patient.address && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Full Address</p>
                  <p className="font-medium">{patient.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="mr-2" size={20} />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {patient.emergency_contact_name && (
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{patient.emergency_contact_name}</p>
                  </div>
                )}
                {patient.emergency_contact_phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{patient.emergency_contact_phone}</p>
                  </div>
                )}
                {patient.emergency_contact_relation && (
                  <div>
                    <p className="text-xs text-gray-500">Relation</p>
                    <p className="font-medium capitalize">{patient.emergency_contact_relation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Heart className="mr-2" size={20} />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.medical_history && (
                <div>
                  <p className="text-xs text-gray-500">Medical History</p>
                  <p className="font-medium">{patient.medical_history}</p>
                </div>
              )}
              {patient.current_medications && (
                <div>
                  <p className="text-xs text-gray-500">Current Medications</p>
                  <p className="font-medium">{patient.current_medications}</p>
                </div>
              )}
              {patient.allergies && (
                <div>
                  <p className="text-xs text-gray-500">Allergies</p>
                  <p className="font-medium text-red-600">{patient.allergies}</p>
                </div>
              )}
              {patient.chronic_conditions && (
                <div>
                  <p className="text-xs text-gray-500">Chronic Conditions</p>
                  <p className="font-medium">{patient.chronic_conditions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2" size={20} />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.created_at && (
                <div>
                  <p className="text-xs text-gray-500">Registration Date</p>
                  <p className="font-medium">{new Date(patient.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileModal;
