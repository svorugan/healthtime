const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Booking, Patient, Doctor, Surgery, Implant, Hospital } = require('../models');
const { authenticate } = require('../middleware/authenticate');
const { authorize, authorizeOwner } = require('../middleware/authorize');

// Create booking
router.post('/', async (req, res) => {
  const { patient_id, surgery_id, surgeon_id, implant_id, hospital_id } = req.body;

  try {
    // Calculate total cost based on selected options
    // In a real implementation, fetch actual costs from related entities
    const total_cost = 500000.0; // Base calculation
    const advance_payment = total_cost * 0.05; // 5% advance

    const booking = await Booking.create({
      patient_id,
      surgery_id,
      doctor_id: surgeon_id,
      implant_id,
      hospital_id,
      total_cost,
      advance_payment,
      status: 'pending',
      payment_status: 'pending'
    });

    return res.status(201).json({
      id: booking.id,
      patient_id: booking.patient_id,
      surgery_id: booking.surgery_id,
      doctor_id: booking.doctor_id,
      implant_id: booking.implant_id,
      hospital_id: booking.hospital_id,
      total_cost: booking.total_cost,
      advance_payment: booking.advance_payment,
      status: booking.status,
      created_at: booking.created_at
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ detail: 'Failed to create booking: ' + error.message });
  }
});

// Get booking by ID
router.get('/:booking_id', async (req, res) => {
  const { booking_id } = req.params;

  try {
    const booking = await Booking.findByPk(booking_id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Surgery, as: 'surgery' },
        { model: Implant, as: 'implant' },
        { model: Hospital, as: 'hospital' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    return res.json({
      id: booking.id,
      patient_id: booking.patient_id,
      surgery_id: booking.surgery_id,
      doctor_id: booking.doctor_id,
      implant_id: booking.implant_id,
      hospital_id: booking.hospital_id,
      total_cost: booking.total_cost,
      advance_payment: booking.advance_payment,
      status: booking.status,
      created_at: booking.created_at
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ detail: 'Failed to fetch booking: ' + error.message });
  }
});

// Get all bookings for a patient
router.get('/patient/:patient_id', authenticate, authorize('patient', 'admin'), authorizeOwner('patient_id'), async (req, res) => {
  const { patient_id } = req.params;

  try {
    const bookings = await Booking.findAll({
      where: { patient_id },
      include: [
        { model: Surgery, as: 'surgery' },
        { model: Doctor, as: 'doctor' },
        { model: Hospital, as: 'hospital' },
        { model: Implant, as: 'implant' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get patient bookings error:', error);
    return res.status(500).json({ detail: 'Failed to fetch bookings: ' + error.message });
  }
});

// Update booking status
router.put('/:booking_id', authenticate, authorize('admin', 'doctor', 'patient'), async (req, res) => {
  const { booking_id } = req.params;
  const { status, payment_status, appointment_date, notes } = req.body;

  try {
    const booking = await Booking.findByPk(booking_id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    // Check access permissions
    if (req.user.role === 'patient' && booking.patient_id !== req.user.user_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }
    if (req.user.role === 'doctor' && booking.doctor_id !== req.user.user_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    // Update allowed fields
    if (status) booking.status = status;
    if (payment_status) booking.payment_status = payment_status;
    if (appointment_date) booking.appointment_date = appointment_date;
    if (notes) booking.notes = notes;

    await booking.save();

    return res.json({
      message: 'Booking updated successfully',
      booking: booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({ detail: 'Failed to update booking: ' + error.message });
  }
});

// Cancel booking
router.delete('/:booking_id', authenticate, authorize('admin', 'patient', 'doctor'), async (req, res) => {
  const { booking_id } = req.params;

  try {
    const booking = await Booking.findByPk(booking_id);

    if (!booking) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    // Check access permissions
    if (req.user.role === 'patient' && booking.patient_id !== req.user.user_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }
    if (req.user.role === 'doctor' && booking.doctor_id !== req.user.user_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    // Update status to cancelled instead of deleting
    booking.status = 'cancelled';
    booking.cancelled_at = new Date();
    await booking.save();

    return res.json({
      message: 'Booking cancelled successfully',
      booking: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ detail: 'Failed to cancel booking: ' + error.message });
  }
});

// Get doctor's bookings
router.get('/doctor/:doctor_id', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  const { doctor_id } = req.params;

  try {
    // Check if user is the doctor or admin
    if (req.user.role === 'doctor' && req.user.user_id !== doctor_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const bookings = await Booking.findAll({
      where: { doctor_id: doctor_id },
      include: [
        { model: Patient, as: 'patient' },
        { model: Surgery, as: 'surgery' },
        { model: Hospital, as: 'hospital' },
        { model: Implant, as: 'implant' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get doctor bookings error:', error);
    return res.status(500).json({ detail: 'Failed to fetch bookings: ' + error.message });
  }
});

// Get hospital bookings
router.get('/hospital/:hospital_id', authenticate, authorize('hospital', 'admin'), async (req, res) => {
  const { hospital_id } = req.params;

  try {
    // Check if user has access to this hospital
    if (req.user.role === 'hospital') {
      // Would need to check if user belongs to this hospital
      // For now, allow if authenticated as hospital
    }

    const bookings = await Booking.findAll({
      where: { hospital_id: hospital_id },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Surgery, as: 'surgery' },
        { model: Implant, as: 'implant' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get hospital bookings error:', error);
    return res.status(500).json({ detail: 'Failed to fetch bookings: ' + error.message });
  }
});

module.exports = router;
