const { sequelize } = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const AdminUser = require('./AdminUser');
const HospitalUser = require('./HospitalUser');
const ImplantUser = require('./ImplantUser');
const Surgery = require('./Surgery');
const DoctorSurgery = require('./DoctorSurgery');
const Implant = require('./Implant');
const Hospital = require('./Hospital');
const Booking = require('./Booking');
const PatientMedicalHistory = require('./PatientMedicalHistory');
const PatientVitalSigns = require('./PatientVitalSigns');
const Notification = require('./Notification');

// New models for complete schema v2
const HospitalAvailability = require('./HospitalAvailability');
const DoctorAvailability = require('./DoctorAvailability');
const PatientTestimonial = require('./PatientTestimonial');
const Review = require('./Review');
const ServiceTile = require('./ServiceTile');
const FeaturedContent = require('./FeaturedContent');
const FeatureConfiguration = require('./FeatureConfiguration');
const OtpLog = require('./OtpLog');
const CommissionAgreement = require('./CommissionAgreement');
const CommissionTransaction = require('./CommissionTransaction');
const LandingPageAnalytics = require('./LandingPageAnalytics');

// Define relationships between User and profile tables
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patientProfile' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(AdminUser, { foreignKey: 'user_id', as: 'adminProfile' });
AdminUser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(HospitalUser, { foreignKey: 'user_id', as: 'hospitalProfile' });
HospitalUser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(ImplantUser, { foreignKey: 'user_id', as: 'implantProfile' });
ImplantUser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Define relationships
Patient.hasMany(Booking, { foreignKey: 'patient_id', as: 'bookings' });
Booking.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Doctor.hasMany(Booking, { foreignKey: 'doctor_id', as: 'bookings' });
Booking.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

Surgery.hasMany(Booking, { foreignKey: 'surgery_id', as: 'bookings' });
Booking.belongsTo(Surgery, { foreignKey: 'surgery_id', as: 'surgery' });

Implant.hasMany(Booking, { foreignKey: 'implant_id', as: 'bookings' });
Booking.belongsTo(Implant, { foreignKey: 'implant_id', as: 'implant' });

Hospital.hasMany(Booking, { foreignKey: 'hospital_id', as: 'bookings' });
Booking.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

Patient.hasMany(PatientMedicalHistory, { foreignKey: 'patient_id', as: 'medicalHistory' });
PatientMedicalHistory.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Patient.hasMany(PatientVitalSigns, { foreignKey: 'patient_id', as: 'vitalSigns' });
PatientVitalSigns.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Hospital relationships
Hospital.hasMany(HospitalUser, { foreignKey: 'hospital_id', as: 'hospitalUsers' });
HospitalUser.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

// Implant relationships
Implant.hasMany(ImplantUser, { foreignKey: 'implant_id', as: 'implantUsers' });
ImplantUser.belongsTo(Implant, { foreignKey: 'implant_id', as: 'implant' });

// Doctor-Surgery many-to-many relationship
Doctor.belongsToMany(Surgery, { 
  through: DoctorSurgery, 
  foreignKey: 'doctor_id', 
  as: 'surgeries' 
});
Surgery.belongsToMany(Doctor, { 
  through: DoctorSurgery, 
  foreignKey: 'surgery_id', 
  as: 'doctors' 
});

Doctor.hasMany(DoctorSurgery, { foreignKey: 'doctor_id', as: 'doctorSurgeries' });
DoctorSurgery.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

Surgery.hasMany(DoctorSurgery, { foreignKey: 'surgery_id', as: 'surgeryDoctors' });
DoctorSurgery.belongsTo(Surgery, { foreignKey: 'surgery_id', as: 'surgery' });

// Notification relationships
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Hospital Availability relationships
Hospital.hasMany(HospitalAvailability, { foreignKey: 'hospital_id', as: 'availability' });
HospitalAvailability.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

// Doctor Availability relationships
Doctor.hasMany(DoctorAvailability, { foreignKey: 'doctor_id', as: 'availability' });
DoctorAvailability.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Patient Testimonial relationships
Doctor.hasMany(PatientTestimonial, { foreignKey: 'doctor_id', as: 'testimonials' });
PatientTestimonial.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

Patient.hasMany(PatientTestimonial, { foreignKey: 'patient_id', as: 'testimonials' });
PatientTestimonial.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Hospital.hasMany(PatientTestimonial, { foreignKey: 'hospital_id', as: 'testimonials' });
PatientTestimonial.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

Booking.hasMany(PatientTestimonial, { foreignKey: 'booking_id', as: 'testimonials' });
PatientTestimonial.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Review relationships
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'reviewsGiven' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

Booking.hasMany(Review, { foreignKey: 'booking_id', as: 'reviews' });
Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Commission Agreement relationships
User.hasMany(CommissionAgreement, { foreignKey: 'approved_by', as: 'approvedAgreements' });
CommissionAgreement.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

// Commission Transaction relationships
CommissionAgreement.hasMany(CommissionTransaction, { foreignKey: 'commission_agreement_id', as: 'transactions' });
CommissionTransaction.belongsTo(CommissionAgreement, { foreignKey: 'commission_agreement_id', as: 'agreement' });

Booking.hasMany(CommissionTransaction, { foreignKey: 'booking_id', as: 'commissionTransactions' });
CommissionTransaction.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// OTP Log relationships
User.hasMany(OtpLog, { foreignKey: 'user_id', as: 'otpLogs' });
OtpLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Landing Page Analytics relationships
User.hasMany(LandingPageAnalytics, { foreignKey: 'user_id', as: 'analyticsData' });
LandingPageAnalytics.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Patient,
  Doctor,
  AdminUser,
  HospitalUser,
  ImplantUser,
  Surgery,
  DoctorSurgery,
  Implant,
  Hospital,
  Booking,
  PatientMedicalHistory,
  PatientVitalSigns,
  Notification,
  // New models for complete schema v2
  HospitalAvailability,
  DoctorAvailability,
  PatientTestimonial,
  Review,
  ServiceTile,
  FeaturedContent,
  FeatureConfiguration,
  OtpLog,
  CommissionAgreement,
  CommissionTransaction,
  LandingPageAnalytics
};
