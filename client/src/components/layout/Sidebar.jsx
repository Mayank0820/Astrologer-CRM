import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  MdDashboard, MdPeople, MdCalendarMonth, MdMiscellaneousServices,
  MdPayments, MdLogout, MdAutoAwesome
} from 'react-icons/md';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <MdDashboard /> },
  { path: '/clients', label: 'Clients', icon: <MdPeople /> },
  { path: '/consultations', label: 'Consultations', icon: <MdCalendarMonth /> },
  { path: '/services', label: 'Services', icon: <MdMiscellaneousServices /> },
  { path: '/payments', label: 'Payments', icon: <MdPayments /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <MdAutoAwesome />
        </div>
        <div className="sidebar-brand">
          <h2>Jyotish CRM</h2>
          <span>Astrologer Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-nav-label">Main Menu</span>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive && (item.path === '/' ? location.pathname === '/' : true) ? 'active' : ''}`
            }
            end={item.path === '/'}
            id={`nav-${item.label.toLowerCase()}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Astrologer'}</div>
            <div className="sidebar-user-role">Vedic Astrologer</div>
          </div>
        </div>
        <button
          className="btn btn-ghost w-full mt-md"
          onClick={logout}
          id="btn-logout"
          style={{ justifyContent: 'flex-start', gap: '12px', padding: '8px 12px' }}
        >
          <MdLogout />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
