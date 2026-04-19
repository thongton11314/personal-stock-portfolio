import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" role="navigation" aria-label="Admin navigation">
        <div className="sidebar-header">
          <h2>Portfolio Manager</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/holdings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Holdings
          </NavLink>
          <NavLink to="/admin/performance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Performance
          </NavLink>
          <NavLink to="/admin/transactions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Transactions
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Settings
          </NavLink>
          <NavLink to="/admin/preview" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Preview & Publish
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            Log Out
          </button>
        </div>
      </aside>
      <main className="admin-content" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
