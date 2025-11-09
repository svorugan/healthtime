const express = require('express');
const router = express.Router();
const { Surgery } = require('../models');

// Get all surgeries
router.get('/', async (req, res) => {
  try {
    const surgeries = await Surgery.findAll();
    
    const response = surgeries.map(surgery => ({
      id: surgery.id,
      name: surgery.name,
      description: surgery.description,
      image_url: surgery.image_url,
      duration: surgery.duration,
      recovery_time: surgery.recovery_time
    }));

    return res.json(response);
  } catch (error) {
    console.error('Get surgeries error:', error);
    return res.status(500).json({ detail: 'Failed to fetch surgeries: ' + error.message });
  }
});

// Get surgery by ID
router.get('/:surgery_id', async (req, res) => {
  const { surgery_id } = req.params;

  try {
    const surgery = await Surgery.findByPk(surgery_id);
    if (!surgery) {
      return res.status(404).json({ detail: 'Surgery not found' });
    }

    return res.json(surgery);
  } catch (error) {
    console.error('Get surgery error:', error);
    return res.status(500).json({ detail: 'Failed to fetch surgery: ' + error.message });
  }
});

module.exports = router;
