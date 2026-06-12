const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/services - List services
router.get('/', authMiddleware, (req, res) => {
  try {
    const { active_only } = req.query;
    let query = 'SELECT * FROM services WHERE user_id = ?';
    const params = [req.user.id];

    if (active_only === 'true') {
      query += ' AND is_active = 1';
    }

    query += ' ORDER BY created_at DESC';
    const services = db.prepare(query).all(...params);

    // Get consultation count per service
    const stmtCount = db.prepare('SELECT COUNT(*) as count FROM consultations WHERE service_id = ?');
    const enrichedServices = services.map(service => ({
      ...service,
      consultation_count: stmtCount.get(service.id).count
    }));

    res.json(enrichedServices);
  } catch (err) {
    console.error('List services error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/services - Create service
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description, duration_minutes, price, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Service name is required.' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO services (id, user_id, name, description, duration_minutes, price, icon)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, name, description || null, duration_minutes || 30, price || 0, icon || 'star');

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    res.status(201).json(service);
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/services/:id - Update service
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM services WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const { name, description, duration_minutes, price, is_active, icon } = req.body;

    db.prepare(`
      UPDATE services SET
        name = ?, description = ?, duration_minutes = ?,
        price = ?, is_active = ?, icon = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name || existing.name,
      description !== undefined ? description : existing.description,
      duration_minutes || existing.duration_minutes,
      price !== undefined ? price : existing.price,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      icon || existing.icon,
      req.params.id, req.user.id
    );

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    res.json(service);
  } catch (err) {
    console.error('Update service error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/services/:id - Delete service
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM services WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    db.prepare('DELETE FROM services WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('Delete service error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
