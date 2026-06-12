const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Helper: calculate zodiac sign from date of birth
function getZodiacSign(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return null;
}

// Helper: get Nakshatra (simplified approximation)
function getNakshatra(dateStr) {
  if (!dateStr) return null;
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  const date = new Date(dateStr);
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return nakshatras[dayOfYear % 27];
}

// GET /api/clients - List all clients
router.get('/', authMiddleware, (req, res) => {
  try {
    const { search, zodiac, sort = 'created_at', order = 'desc', page = 1, limit = 50 } = req.query;

    let query = 'SELECT * FROM clients WHERE user_id = ?';
    const params = [req.user.id];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR place_of_birth LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (zodiac) {
      query += ' AND zodiac_sign = ?';
      params.push(zodiac);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    // Add sorting and pagination
    const validSorts = ['name', 'created_at', 'date_of_birth', 'zodiac_sign'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const clients = db.prepare(query).all(...params);

    // Get consultation count for each client
    const stmtCount = db.prepare('SELECT COUNT(*) as count FROM consultations WHERE client_id = ?');
    const stmtLastConsult = db.prepare('SELECT scheduled_at FROM consultations WHERE client_id = ? ORDER BY scheduled_at DESC LIMIT 1');

    const enrichedClients = clients.map(client => ({
      ...client,
      consultation_count: stmtCount.get(client.id).count,
      last_consultation: stmtLastConsult.get(client.id)?.scheduled_at || null
    }));

    res.json({
      clients: enrichedClients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('List clients error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/clients/:id - Get client details
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    // Get consultations for this client
    const consultations = db.prepare(`
      SELECT c.*, s.name as service_name
      FROM consultations c
      LEFT JOIN services s ON c.service_id = s.id
      WHERE c.client_id = ? AND c.user_id = ?
      ORDER BY c.scheduled_at DESC
    `).all(req.params.id, req.user.id);

    // Get payment summary
    const paymentSummary = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END), 0) as total_pending,
        COUNT(*) as total_consultations
      FROM consultations
      WHERE client_id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    res.json({ ...client, consultations, paymentSummary });
  } catch (err) {
    console.error('Get client error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/clients - Create new client
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, email, phone, gender, date_of_birth, time_of_birth, place_of_birth, latitude, longitude, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    const id = uuidv4();
    const zodiac_sign = getZodiacSign(date_of_birth);
    const nakshatra = getNakshatra(date_of_birth);

    db.prepare(`
      INSERT INTO clients (id, user_id, name, email, phone, gender, date_of_birth, time_of_birth, place_of_birth, latitude, longitude, zodiac_sign, nakshatra, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user.id, name,
      email || null, phone || null, gender || null,
      date_of_birth || null, time_of_birth || null, place_of_birth || null,
      latitude || null, longitude || null,
      zodiac_sign, nakshatra, notes || null
    );

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    res.status(201).json(client);
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const { name, email, phone, gender, date_of_birth, time_of_birth, place_of_birth, latitude, longitude, notes } = req.body;

    const updatedDob = date_of_birth !== undefined ? date_of_birth : existing.date_of_birth;
    const zodiac_sign = getZodiacSign(updatedDob);
    const nakshatra = getNakshatra(updatedDob);

    db.prepare(`
      UPDATE clients SET
        name = ?, email = ?, phone = ?, gender = ?,
        date_of_birth = ?, time_of_birth = ?, place_of_birth = ?,
        latitude = ?, longitude = ?,
        zodiac_sign = ?, nakshatra = ?, notes = ?,
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(
      name || existing.name,
      email !== undefined ? email : existing.email,
      phone !== undefined ? phone : existing.phone,
      gender !== undefined ? gender : existing.gender,
      updatedDob,
      time_of_birth !== undefined ? time_of_birth : existing.time_of_birth,
      place_of_birth !== undefined ? place_of_birth : existing.place_of_birth,
      latitude !== undefined ? latitude : existing.latitude,
      longitude !== undefined ? longitude : existing.longitude,
      zodiac_sign, nakshatra,
      notes !== undefined ? notes : existing.notes,
      req.params.id, req.user.id
    );

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    res.json(client);
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM clients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    db.prepare('DELETE FROM clients WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Client deleted successfully.' });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
