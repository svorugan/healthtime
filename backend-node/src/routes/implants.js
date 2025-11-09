const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Implant, Booking, ImplantUser, Patient, Doctor, Surgery, Hospital } = require('../models');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

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

// Get all implants
router.get('/', async (req, res) => {
  const { surgery_id } = req.query;

  try {
    const whereClause = {};
    if (surgery_id) {
      whereClause.surgery_type = surgery_id;
    }

    const implants = await Implant.findAll({ where: whereClause });
    
    const response = implants.map(implant => ({
      id: implant.id,
      name: implant.name,
      brand: implant.brand,
      brand_type: implant.brand_type,
      expected_life: implant.expected_life,
      range_of_motion: implant.range_of_motion,
      peer_reviewed_studies: implant.peer_reviewed_studies,
      price: implant.price,
      description: implant.description
    }));

    return res.json(response);
  } catch (error) {
    console.error('Get implants error:', error);
    return res.status(500).json({ detail: 'Failed to fetch implants: ' + error.message });
  }
});

// Get implant by ID
router.get('/:implant_id', async (req, res) => {
  const { implant_id } = req.params;

  try {
    const implant = await Implant.findByPk(implant_id);
    if (!implant) {
      return res.status(404).json({ detail: 'Implant not found' });
    }

    return res.json(implant);
  } catch (error) {
    console.error('Get implant error:', error);
    return res.status(500).json({ detail: 'Failed to fetch implant: ' + error.message });
  }
});

// Update implant (implant admin only)
router.put('/:implant_id', authenticate, authorize('implant', 'admin'), async (req, res) => {
  const { implant_id } = req.params;
  const updateData = req.body;

  try {
    // Check if user has access to this implant
    if (req.user.role === 'implant') {
      const implantUser = await ImplantUser.findOne({
        where: { user_id: req.user.user_id, implant_id: implant_id }
      });
      if (!implantUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    const implant = await Implant.findByPk(implant_id);
    if (!implant) {
      return res.status(404).json({ detail: 'Implant not found' });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.status;

    await implant.update(updateData);

    return res.json({
      message: 'Implant updated successfully',
      implant: implant
    });
  } catch (error) {
    console.error('Update implant error:', error);
    return res.status(500).json({ detail: 'Failed to update implant: ' + error.message });
  }
});

// Get implant usage stats (bookings)
router.get('/:implant_id/bookings', authenticate, authorize('implant', 'admin'), async (req, res) => {
  const { implant_id } = req.params;

  try {
    // Check if user has access to this implant
    if (req.user.role === 'implant') {
      const implantUser = await ImplantUser.findOne({
        where: { user_id: req.user.user_id, implant_id: implant_id }
      });
      if (!implantUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    const bookings = await Booking.findAll({
      where: { implant_id: implant_id },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Surgery, as: 'surgery' },
        { model: Hospital, as: 'hospital' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get implant bookings error:', error);
    return res.status(500).json({ detail: 'Failed to fetch bookings: ' + error.message });
  }
});

// Get implant analytics
router.get('/:implant_id/analytics', authenticate, authorize('implant', 'admin'), async (req, res) => {
  const { implant_id } = req.params;

  try {
    // Check if user has access to this implant
    if (req.user.role === 'implant') {
      const implantUser = await ImplantUser.findOne({
        where: { user_id: req.user.user_id, implant_id: implant_id }
      });
      if (!implantUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    const bookings = await Booking.findAll({
      where: { implant_id: implant_id }
    });

    const analytics = {
      total_usage: bookings.length,
      total_revenue: bookings.reduce((sum, b) => sum + (b.total_cost || 0), 0),
      average_booking_value: bookings.length > 0 
        ? bookings.reduce((sum, b) => sum + (b.total_cost || 0), 0) / bookings.length 
        : 0,
      usage_by_surgery: {}
    };

    // Group by surgery type
    for (const booking of bookings) {
      const surgery = await Surgery.findByPk(booking.surgery_id);
      if (surgery) {
        analytics.usage_by_surgery[surgery.name] = (analytics.usage_by_surgery[surgery.name] || 0) + 1;
      }
    }

    return res.json(analytics);
  } catch (error) {
    console.error('Get implant analytics error:', error);
    return res.status(500).json({ detail: 'Failed to fetch analytics: ' + error.message });
  }
});

// Update implant pricing
router.post('/:implant_id/pricing', authenticate, authorize('implant', 'admin'), async (req, res) => {
  const { implant_id } = req.params;
  const { price } = req.body;

  try {
    // Check if user has access to this implant
    if (req.user.role === 'implant') {
      const implantUser = await ImplantUser.findOne({
        where: { user_id: req.user.user_id, implant_id: implant_id }
      });
      if (!implantUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    if (!price || price < 0) {
      return res.status(400).json({ detail: 'Valid price is required' });
    }

    const implant = await Implant.findByPk(implant_id);
    if (!implant) {
      return res.status(404).json({ detail: 'Implant not found' });
    }

    implant.price = price;
    await implant.save();

    return res.json({
      message: 'Pricing updated successfully',
      implant: {
        id: implant.id,
        name: implant.name,
        price: implant.price
      }
    });
  } catch (error) {
    console.error('Update implant pricing error:', error);
    return res.status(500).json({ detail: 'Failed to update pricing: ' + error.message });
  }
});

// Upload implant certificate
router.post('/upload/implant-certificate', upload.single('file'), authenticate, authorize('implant', 'admin'), async (req, res) => {
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
    const { uploadToS3 } = require('../utils/s3');
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `implant-certificates/${implant_id}`,
      req.file.mimetype
    );

    // Store certificate URL (could update implant.brochure_url or add certificates JSONB field)
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

module.exports = router;
