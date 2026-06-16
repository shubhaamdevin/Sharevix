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
        <div style={{ padding: '1rem 0.5rem', display: 'flex', alignItems: 'center', height: '80px', boxSizing: 'border-box' }}>
          <img 
            src="/logo.png?v=5" 
            alt="Sharevix Logo" 
            style={{ 
              height: '52px', 
              maxWidth: '100%',
              objectFit: 'contain', 
              display: 'block'
            }} 
          />
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} style={({isActive}) => ({
              display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.8rem 1rem', borderRadius: '10px',
              textDecoration: 'none', color: isActive ? 'var(--sidebar-active-text)' : 'var(--text-secondary)',
              background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
              border: isActive ? '1px solid var(--sidebar-active-border)' : '1px solid transparent',
              transition: 'all 0.15s ease', fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem'
            })}>
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <a href="/admin" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.8rem 1rem', borderRadius: '10px',
              textDecoration: 'none', color: 'var(--accent-purple)',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid transparent',
              transition: 'all 0.15s ease', fontWeight: 500, marginTop: '0.5rem',
              fontSize: '0.9rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
              e.currentTarget.style.border = '1px solid rgba(99, 102, 241, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
              e.currentTarget.style.border = '1px solid transparent';
            }}>
              <ShieldCheck size={18} /> Admin Panel
            </a>
          )}
        </nav>

        {/* User Profile Summary at bottom */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 0.85rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          border: '1px solid var(--panel-border)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden',
            border: '2px solid var(--accent-blue)', background: 'rgba(0, 0, 0, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {profilePic ? (
              <img src={profilePic} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {currentUser?.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {currentUser?.displayName || currentUser?.email?.split('@')[0]}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {currentUser?.email}
            </span>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <Outlet />
      </main>

    </div>
  );
}
