import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import Logo from './Logo';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/loans', label: 'Loan Applications', icon: '📋' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/payments', label: 'Payments', icon: '💳' },
  { path: '/reports', label: 'Reports', icon: '📈' },
];

const Sidebar = () => {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo size={34} radius={8} />
        <div>
          <div className="sidebar-brand">Loan Shark</div>
          <div className="sidebar-brand-sub">Admin Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{admin?.name?.[0]?.toUpperCase() || 'A'}</div>
          <div>
            <div className="sidebar-user-name">{admin?.name}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
