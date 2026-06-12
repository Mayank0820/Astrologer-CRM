const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

console.log('🌟 Seeding database...\n');

// Clear existing data
db.exec(`
  DELETE FROM payments;
  DELETE FROM consultations;
  DELETE FROM services;
  DELETE FROM clients;
  DELETE FROM users;
`);

// Create demo astrologer
const userId = uuidv4();
const passwordHash = bcrypt.hashSync('password123', 10);

db.prepare(`
  INSERT INTO users (id, name, email, password_hash, phone, specializations, experience_years, bio)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  userId,
  'demo user',
  'demo@user.com',
  passwordHash,
  '+91 98765 43210',
  JSON.stringify(['Vedic Astrology', 'Numerology', 'Vastu Shastra', 'Palmistry', 'Gemstone Consultation']),
  15,
  'Experienced Vedic astrologer with 15+ years of practice. Specializing in Kundli reading, matchmaking, and career guidance through astrological insights.'
);

console.log('✅ Created demo astrologer: demo@user.com / password123\n');

// Create services
const services = [
  { name: 'Kundli Reading', description: 'Complete birth chart analysis with detailed life predictions covering career, health, relationships, and financial aspects.', duration: 60, price: 1500, icon: 'scroll' },
  { name: 'Matchmaking (Kundli Milan)', description: 'Comprehensive horoscope matching for marriage compatibility using Gun Milan and Manglik Dosha analysis.', duration: 45, price: 2000, icon: 'heart' },
  { name: 'Career Guidance', description: 'Astrological career counseling based on planetary positions and Dasha periods for optimal career decisions.', duration: 30, price: 1000, icon: 'briefcase' },
  { name: 'Gemstone Recommendation', description: 'Personalized gemstone suggestions based on birth chart analysis for enhanced planetary benefits.', duration: 30, price: 800, icon: 'gem' },
  { name: 'Vastu Consultation', description: 'Vastu Shastra analysis for home and office to harmonize energy flow and promote prosperity.', duration: 90, price: 3000, icon: 'home' },
  { name: 'Numerology Analysis', description: 'Name and number analysis for personal and business success using Vedic numerology principles.', duration: 30, price: 700, icon: 'hash' },
  { name: 'Annual Prediction (Varshphal)', description: 'Detailed yearly forecast based on solar return chart analysis.', duration: 45, price: 1200, icon: 'calendar' },
  { name: 'Remedial Consultation', description: 'Personalized remedies including mantras, yantras, and rituals to mitigate negative planetary influences.', duration: 30, price: 500, icon: 'shield' },
];

const serviceIds = {};
services.forEach(s => {
  const id = uuidv4();
  serviceIds[s.name] = id;
  db.prepare(`
    INSERT INTO services (id, user_id, name, description, duration_minutes, price, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, s.name, s.description, s.duration, s.price, s.icon);
});

console.log(`✅ Created ${services.length} services\n`);

// Create clients with realistic Indian names and birth details
const clients = [
  { name: 'Aarav Patel', email: 'aarav.patel@email.com', phone: '+91 98123 45001', gender: 'male', dob: '1990-03-15', tob: '06:30', pob: 'Mumbai, Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+91 98123 45002', gender: 'female', dob: '1988-07-22', tob: '14:15', pob: 'Delhi, NCR', lat: 28.6139, lng: 77.209 },
  { name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91 98123 45003', gender: 'male', dob: '1985-11-08', tob: '03:45', pob: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Ananya Reddy', email: 'ananya.reddy@email.com', phone: '+91 98123 45004', gender: 'female', dob: '1995-01-30', tob: '11:00', pob: 'Hyderabad, Telangana', lat: 17.385, lng: 78.4867 },
  { name: 'Rahul Gupta', email: 'rahul.gupta@email.com', phone: '+91 98123 45005', gender: 'male', dob: '1992-05-12', tob: '09:20', pob: 'Lucknow, Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Sneha Nair', email: 'sneha.nair@email.com', phone: '+91 98123 45006', gender: 'female', dob: '1991-09-03', tob: '16:45', pob: 'Kochi, Kerala', lat: 9.9312, lng: 76.2673 },
  { name: 'Arjun Mehta', email: 'arjun.mehta@email.com', phone: '+91 98123 45007', gender: 'male', dob: '1987-12-25', tob: '00:15', pob: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Kavya Iyer', email: 'kavya.iyer@email.com', phone: '+91 98123 45008', gender: 'female', dob: '1993-04-18', tob: '07:30', pob: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Aditya Joshi', email: 'aditya.joshi@email.com', phone: '+91 98123 45009', gender: 'male', dob: '1989-08-07', tob: '20:00', pob: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Ishita Banerjee', email: 'ishita.banerjee@email.com', phone: '+91 98123 45010', gender: 'female', dob: '1994-02-14', tob: '12:30', pob: 'Kolkata, West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Rohan Deshmukh', email: 'rohan.deshmukh@email.com', phone: '+91 98123 45011', gender: 'male', dob: '1986-06-21', tob: '05:15', pob: 'Nagpur, Maharashtra', lat: 21.1458, lng: 79.0882 },
  { name: 'Meera Kapoor', email: 'meera.kapoor@email.com', phone: '+91 98123 45012', gender: 'female', dob: '1990-10-09', tob: '18:45', pob: 'Chandigarh, Punjab', lat: 30.7333, lng: 76.7794 },
  { name: 'Siddharth Rao', email: 'siddharth.rao@email.com', phone: '+91 98123 45013', gender: 'male', dob: '1988-03-28', tob: '10:00', pob: 'Bangalore, Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Nisha Agarwal', email: 'nisha.agarwal@email.com', phone: '+91 98123 45014', gender: 'female', dob: '1996-07-04', tob: '22:30', pob: 'Bhopal, Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { name: 'Karan Malhotra', email: 'karan.malhotra@email.com', phone: '+91 98123 45015', gender: 'male', dob: '1991-11-17', tob: '01:00', pob: 'Amritsar, Punjab', lat: 31.634, lng: 74.8723 },
  { name: 'Divya Pillai', email: 'divya.pillai@email.com', phone: '+91 98123 45016', gender: 'female', dob: '1993-08-23', tob: '15:20', pob: 'Trivandrum, Kerala', lat: 8.5241, lng: 76.9366 },
  { name: 'Manish Tiwari', email: 'manish.tiwari@email.com', phone: '+91 98123 45017', gender: 'male', dob: '1984-01-11', tob: '08:00', pob: 'Varanasi, Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { name: 'Shruti Kulkarni', email: 'shruti.kulkarni@email.com', phone: '+91 98123 45018', gender: 'female', dob: '1997-05-29', tob: '13:15', pob: 'Nashik, Maharashtra', lat: 19.9975, lng: 73.7898 },
  { name: 'Deepak Verma', email: 'deepak.verma@email.com', phone: '+91 98123 45019', gender: 'male', dob: '1990-09-16', tob: '04:30', pob: 'Patna, Bihar', lat: 25.6093, lng: 85.1376 },
  { name: 'Pooja Saxena', email: 'pooja.saxena@email.com', phone: '+91 98123 45020', gender: 'female', dob: '1992-12-01', tob: '19:45', pob: 'Indore, Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { name: 'Amit Choudhary', email: 'amit.choudhary@email.com', phone: '+91 98123 45021', gender: 'male', dob: '1987-04-05', tob: '11:30', pob: 'Jodhpur, Rajasthan', lat: 26.2389, lng: 73.0243 },
  { name: 'Ritu Pandey', email: 'ritu.pandey@email.com', phone: '+91 98123 45022', gender: 'female', dob: '1994-06-15', tob: '06:00', pob: 'Dehradun, Uttarakhand', lat: 30.3165, lng: 78.0322 },
  { name: 'Suresh Menon', email: 'suresh.menon@email.com', phone: '+91 98123 45023', gender: 'male', dob: '1983-10-20', tob: '17:00', pob: 'Coimbatore, Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { name: 'Tanvi Shah', email: 'tanvi.shah@email.com', phone: '+91 98123 45024', gender: 'female', dob: '1995-02-08', tob: '21:15', pob: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311 },
  { name: 'Nikhil Bhatt', email: 'nikhil.bhatt@email.com', phone: '+91 98123 45025', gender: 'male', dob: '1989-07-31', tob: '02:45', pob: 'Vadodara, Gujarat', lat: 22.3072, lng: 73.1812 },
];

// Zodiac sign calculator
function getZodiacSign(dateStr) {
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
  return 'Pisces';
}

function getNakshatra(dateStr) {
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

const clientIds = {};
clients.forEach(c => {
  const id = uuidv4();
  clientIds[c.name] = id;
  const zodiac = getZodiacSign(c.dob);
  const nakshatra = getNakshatra(c.dob);

  db.prepare(`
    INSERT INTO clients (id, user_id, name, email, phone, gender, date_of_birth, time_of_birth, place_of_birth, latitude, longitude, zodiac_sign, nakshatra, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, userId, c.name, c.email, c.phone, c.gender,
    c.dob, c.tob, c.pob, c.lat, c.lng, zodiac, nakshatra,
    null
  );
});

console.log(`✅ Created ${clients.length} clients\n`);

// Create consultations (mix of past completed, past cancelled, and future scheduled)
const consultationTypes = ['Kundli Reading', 'Matchmaking (Kundli Milan)', 'Career Guidance', 'Gemstone Recommendation', 'Vastu Consultation', 'Numerology Analysis', 'Annual Prediction (Varshphal)', 'Remedial Consultation'];
const statuses = ['completed', 'completed', 'completed', 'completed', 'scheduled', 'cancelled']; // weighted toward completed
const paymentMethods = ['cash', 'upi', 'card', 'upi', 'upi']; // weighted toward UPI

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const consultations = [];
const clientNames = Object.keys(clientIds);

// Generate past consultations (last 6 months)
for (let i = 0; i < 65; i++) {
  const clientName = randomElement(clientNames);
  const serviceType = randomElement(consultationTypes);
  const serviceId = serviceIds[serviceType];
  const service = services.find(s => s.name === serviceType);
  const status = randomElement(statuses);
  const scheduled = randomDate(new Date('2026-01-01'), new Date('2026-06-11'));
  const paymentStatus = status === 'completed' ? 'completed' : (status === 'cancelled' ? 'cancelled' : 'pending');
  const paymentMethod = paymentStatus === 'completed' ? randomElement(paymentMethods) : null;

  const notes = status === 'completed' ? [
    'Client was satisfied with the reading. Recommended wearing a blue sapphire for Saturn.',
    'Detailed Kundli analysis provided. Follow-up scheduled for next month.',
    'Discussed career transition. Jupiter transit favorable in coming months.',
    'Matchmaking analysis completed. 28/36 Gun matching score.',
    'Provided remedial mantras for Rahu Dasha period.',
    'Vastu corrections suggested for the office entrance and bedroom.',
    'Numerology analysis shows name change would be beneficial.',
    'Annual prediction report shared. Good year for financial investments.',
    'Client concerned about Manglik Dosha. Provided clarification and remedies.',
    'Gemstone consultation completed. Recommended Emerald for Mercury strengthening.',
  ][Math.floor(Math.random() * 10)] : null;

  const id = uuidv4();

  consultations.push({
    id,
    client_id: clientIds[clientName],
    service_id: serviceId,
    type: serviceType,
    status,
    scheduled_at: scheduled.toISOString(),
    duration_minutes: service.duration,
    notes,
    amount: service.price,
    payment_status: paymentStatus,
    payment_method: paymentMethod
  });
}

// Generate upcoming consultations (next 2 weeks)
for (let i = 0; i < 12; i++) {
  const clientName = randomElement(clientNames);
  const serviceType = randomElement(consultationTypes);
  const serviceId = serviceIds[serviceType];
  const service = services.find(s => s.name === serviceType);
  const scheduled = randomDate(new Date('2026-06-12'), new Date('2026-06-26'));

  const id = uuidv4();

  consultations.push({
    id,
    client_id: clientIds[clientName],
    service_id: serviceId,
    type: serviceType,
    status: 'scheduled',
    scheduled_at: scheduled.toISOString(),
    duration_minutes: service.duration,
    notes: null,
    amount: service.price,
    payment_status: 'pending',
    payment_method: null
  });
}

const insertConsultation = db.prepare(`
  INSERT INTO consultations (id, client_id, user_id, service_id, type, status, scheduled_at, duration_minutes, notes, amount, payment_status, payment_method, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertPayment = db.prepare(`
  INSERT INTO payments (id, consultation_id, user_id, amount, method, status, paid_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction(() => {
  consultations.forEach(c => {
    const createdAt = new Date(new Date(c.scheduled_at).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    insertConsultation.run(
      c.id, c.client_id, userId, c.service_id, c.type, c.status,
      c.scheduled_at, c.duration_minutes, c.notes, c.amount,
      c.payment_status, c.payment_method, createdAt
    );

    // Create payment records for completed consultations
    if (c.payment_status === 'completed') {
      insertPayment.run(
        uuidv4(), c.id, userId, c.amount, c.payment_method, 'completed', c.scheduled_at
      );
    }
  });
});

insertMany();

console.log(`✅ Created ${consultations.length} consultations\n`);

// Summary
const totalPayments = db.prepare('SELECT COUNT(*) as count FROM payments').get().count;
console.log(`✅ Created ${totalPayments} payment records\n`);

console.log('🎉 Database seeded successfully!\n');
console.log('Login credentials:');
console.log('  Email: demo@user.com');
console.log('  Password: password123\n');
