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
  Notification
};
