# Project Notes — Astrologer CRM

## Tech Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Frontend** | React 19 + Vite | Fast development with HMR, modern React features |
| **Styling** | Vanilla CSS | Maximum control over the design, no external CSS dependencies |
| **Charts** | Recharts | React-native charting library, easy to customize |
| **State Management** | React Context API | Sufficient for auth state, avoids Redux overhead |
| **HTTP Client** | Axios | Interceptors for JWT, cleaner API than fetch |
| **Backend** | Node.js + Express | Lightweight, widely used, fast to build REST APIs |
| **Database** | SQLite (better-sqlite3) | Zero-config, self-contained, perfect for demo — no external DB setup needed |
| **Authentication** | JWT + bcryptjs | Stateless auth, industry standard |
| **Routing** | React Router DOM v6 | Declarative routing with nested layouts |

## Architecture

### Frontend Architecture
- **Component-based**: Reusable components (cards, modals, tables) with a centralized design system
- **Service layer**: All API calls abstracted through `services/api.js` with axios interceptors
- **Context-based auth**: `AuthContext` manages login state with localStorage persistence
- **Route protection**: `ProtectedRoute` and `PublicRoute` components handle access control
- **CSS Design System**: All styling through CSS custom properties (variables) — easy to theme

### Backend Architecture
- **RESTful API**: Standard CRUD endpoints for all resources
- **Middleware pattern**: JWT auth middleware applied to protected routes
- **SQL queries**: Direct SQL with `better-sqlite3` (synchronous, fast) — no ORM overhead
- **Auto-schema**: Database tables auto-created on first startup
- **Transaction support**: Seed script uses SQLite transactions for atomic data insertion

### Data Flow
```
React Component → API Service (axios) → Express Route → SQLite DB
     ↑                                                    ↓
     └────────── JSON Response ←── Express Handler ←──────┘
```

## Assumptions

1. **Single-tenant**: One astrologer per instance (suitable for demo; multi-tenant possible with minor changes)
2. **Simplified astrology**: Zodiac signs calculated from Western astrology date ranges; Nakshatra simplified from day-of-year approximation. Not a real Vedic astrology engine
3. **Birth chart**: Visual representation only — planetary positions are approximated from birth date, not calculated using real ephemeris data
4. **Payments**: Tracked but not integrated with real payment gateways
5. **No file uploads**: Client photos/documents not supported in this version
6. **Local timezone**: Dates stored in UTC/ISO format
7. **Demo data**: Seed data includes realistic but fictional Indian client names and details

## Key Design Decisions

1. **SQLite over MongoDB/PostgreSQL**: For a demo project, SQLite provides a zero-config experience. The evaluator can clone and run without setting up any external database. The same schema would easily migrate to PostgreSQL for production
2. **Vanilla CSS over Tailwind**: Demonstrates understanding of CSS fundamentals. The cosmic theme required custom gradients, animations, and glassmorphism that are more naturally expressed in vanilla CSS
3. **No Redux/Zustand**: React Context API is sufficient for auth state. Component-level state handles forms and data. Avoids over-engineering for this scope
4. **UUID for IDs**: Instead of auto-increment integers, UUIDs prevent ID guessing and work well in distributed systems

## Future Improvements

1. **Real Vedic calculations**: Integrate with a Vedic astrology library (e.g., Swiss Ephemeris) for accurate planetary positions, Dasha periods, and chart calculations
2. **Calendar view**: Full calendar interface for consultation scheduling with drag-and-drop
3. **PDF reports**: Generate downloadable Kundli reports and consultation summaries
4. **SMS/WhatsApp reminders**: Automated appointment reminders via Twilio/WhatsApp API
5. **Multi-language**: Hindi and regional language support for client-facing features
6. **File attachments**: Upload and store Kundli PDFs, client photos, and documents
7. **Payment gateway**: Integration with Razorpay/Stripe for online payments
8. **Mobile app**: React Native version for on-the-go access
9. **Client portal**: Self-service portal for clients to book consultations and view their charts
10. **Analytics dashboard**: Advanced analytics with client retention, revenue forecasting, and service popularity trends
11. **Export functionality**: Export client data, consultations, and reports to CSV/Excel
12. **Dark/Light mode toggle**: Currently dark-only; add light theme option
13. **WebSocket notifications**: Real-time notifications for new bookings and reminders
14. **Multi-astrologer support**: Team management with role-based access control
