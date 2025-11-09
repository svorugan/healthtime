const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Patient, Doctor, Hospital, HospitalUser, Implant, ImplantUser } = require('../models');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { uploadToS3 } = require('../utils/s3');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed'));
    }
  }
});

// Upload Insurance Document
router.post('/insurance', upload.single('file'), async (req, res) => {
  const { patient_id, document_type = 'insurance_card_front' } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    // Upload to S3
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `insurance/${patient_id}`,
      req.file.mimetype
    );

    if (document_type === 'insurance_card_front') {
      patient.insurance_card_front_url = file_url;
    } else if (document_type === 'insurance_card_back') {
      patient.insurance_card_back_url = file_url;
    }

    patient.insurance_file_uploaded = true;
    await patient.save();

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype
    });
  } catch (error) {
    console.error('Insurance upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Upload Medical Document
router.post('/medical-document', upload.single('file'), async (req, res) => {
  const { patient_id, document_type = 'lab_report' } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    // Upload to S3
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `medical-documents/${patient_id}`,
      req.file.mimetype
    );

    // Store in medical_reports_url JSON array
    const currentReports = patient.medical_reports_url || [];
    currentReports.push({
      type: document_type,
      url: file_url,
      filename: req.file.originalname,
      upload_date: new Date().toISOString(),
      file_size: req.file.size
    });
    patient.medical_reports_url = currentReports;
    await patient.save();

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype
    });
  } catch (error) {
    console.error('Medical document upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Upload Doctor Verification Document
router.post('/doctor-verification', upload.single('file'), async (req, res) => {
  const { doctor_id, document_type } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    // Upload to S3
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `doctor-verification/${doctor_id}`,
      req.file.mimetype
    );

    // Map document type to doctor field
    const documentFieldMapping = {
      'medical_degree': 'medical_degree_certificate_url',
      'postgraduate_degree': 'postgraduate_certificate_url',
      'council_certificate': 'medical_council_certificate_url',
      'photo_id': 'photo_id_url',
      'indemnity_insurance': 'indemnity_insurance_url',
      'tax_certificate': 'tax_registration_certificate_url'
    };

    if (documentFieldMapping[document_type]) {
      doctor[documentFieldMapping[document_type]] = file_url;
    } else if (document_type === 'hospital_privilege') {
      // Handle multiple hospital privilege letters
      const currentLetters = doctor.hospital_privilege_letters_url || [];
      currentLetters.push({
        url: file_url,
        filename: req.file.originalname,
        upload_date: new Date().toISOString()
      });
      doctor.hospital_privilege_letters_url = currentLetters;
    }

    await doctor.save();

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype
    });
  } catch (error) {
    console.error('Doctor verification upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Upload Hospital Document
router.post('/hospital-document', upload.single('file'), authenticate, authorize('hospital', 'admin'), async (req, res) => {
  const { hospital_id, document_type } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const hospital = await Hospital.findByPk(hospital_id);
    if (!hospital) {
      return res.status(404).json({ detail: 'Hospital not found' });
    }

    // Check access
    if (req.user.role === 'hospital') {
      const hospitalUser = await HospitalUser.findOne({
        where: { user_id: req.user.user_id, hospital_id: hospital_id }
      });
      if (!hospitalUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    // Upload to S3
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `hospital-documents/${hospital_id}`,
      req.file.mimetype
    );

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype,
      document_type: document_type,
      message: 'Hospital document uploaded successfully'
    });
  } catch (error) {
    console.error('Hospital document upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Upload Implant Certificate
router.post('/implant-certificate', upload.single('file'), authenticate, authorize('implant', 'admin'), async (req, res) => {
  const { implant_id, document_type = 'certificate' } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const implant = await Implant.findByPk(implant_id);
    if (!implant) {
      return res.status(404).json({ detail: 'Implant not found' });
    }

    // Check access
    if (req.user.role === 'implant') {
      const implantUser = await ImplantUser.findOne({
        where: { user_id: req.user.user_id, implant_id: implant_id }
      });
      if (!implantUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    // Upload to S3
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `implant-certificates/${implant_id}`,
      req.file.mimetype
    );

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype,
      document_type: document_type,
      message: 'Implant certificate uploaded successfully'
    });
  } catch (error) {
    console.error('Implant certificate upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Upload Patient Prescription
router.post('/patient-prescription', upload.single('file'), authenticate, authorize('patient', 'doctor', 'admin'), async (req, res) => {
  const { patient_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    // Check access
    if (req.user.role === 'patient' && req.user.user_id !== patient_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    // Upload to S3
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `prescriptions/${patient_id}`,
      req.file.mimetype
    );

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype,
      message: 'Prescription uploaded successfully'
    });
  } catch (error) {
    console.error('Prescription upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

module.exports = router;

