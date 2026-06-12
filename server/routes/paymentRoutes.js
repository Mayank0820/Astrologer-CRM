const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/payments - List all payments
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, method, from, to, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT p.*, c.type as consultation_type, c.scheduled_at as consultation_date,
             cl.name as client_name
      FROM payments p
      LEFT JOIN consultations c ON p.consultation_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE p.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (method) {
      query += ' AND p.method = ?';
      params.push(method);
    }

    if (from) {
      query += ' AND p.paid_at >= ?';
      params.push(from);
    }

    if (to) {
      query += ' AND p.paid_at <= ?';
      params.push(to);
    }

    const countQuery = query.replace(/SELECT p\.\*.*?FROM/, 'SELECT COUNT(*) as total FROM');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY p.paid_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const payments = db.prepare(query).all(...params);

    // Summary stats
    const summary = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_received,
        COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) as total_refunded,
        COUNT(*) as total_transactions
      FROM payments WHERE user_id = ?
    `).get(req.user.id);

    res.json({
      payments,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('List payments error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
