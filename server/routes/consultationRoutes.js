const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/consultations - List consultations
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, client_id, from, to, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT c.*, cl.name as client_name, cl.zodiac_sign as client_zodiac, s.name as service_name
      FROM consultations c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN services s ON c.service_id = s.id
      WHERE c.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (client_id) {
      query += ' AND c.client_id = ?';
      params.push(client_id);
    }

    if (from) {
      query += ' AND c.scheduled_at >= ?';
      params.push(from);
    }

    if (to) {
      query += ' AND c.scheduled_at <= ?';
      params.push(to);
    }

    // Count
    const countQuery = query.replace(/SELECT c\.\*.*?FROM/, 'SELECT COUNT(*) as total FROM');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY c.scheduled_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const consultations = db.prepare(query).all(...params);

    res.json({
      consultations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('List consultations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/consultations/upcoming - Get upcoming consultations
router.get('/upcoming', authMiddleware, (req, res) => {
  try {
    const { days = 7 } = req.query;
    const now = new Date().toISOString();
    const futureDate = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

    const consultations = db.prepare(`
      SELECT c.*, cl.name as client_name, cl.zodiac_sign as client_zodiac, cl.phone as client_phone, s.name as service_name
      FROM consultations c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN services s ON c.service_id = s.id
      WHERE c.user_id = ? AND c.status = 'scheduled' AND c.scheduled_at >= ? AND c.scheduled_at <= ?
      ORDER BY c.scheduled_at ASC
    `).all(req.user.id, now, futureDate);

    res.json(consultations);
  } catch (err) {
    console.error('Upcoming consultations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/consultations/:id - Get consultation details
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const consultation = db.prepare(`
      SELECT c.*, cl.name as client_name, cl.email as client_email, cl.phone as client_phone,
             cl.zodiac_sign as client_zodiac, cl.date_of_birth as client_dob,
             s.name as service_name, s.description as service_description
      FROM consultations c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN services s ON c.service_id = s.id
      WHERE c.id = ? AND c.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found.' });
    }

    // Get related payments
    const payments = db.prepare('SELECT * FROM payments WHERE consultation_id = ? ORDER BY created_at DESC').all(req.params.id);

    res.json({ ...consultation, payments });
  } catch (err) {
    console.error('Get consultation error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/consultations - Create consultation
router.post('/', authMiddleware, (req, res) => {
  try {
    const { client_id, service_id, type, scheduled_at, duration_minutes, notes, amount, payment_status } = req.body;

    if (!client_id || !scheduled_at) {
      return res.status(400).json({ error: 'Client and scheduled date are required.' });
    }

    // Verify client belongs to user
    const client = db.prepare('SELECT id FROM clients WHERE id = ? AND user_id = ?').get(client_id, req.user.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const id = uuidv4();

    // If service_id provided, get service details
    let servicePrice = amount || 0;
    let serviceDuration = duration_minutes || 30;
    let consultType = type || 'general';

    if (service_id) {
      const service = db.prepare('SELECT * FROM services WHERE id = ? AND user_id = ?').get(service_id, req.user.id);
      if (service) {
        servicePrice = amount || service.price;
        serviceDuration = duration_minutes || service.duration_minutes;
        consultType = type || service.name;
      }
    }

    db.prepare(`
      INSERT INTO consultations (id, client_id, user_id, service_id, type, status, scheduled_at, duration_minutes, notes, amount, payment_status)
      VALUES (?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, ?)
    `).run(
      id, client_id, req.user.id, service_id || null,
      consultType, scheduled_at, serviceDuration,
      notes || null, servicePrice, payment_status || 'pending'
    );

    const consultation = db.prepare(`
      SELECT c.*, cl.name as client_name, s.name as service_name
      FROM consultations c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN services s ON c.service_id = s.id
      WHERE c.id = ?
    `).get(id);

    res.status(201).json(consultation);
  } catch (err) {
    console.error('Create consultation error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/consultations/:id - Update consultation
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM consultations WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Consultation not found.' });
    }

    const { status, scheduled_at, duration_minutes, notes, summary, amount, payment_status, payment_method, service_id, type } = req.body;

    db.prepare(`
      UPDATE consultations SET
        status = ?, scheduled_at = ?, duration_minutes = ?,
        notes = ?, summary = ?, amount = ?,
        payment_status = ?, payment_method = ?,
        service_id = ?, type = ?,
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(
      status || existing.status,
      scheduled_at || existing.scheduled_at,
      duration_minutes || existing.duration_minutes,
      notes !== undefined ? notes : existing.notes,
      summary !== undefined ? summary : existing.summary,
      amount !== undefined ? amount : existing.amount,
      payment_status || existing.payment_status,
      payment_method !== undefined ? payment_method : existing.payment_method,
      service_id !== undefined ? service_id : existing.service_id,
      type || existing.type,
      req.params.id, req.user.id
    );

    // If payment status changed to completed, create payment record
    if (payment_status === 'completed' && existing.payment_status !== 'completed') {
      const paymentId = uuidv4();
      db.prepare(`
        INSERT INTO payments (id, consultation_id, user_id, amount, method, status, paid_at)
        VALUES (?, ?, ?, ?, ?, 'completed', datetime('now'))
      `).run(paymentId, req.params.id, req.user.id, amount || existing.amount, payment_method || 'cash');
    }

    const consultation = db.prepare(`
      SELECT c.*, cl.name as client_name, s.name as service_name
      FROM consultations c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN services s ON c.service_id = s.id
      WHERE c.id = ?
    `).get(req.params.id);

    res.json(consultation);
  } catch (err) {
    console.error('Update consultation error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/consultations/:id - Delete consultation
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM consultations WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Consultation not found.' });
    }

    db.prepare('DELETE FROM consultations WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Consultation deleted successfully.' });
  } catch (err) {
    console.error('Delete consultation error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
