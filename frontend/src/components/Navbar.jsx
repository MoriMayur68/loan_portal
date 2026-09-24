import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getNotifications, markAllAsRead } from '../api';
import Logo from './Logo';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (user) {
      getNotifications().then((res) => setNotifications(res.data)).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/loans', label: 'My Loans', icon: '📋' },
    { path: '/apply', label: 'Apply Loan', icon: '✨' },
    { path: '/payments', label: 'Payments', icon: '💳' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Logo size={34} />
        <span className="brand-name">Loan Shark</span>
      </div>

      <div className="navbar-links">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-actions">
        {/* Notifications */}
        <div className="notif-wrapper">
          <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
            🔔
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span>Notifications</span>
                {unread > 0 && (
                  <button onClick={handleMarkAll} className="notif-mark-all">Mark all read</button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <p className="notif-empty">No notifications</p>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="user-menu">
          <button className="user-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <span className="user-name-sm">{user?.name?.split(' ')[0]}</span>
            <span>▾</span>
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                <div>
                  <div className="dropdown-name">{user?.name}</div>
                  <div className="dropdown-email">{user?.email}</div>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>👤 Profile</Link>
              <button className="dropdown-item danger" onClick={handleLogout}>🚪 Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
