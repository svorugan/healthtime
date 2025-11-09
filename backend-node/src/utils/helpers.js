const calculatePatientProfileCompleteness = (patient) => {
  const totalFields = 20;
  let completedFields = 0;

  // Basic required fields
  if (patient.full_name) completedFields++;
  if (patient.email) completedFields++;
  if (patient.phone) completedFields++;
  if (patient.age) completedFields++;
  if (patient.gender) completedFields++;
  if (patient.current_address) completedFields++;
  if (patient.emergency_contact_name) completedFields++;
  if (patient.emergency_contact_phone) completedFields++;
  if (patient.insurance_provider) completedFields++;
  if (patient.insurance_number) completedFields++;

  // Optional but important fields
  if (patient.blood_group) completedFields++;
  if (patient.height_cm) completedFields++;
  if (patient.weight_kg) completedFields++;
  if (patient.current_medications) completedFields++;
  if (patient.known_allergies) completedFields++;
  if (patient.chronic_conditions) completedFields++;
  if (patient.past_surgeries) completedFields++;
  if (patient.family_medical_history) completedFields++;
  if (patient.primary_care_physician) completedFields++;
  if (patient.insurance_file_uploaded) completedFields++;

  return Math.floor((completedFields / totalFields) * 100);
};

const calculateDoctorProfileCompleteness = (doctor) => {
  const totalFields = 25;
  let completedFields = 0;

  // Basic required fields
  if (doctor.full_name) completedFields++;
  if (doctor.email) completedFields++;
  if (doctor.phone) completedFields++;
  if (doctor.primary_specialization) completedFields++;
  if (doctor.medical_council_number) completedFields++;
  if (doctor.experience_years) completedFields++;
  if (doctor.consultation_fee) completedFields++;
  if (doctor.bio) completedFields++;

  // Professional details
  if (doctor.training_type) completedFields++;
  if (doctor.fellowships) completedFields++;
  if (doctor.procedures_completed) completedFields++;
  if (doctor.secondary_specializations) completedFields++;
  if (doctor.languages_spoken) completedFields++;
  if (doctor.clinic_address) completedFields++;
  if (doctor.city) completedFields++;
  if (doctor.state) completedFields++;
  if (doctor.google_reviews_link) completedFields++;
  if (doctor.website_url) completedFields++;
  if (doctor.linkedin_url) completedFields++;
  if (doctor.image_url) completedFields++;
  if (doctor.online_consultation !== undefined) completedFields++;
  if (doctor.in_person_consultation !== undefined) completedFields++;
  if (doctor.emergency_services !== undefined) completedFields++;
  if (doctor.surgery_fee) completedFields++;
  if (doctor.followup_fee) completedFields++;

  return Math.floor((completedFields / totalFields) * 100);
};

const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
};

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = {
  calculatePatientProfileCompleteness,
  calculateDoctorProfileCompleteness,
  calculateBMI,
  calculateAge
};
