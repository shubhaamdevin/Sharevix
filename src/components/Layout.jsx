import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenSquare, Calendar, Users, Settings, LogOut, ShieldCheck, FileEdit, FileText, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/posts', icon: FileText, label: 'Total Posts' },
    { path: '/create', icon: PenSquare, label: 'Create Post' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/drafts', icon: FileEdit, label: 'Drafts' },
    { path: '/accounts', icon: Users, label: 'Accounts' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  // Fetch profile pic from localstorage to display dynamically
  const profilePic = localStorage.getItem(`profilePic_${currentUser?.uid}`) || '';

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', height: '100px', boxSizing: 'border-box' }}>
          <img 
            src="/logo.png?v=5" 
            alt="Sharevix Logo" 
            style={{ 
              height: '80px', 
              maxWidth: '100%',
              objectFit: 'contain', 
              display: 'block'
            }} 
          />
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px',
              textDecoration: 'none', color: isActive ? 'var(--sidebar-active-text)' : 'var(--text-secondary)',
              background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
              border: isActive ? '1px solid var(--sidebar-active-border)' : '1px solid transparent',
              transition: 'all 0.2s', fontWeight: isActive ? 600 : 500
            })}>
              <item.icon size={20} /> {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <a href="/admin" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px',
              textDecoration: 'none', color: 'var(--accent-purple)',
              background: 'rgba(156, 39, 176, 0.05)',
              border: '1px solid transparent',
              transition: 'all 0.2s', fontWeight: 500, marginTop: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(156, 39, 176, 0.15)';
              e.currentTarget.style.border = '1px solid var(--accent-purple)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(156, 39, 176, 0.05)';
              e.currentTarget.style.border = '1px solid transparent';
            }}>
              <ShieldCheck size={20} /> Admin Panel
            </a>
          )}
        </nav>

      </aside>

      <main style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <Outlet />
      </main>

    </div>
  );
}
