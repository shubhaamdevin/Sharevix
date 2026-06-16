import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import Calendar from './pages/Calendar';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import Drafts from './pages/Drafts';
import TotalPosts from './pages/TotalPosts';
import LiveCount from './pages/LiveCount';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminBanned from './pages/AdminBanned';
import AdminPosts from './pages/AdminPosts';
import AdminScheduled from './pages/AdminScheduled';
import AuthCallback from './pages/AuthCallback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import { useAuth } from './context/AuthContext';
import { db, isMock } from './firebase';
import { dbService } from './services/db';
import { isFacebookTokenError, disconnectFacebookAndInstagram } from './services/tokenHelper';
import './index.css';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" />;
  
  return children;
};

const Toast = ({ notification, onClose }) => {
  if (!notification) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} 
      style={{ 
        position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, 
        background: 'var(--panel-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--panel-border)', 
        padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', 
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' 
      }}>
      {notification.type === 'success' ? <CheckCircle2 color="var(--success)" size={20} /> : <AlertCircle color="var(--error)" size={20} />}
      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{notification.message}</div>
    </motion.div>
  );
};

function App() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Initialize Theme
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') document.body.classList.add('light-theme');

    // Setup Global Notification Listener
    const handleNotification = (e) => {
      const isNotificationsEnabled = JSON.parse(localStorage.getItem('notifications') ?? 'true');
      if (!isNotificationsEnabled) return;
      
      setNotification(e.detail);
      setTimeout(() => setNotification(null), 4000);
    };

    window.addEventListener('show-notification', handleNotification);
    return () => window.removeEventListener('show-notification', handleNotification);
  }, []);

  // Background Auto-Poster Scheduler
  useEffect(() => {
    const checkScheduledPosts = async () => {
      try {
        const posts = await dbService.getPosts();
        const now = new Date();
        
        const pendingScheduled = posts.filter(p => p.status === 'scheduled' && p.date && new Date(p.date) <= now);
        
        for (const post of pendingScheduled) {
          console.log(`Auto-publishing scheduled post: ${post.id}`);
          
          let success = true;
          let errorMessage = '';
          
          if (post.platforms?.includes('facebook')) {
            let pageId = localStorage.getItem('fb_page_id');
            let token = localStorage.getItem('fb_access_token');
            
            if (token) {
              try {
                const accountsRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`);
                const accountsData = await accountsRes.json();
                if (accountsRes.ok && accountsData.data && accountsData.data.length > 0) {
                  pageId = accountsData.data[0].id;
                  token = accountsData.data[0].access_token;
                } else if (!accountsRes.ok) {
                  throw accountsData.error || new Error(accountsData.error?.message || "Failed to query accounts");
                }
              } catch (err) {
                console.warn("Auto-resolve failed during schedule check", err);
                if (isFacebookTokenError(err)) {
                  disconnectFacebookAndInstagram();
                  success = false;
                  errorMessage = "Facebook access token expired or invalid.";
                }
              }
              
              if (success && pageId && token) {
                try {
                  const res = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message: post.content,
                      access_token: token
                    })
                  });
                  const resData = await res.json();
                  if (!res.ok) {
                    success = false;
                    errorMessage = resData.error?.message || "FB posting failed";
                    if (isFacebookTokenError(resData.error || resData)) {
                      disconnectFacebookAndInstagram();
                    }
                  }
                } catch (e) {
                  success = false;
                  errorMessage = e.message;
                  if (isFacebookTokenError(e)) {
                    disconnectFacebookAndInstagram();
                  }
                }
              } else if (success) {
                success = false;
                errorMessage = "FB Page credentials missing";
              }
            } else {
              success = false;
              errorMessage = "FB Access Token missing";
            }
          }
          
          if (success) {
            // Update post status to published
            await dbService.updatePostStatus(post.id, 'published');
            // Reload page or dispatch event to refresh dashboard lists if visible
            window.dispatchEvent(new CustomEvent('show-notification', { 
              detail: { type: 'success', message: `Post successfully auto-published to Facebook!` } 
            }));
            window.dispatchEvent(new CustomEvent('posts-updated'));
          } else {
            console.error(`Auto-publish failed for post ${post.id}: ${errorMessage}`);
          }
        }
      } catch (err) {
        console.error("Error running scheduler:", err);
      }
    };

    const interval = setInterval(checkScheduledPosts, 15000); // Check every 15 seconds
    checkScheduledPosts();
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AnimatePresence>
        {notification && <Toast notification={notification} onClose={() => setNotification(null)} />}
      </AnimatePresence>

      {/* Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="posts" element={<ProtectedRoute><TotalPosts /></ProtectedRoute>} />
            <Route path="calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="live-count" element={<ProtectedRoute><LiveCount /></ProtectedRoute>} />
            <Route path="drafts" element={<ProtectedRoute><Drafts /></ProtectedRoute>} />
            <Route path="accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="banned" element={<AdminBanned />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="scheduled" element={<AdminScheduled />} />
          </Route>
          
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
      </Router>
    </>
  );
}

export default App;
