const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    // Total clients
    const { total_clients } = db.prepare('SELECT COUNT(*) as total_clients FROM clients WHERE user_id = ?').get(userId);

    // Total consultations
    const { total_consultations } = db.prepare('SELECT COUNT(*) as total_consultations FROM consultations WHERE user_id = ?').get(userId);

    // Today's consultations
    const today = new Date().toISOString().split('T')[0];
    const { today_consultations } = db.prepare(`
      SELECT COUNT(*) as today_consultations FROM consultations
      WHERE user_id = ? AND date(scheduled_at) = date(?)
    `).get(userId, today);

    // Upcoming consultations (next 7 days)
    const now = new Date().toISOString();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { upcoming_consultations } = db.prepare(`
      SELECT COUNT(*) as upcoming_consultations FROM consultations
      WHERE user_id = ? AND status = 'scheduled' AND scheduled_at >= ? AND scheduled_at <= ?
    `).get(userId, now, nextWeek);

    // Total revenue (completed payments)
    const { total_revenue } = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_revenue FROM consultations
      WHERE user_id = ? AND payment_status = 'completed'
    `).get(userId);

    // Pending payments
    const { pending_amount } = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as pending_amount FROM consultations
      WHERE user_id = ? AND payment_status = 'pending' AND amount > 0
    `).get(userId);

    // This month's revenue
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { monthly_revenue } = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as monthly_revenue FROM consultations
      WHERE user_id = ? AND payment_status = 'completed' AND scheduled_at >= ?
    `).get(userId, monthStart);

    // Completed consultations
    const { completed_consultations } = db.prepare(`
      SELECT COUNT(*) as completed_consultations FROM consultations
      WHERE user_id = ? AND status = 'completed'
    `).get(userId);

    // Zodiac distribution
    const zodiacDistribution = db.prepare(`
      SELECT zodiac_sign, COUNT(*) as count FROM clients
      WHERE user_id = ? AND zodiac_sign IS NOT NULL
      GROUP BY zodiac_sign ORDER BY count DESC
    `).all(userId);

    res.json({
      total_clients,
      total_consultations,
      today_consultations,
      upcoming_consultations,
      total_revenue,
      pending_amount,
      monthly_revenue,
      completed_consultations,
      zodiac_distribution: zodiacDistribution
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/dashboard/recent-activity - Recent activity
router.get('/recent-activity', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    // Recent consultations
    const recentConsultations = db.prepare(`
      SELECT c.*, cl.name as client_name, cl.zodiac_sign as client_zodiac, s.name as service_name
      FROM consultations c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN services s ON c.service_id = s.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC LIMIT 10
    `).all(userId);

    // Recent clients
    const recentClients = db.prepare(`
      SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `).all(userId);

    // Revenue by month (last 6 months)
    const revenueByMonth = db.prepare(`
      SELECT
        strftime('%Y-%m', scheduled_at) as month,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0) as revenue,
        COUNT(*) as consultation_count
      FROM consultations
      WHERE user_id = ? AND scheduled_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', scheduled_at)
      ORDER BY month ASC
    `).all(userId);

    // Consultation status breakdown
    const statusBreakdown = db.prepare(`
      SELECT status, COUNT(*) as count FROM consultations
      WHERE user_id = ?
      GROUP BY status
    `).all(userId);

    res.json({
      recentConsultations,
      recentClients,
      revenueByMonth,
      statusBreakdown
    });
  } catch (err) {
    console.error('Recent activity error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
