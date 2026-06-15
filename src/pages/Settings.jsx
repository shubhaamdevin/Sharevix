import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Globe2, Save, LogOut, User, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('notifications') ?? 'true'));
  const [timezone, setTimezone] = useState(() => localStorage.getItem('timezone') || 'UTC');
  const [isSaving, setIsSaving] = useState(false);

  // Profile Picture state (persisted to localStorage)
  const [profilePic, setProfilePic] = useState(() => {
    return localStorage.getItem(`profilePic_${currentUser?.uid}`) || '';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Extract First Name from email or displayName
  const rawName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const firstName = rawName.split(' ')[0].charAt(0).toUpperCase() + rawName.split(' ')[0].slice(1);

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        localStorage.setItem(`profilePic_${currentUser?.uid}`, base64String);
        window.dispatchEvent(new CustomEvent('show-notification', { 
          detail: { type: 'success', message: 'Profile picture updated!' } 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Save settings to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('timezone', timezone);
    
    window.dispatchEvent(new CustomEvent('show-notification', { 
      detail: { type: 'success', message: 'Settings saved successfully!' } 
    }));

    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Workspace Settings</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal profile and workspace preferences.</p>
        </div>
        <button onClick={handleSave} className="btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          {isSaving ? <span className="animate-spin">⏳</span> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* User Account / Profile Section */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* Avatar upload block */}
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--accent-blue)', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0, 210, 255, 0.2)' }}>
              {profilePic ? (
                <img src={profilePic} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} color="var(--text-secondary)" />
              )}
            </div>
            <label style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-blue)', color: '#fff', padding: '6px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handleProfilePicChange} style={{ display: 'none' }} />
            </label>
          </div>

          {/* User information & Greeting */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Hi, {firstName}!</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Logged in as: <strong style={{ color: 'var(--text-primary)' }}>{currentUser?.email}</strong></p>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
              Account UID: {currentUser?.uid}
            </span>
          </div>

        </motion.div>
        
        {/* Appearance */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sun size={20} color="var(--accent-blue)" /> Appearance
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Theme Preference</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Choose how Sharevix looks to you.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.1)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <button onClick={() => setTheme('light')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: theme === 'light' ? 'var(--bg-dark)' : 'transparent', color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: theme === 'light' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>
                <Sun size={16} /> Light
              </button>
              <button onClick={() => setTheme('dark')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent', color: theme === 'dark' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Moon size={16} /> Dark
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--accent-blue)" /> Notifications
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Publishing Alerts</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive global notifications when posts go live.</div>
            </div>
            <button onClick={() => setNotifications(!notifications)} style={{ width: '48px', height: '24px', borderRadius: '12px', background: notifications ? 'var(--accent-blue)' : 'var(--panel-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: notifications ? '26px' : '2px', transition: 'left 0.3s' }}></div>
            </button>
          </div>
        </motion.div>

        {/* Localization */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe2 size={20} color="var(--accent-blue)" /> Localization
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Timezone</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Set your default timezone for scheduling posts.</div>
            </div>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', outline: 'none' }}>
              <option value="UTC" style={{ color: '#000', background: '#fff' }}>UTC (Universal Time)</option>
              <option value="EST" style={{ color: '#000', background: '#fff' }}>EST (Eastern Standard Time)</option>
              <option value="PST" style={{ color: '#000', background: '#fff' }}>PST (Pacific Standard Time)</option>
              <option value="IST" style={{ color: '#000', background: '#fff' }}>IST (Indian Standard Time)</option>
            </select>
          </div>
        </motion.div>

        {/* Security & Action Items */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Session Security</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Sign out of the current workspace session securely.</p>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'rgba(255, 23, 68, 0.1)', 
              color: 'var(--error)', border: '1px solid rgba(255, 23, 68, 0.2)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 23, 68, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 23, 68, 0.1)'}
          >
            <LogOut size={16} /> Logout from App
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}
