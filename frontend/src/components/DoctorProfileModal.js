import React from 'react';
import { X, Mail, Phone, MapPin, Briefcase, Award, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const DoctorProfileModal = ({ doctor, isOpen, onClose, onApprove, onReject, isAdmin = false }) => {
  if (!isOpen || !doctor) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-blue-500 text-white p-6 rounded-t-xl flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{doctor.full_name}</h2>
            <p className="text-teal-100">{doctor.primary_specialization || doctor.specialization}</p>
            <div className="mt-3">
              <Badge className={`${getStatusColor(doctor.status)} border`}>
                {doctor.status?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>
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
                  <p className="font-medium">{doctor.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{doctor.phone}</p>
                </div>
              </div>
              {doctor.alternate_phone && (
                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Alternate Phone</p>
                    <p className="font-medium">{doctor.alternate_phone}</p>
                  </div>
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
                  <p className="font-medium">{doctor.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">State</p>
                  <p className="font-medium">{doctor.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pincode</p>
                  <p className="font-medium">{doctor.pincode || 'N/A'}</p>
                </div>
              </div>
              {doctor.address && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Full Address</p>
                  <p className="font-medium">{doctor.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Briefcase className="mr-2" size={20} />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Medical Council Number</p>
                <p className="font-medium">{doctor.medical_council_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Experience</p>
                <p className="font-medium">{doctor.experience_years || 0} years</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Consultation Fee</p>
                <p className="font-medium text-teal-600">₹{doctor.consultation_fee || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-medium capitalize">{doctor.gender || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Award className="mr-2" size={20} />
                Education & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {doctor.medical_degree && (
                <div>
                  <p className="text-xs text-gray-500">Medical Degree</p>
                  <p className="font-medium">{doctor.medical_degree}</p>
                </div>
              )}
              {doctor.medical_degree_institution && (
                <div>
                  <p className="text-xs text-gray-500">Institution</p>
                  <p className="font-medium">{doctor.medical_degree_institution}</p>
                </div>
              )}
              {doctor.medical_degree_year && (
                <div>
                  <p className="text-xs text-gray-500">Year of Completion</p>
                  <p className="font-medium">{doctor.medical_degree_year}</p>
                </div>
              )}
              {doctor.postgraduate_degree && (
                <div>
                  <p className="text-xs text-gray-500">Postgraduate Degree</p>
                  <p className="font-medium">{doctor.postgraduate_degree}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio */}
          {doctor.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2" size={20} />
                  Professional Bio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2" size={20} />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctor.created_at && (
                <div>
                  <p className="text-xs text-gray-500">Registration Date</p>
                  <p className="font-medium">{new Date(doctor.created_at).toLocaleDateString()}</p>
                </div>
              )}
              {doctor.approved_at && (
                <div>
                  <p className="text-xs text-gray-500">Approval Date</p>
                  <p className="font-medium">{new Date(doctor.approved_at).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="flex gap-3 pt-4 border-t">
              {doctor.status !== 'approved' && (
                <Button
                  onClick={() => {
                    onApprove(doctor.id);
                    onClose();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2" size={18} />
                  Approve Doctor
                </Button>
              )}
              {doctor.status !== 'rejected' && (
                <Button
                  onClick={() => {
                    onReject(doctor.id);
                    onClose();
                  }}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="mr-2" size={18} />
                  Reject Doctor
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileModal;
