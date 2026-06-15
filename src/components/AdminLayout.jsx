import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, LayoutDashboard, ArrowLeft, LogOut, UserX, FileText, CalendarClock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  const adminNavItems = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { path: '/admin/users', label: 'Total Users', icon: Users, end: false },
    { path: '/admin/banned', label: 'Banned Accounts', icon: UserX, end: false },
    { path: '/admin/posts', label: 'All Posts', icon: FileText, end: false },
    { path: '/admin/scheduled', label: 'Active Scheduled', icon: CalendarClock, end: false }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto', padding: '2rem', gap: '2rem' }}>
      
      {/* Admin Sidebar Navigation */}
      <aside style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(45deg, var(--accent-purple), #d500f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Sharevix Admin
          </h1>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ShieldAlert size={12} color="var(--accent-purple)" /> Management Console
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {adminNavItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end} style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px',
              textDecoration: 'none', color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'rgba(156, 39, 176, 0.15)' : 'transparent',
              border: isActive ? '1px solid var(--accent-purple)' : '1px solid transparent',
              transition: 'all 0.2s', fontWeight: isActive ? 600 : 500
            })}>
              <item.icon size={20} /> {item.label}
            </NavLink>
          ))}

          <div style={{ height: '1px', background: 'var(--panel-border)', margin: '1rem 0' }}></div>

          <NavLink to="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px',
            textDecoration: 'none', color: 'var(--text-secondary)',
            background: 'transparent',
            border: '1px solid transparent',
            transition: 'all 0.2s', fontWeight: 500
          }}>
            <ArrowLeft size={20} /> Back to App
          </NavLink>
        </nav>

        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px',
          background: 'transparent', border: '1px solid transparent', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', marginTop: 'auto'
        }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Admin Content Area */}
      <main style={{ flex: 1, position: 'relative' }}>
        <Outlet />
      </main>

    </div>
  );
}
