import { useLocation } from 'react-router-dom';
import { MdSearch, MdNotifications } from 'react-icons/md';

const pageTitles = {
  '/': 'Dashboard',
  '/clients': 'Clients',
  '/consultations': 'Consultations',
  '/services': 'Services',
  '/payments': 'Payments',
};

export default function Header() {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith('/clients/')) return 'Client Details';
    return pageTitles[location.pathname] || 'Astrologer CRM';
  };

  return (
    <header className="header" id="header">
      <div className="header-left">
        <h1 className="header-title">{getTitle()}</h1>
      </div>
      <div className="header-right">
        <div className="header-search">
          <MdSearch className="header-search-icon" />
          <input
            type="text"
            placeholder="Search clients, consultations..."
            id="header-search-input"
          />
        </div>
        <button className="header-btn" id="btn-notifications">
          <MdNotifications />
          <span className="badge">3</span>
        </button>
      </div>
    </header>
  );
}
