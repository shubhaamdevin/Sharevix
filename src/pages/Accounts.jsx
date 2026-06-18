import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Video, ImagePlus, CheckCircle2, Loader2, Link2, Unlink, X } from 'lucide-react';
import {
  InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon, LinkedinIcon, TiktokIcon,
  SnapchatIcon, PinterestIcon, RedditIcon, DiscordIcon, ThreadsIcon, TelegramIcon,
  WhatsappIcon, MessengerIcon, WechatIcon, QqIcon, LineIcon, ViberIcon, KakaotalkIcon,
  TwitchIcon, KickIcon, TumblrIcon, MediumIcon, QuoraIcon, VkIcon, OkIcon,
  MastodonIcon, BlueskyIcon, TruthsocialIcon, ParlerIcon, BilibiliIcon, DouyinIcon,
  XiaohongshuIcon, NaverbandIcon
} from '../components/Icons';
import { generateOAuthUrl } from '../services/oauth';
import ConfirmationModal from '../components/ConfirmationModal';

const platformDefinitions = [
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2', comingSoon: false },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#E1306C', comingSoon: false },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: '#FF0000', comingSoon: false },
  { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: '#ffffff', comingSoon: false },
  { id: 'x', name: 'X (Twitter)', icon: TwitterIcon, color: '#ffffff', comingSoon: true }
];

export default function Accounts() {
  const navigate = useNavigate();
  const [allAccounts, setAllAccounts] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [connectTarget, setConnectTarget] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(() => localStorage.getItem('fb_page_id') || '');
  const [tokenExpiry, setTokenExpiry] = useState({ facebook: null, instagram: null, youtube: null });
  
  const checkAndHandleTokenExpiry = (activeConnections) => {
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const expiries = { facebook: null, instagram: null, youtube: null };

    // Facebook/Instagram shared token expiry
    const fbExpiry = localStorage.getItem('fb_token_expiry');
    if (fbExpiry) {
      const expTs = parseInt(fbExpiry, 10);
      expiries.facebook = expTs;
      expiries.instagram = expTs;
      if (now > expTs && (activeConnections.includes('facebook') || activeConnections.includes('instagram'))) {
        // Token expired - auto-disconnect Facebook & Instagram
        localStorage.removeItem('fb_available_pages');
        localStorage.removeItem('fb_page_id');
        localStorage.removeItem('fb_page_name');
        localStorage.removeItem('fb_access_token');
        localStorage.removeItem('fb_user_token');
        localStorage.removeItem('fb_token_expiry');
        localStorage.removeItem('facebook_username');
        localStorage.removeItem('ig_business_account_id');
        localStorage.removeItem('instagram_username');
        activeConnections = activeConnections.filter(id => id !== 'facebook' && id !== 'instagram');
        localStorage.setItem('connectedAccounts', JSON.stringify(activeConnections));
        window.dispatchEvent(new CustomEvent('show-notification', {
          detail: { type: 'error', message: 'Your Facebook/Instagram session has expired. Please reconnect on the Accounts page.' }
        }));
      }
    }

    // YouTube token expiry
    const ytExpiry = localStorage.getItem('youtube_token_expiry');
    if (ytExpiry) {
      const expTs = parseInt(ytExpiry, 10);
      expiries.youtube = expTs;
      if (now > expTs && activeConnections.includes('youtube')) {
        // Access token expired — check if we have a refresh token
        const refreshToken = localStorage.getItem('youtube_refresh_token');
        if (!refreshToken) {
          // No refresh token - must reconnect manually
          localStorage.removeItem('youtube_channel_id');
          localStorage.removeItem('youtube_channel_name');
          localStorage.removeItem('youtube_access_token');
          localStorage.removeItem('youtube_refresh_token');
          localStorage.removeItem('youtube_token_expiry');
          localStorage.removeItem('youtube_username');
          localStorage.removeItem('youtube_subscribers');
          activeConnections = activeConnections.filter(id => id !== 'youtube');
          localStorage.setItem('connectedAccounts', JSON.stringify(activeConnections));
          window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { type: 'error', message: 'Your YouTube session has expired. Please reconnect on the Accounts page.' }
          }));
        }
        // If refresh token exists, the app will silently refresh before next upload
      }
    }

    setTokenExpiry(expiries);
    return activeConnections;
  };

  const cleanupMockConnections = () => {
    let changed = false;
    const savedConnections = JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
    let newConnections = [...savedConnections];

    // Check YouTube
    const ytToken = localStorage.getItem('youtube_access_token');
    if (ytToken && ytToken.startsWith('mock_')) {
      localStorage.removeItem('youtube_channel_id');
      localStorage.removeItem('youtube_channel_name');
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_username');
      localStorage.removeItem('youtube_subscribers');
      newConnections = newConnections.filter(id => id !== 'youtube');
      changed = true;
    }

    // Check Facebook/Instagram
    const fbToken = localStorage.getItem('fb_access_token');
    const fbPageId = localStorage.getItem('fb_page_id');
    const igId = localStorage.getItem('ig_business_account_id');
    const hasMockFb = (fbToken && fbToken.startsWith('mock_')) || fbPageId === '123456789012345';
    const hasMockIg = hasMockFb || (igId && (igId.startsWith('mock_') || igId === '987654321098765'));

    if (hasMockFb) {
      localStorage.removeItem('fb_available_pages');
      localStorage.removeItem('fb_page_id');
      localStorage.removeItem('fb_page_name');
      localStorage.removeItem('fb_access_token');
      localStorage.removeItem('facebook_username');
      newConnections = newConnections.filter(id => id !== 'facebook');
      changed = true;
    }

    if (hasMockIg) {
      localStorage.removeItem('ig_business_account_id');
      localStorage.removeItem('instagram_username');
      newConnections = newConnections.filter(id => id !== 'instagram');
      changed = true;
    }

    // Check Threads
    const threadsToken = localStorage.getItem('threads_access_token');
    if (threadsToken && threadsToken.startsWith('mock_')) {
      localStorage.removeItem('threads_username');
      localStorage.removeItem('threads_access_token');
      newConnections = newConnections.filter(id => id !== 'threads');
      changed = true;
    }

    // Always exclude X from active connections for now as it is coming soon
    if (newConnections.includes('x')) {
      newConnections = newConnections.filter(id => id !== 'x');
      changed = true;
    }

    if (changed) {
      localStorage.setItem('connectedAccounts', JSON.stringify(newConnections));
    }
    return newConnections;
  };
  
  useEffect(() => {
    const loadAccounts = () => {
      let activeConnections = cleanupMockConnections();
      activeConnections = checkAndHandleTokenExpiry(activeConnections);
      setAllAccounts(platformDefinitions.map(def => ({ ...def, connected: activeConnections.includes(def.id) })));
      setSelectedPageId(localStorage.getItem('fb_page_id') || '');
    };
    loadAccounts();
    window.addEventListener('accounts-updated', loadAccounts);
    return () => window.removeEventListener('accounts-updated', loadAccounts);
  }, []);

  const handleAccountConnect = (acc) => {
    if (acc.connected) {
      setDisconnectTarget(acc);
      setIsDisconnectModalOpen(true);
    } else {
      window.location.href = generateOAuthUrl(acc.id);
    }
  };

  const handleConfirmDisconnect = () => {
    if (!disconnectTarget) return;
    setIsDisconnectModalOpen(false);
    const newConnections = allAccounts.filter(a => a.connected && a.id !== disconnectTarget.id).map(a => a.id);
    localStorage.setItem('connectedAccounts', JSON.stringify(newConnections));
    setAllAccounts(prev => prev.map(a => a.id === disconnectTarget.id ? { ...a, connected: false } : a));
    
    // Clear specific platform credentials from localStorage
    if (disconnectTarget.id === 'facebook') {
      localStorage.removeItem('fb_available_pages');
      localStorage.removeItem('fb_page_id');
      localStorage.removeItem('fb_page_name');
      localStorage.removeItem('fb_access_token');
      localStorage.removeItem('facebook_username');
    }
    if (disconnectTarget.id === 'instagram') {
      localStorage.removeItem('ig_business_account_id');
      localStorage.removeItem('instagram_username');
    }
    if (disconnectTarget.id === 'youtube') {
      localStorage.removeItem('youtube_channel_id');
      localStorage.removeItem('youtube_channel_name');
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_username');
      localStorage.removeItem('youtube_subscribers');
    }
    if (disconnectTarget.id === 'threads') {
      localStorage.removeItem('threads_username');
      localStorage.removeItem('threads_access_token');
    }

    window.dispatchEvent(new CustomEvent('show-notification', { 
      detail: { type: 'success', message: `${disconnectTarget.name} disconnected successfully` } 
    }));
    window.dispatchEvent(new CustomEvent('accounts-updated'));
    setDisconnectTarget(null);
  };

  const connectedAccounts = allAccounts.filter(a => a.connected);
  const availableAccounts = allAccounts.filter(a => !a.connected);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflowY: 'auto', paddingRight: '1rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Social Accounts</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connect and manage your social media profiles.</p>
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 color="var(--success)" size={20} /> Connected Platforms ({connectedAccounts.length})
        </h3>
        {connectedAccounts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No accounts connected yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {connectedAccounts.map(acc => {
              const Icon = acc.icon;
              const isFacebookOrInsta = acc.id === 'facebook' || acc.id === 'instagram';
              // Compute expiry info for this account
              const expTs = tokenExpiry[acc.id];
              const now = Date.now();
              const msLeft = expTs ? expTs - now : null;
              const daysLeft = msLeft !== null ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : null;
              const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
              const isExpiringVerySoon = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
              const hasRefreshToken = acc.id === 'youtube' && !!localStorage.getItem('youtube_refresh_token');

              return (
                <div key={acc.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Icon size={40} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{acc.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                          Connected {acc.id === 'facebook' && localStorage.getItem('facebook_username') ? `(${localStorage.getItem('facebook_username')})` : ''}
                          {acc.id === 'instagram' && localStorage.getItem('instagram_username') ? `(@${localStorage.getItem('instagram_username')})` : ''}
                          {acc.id === 'youtube' && localStorage.getItem('youtube_channel_name') ? `(${localStorage.getItem('youtube_channel_name')})` : ''}
                          {acc.id === 'threads' && localStorage.getItem('threads_username') ? `(@${localStorage.getItem('threads_username')})` : ''}
                        </div>
                        {/* Token expiry badge */}
                        {isExpiringSoon && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            marginTop: '4px', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600,
                            background: isExpiringVerySoon ? 'rgba(255,160,0,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isExpiringVerySoon ? 'rgba(255,160,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            color: isExpiringVerySoon ? '#FFA000' : 'var(--text-secondary)'
                          }}>
                            ⏱ Session expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                          </div>
                        )}
                        {hasRefreshToken && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            marginTop: '4px', marginLeft: isExpiringSoon ? '6px' : '0', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600,
                            background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.2)', color: 'var(--success)'
                          }}>
                            ✓ Auto-renews
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleAccountConnect(acc)} style={{ background: 'rgba(255,61,0,0.1)', border: '1px solid rgba(255,61,0,0.3)', color: 'var(--error)', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Unlink size={16} /> Disconnect
                    </button>
                  </div>
                  

                  {isFacebookOrInsta && (() => {
                    const availablePages = JSON.parse(localStorage.getItem('fb_available_pages') || '[]');
                    
                    if (availablePages.length === 0) {
                      return (
                        <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--panel-border)', marginTop: '0.75rem', color: 'var(--error)', fontSize: '0.85rem' }}>
                          No active Facebook Pages found. Please ensure your account has admin access to a Page.
                        </div>
                      );
                    }

                    const activeId = selectedPageId || availablePages[0].id;

                    const handlePageSelect = (pageId) => {
                      const selected = availablePages.find(p => p.id === pageId);
                      if (selected) {
                        setSelectedPageId(pageId);
                        localStorage.setItem('fb_page_id', selected.id);
                        localStorage.setItem('fb_page_name', selected.name);
                        localStorage.setItem('fb_access_token', selected.access_token);
                        
                        // Save platform specific usernames dynamically
                        localStorage.setItem('facebook_username', selected.name);
                        
                        if (selected.instagram_business_account) {
                          localStorage.setItem('ig_business_account_id', selected.instagram_business_account.id);
                          localStorage.setItem('instagram_username', selected.instagram_business_account.username || selected.instagram_business_account.name);
                        } else {
                          localStorage.setItem('instagram_username', selected.name.toLowerCase().replace(/\s+/g, '_'));
                        }
                        
                        window.dispatchEvent(new CustomEvent('show-notification', { 
                          detail: { type: 'success', message: `Active profile: ${selected.name}` } 
                        }));
                        window.dispatchEvent(new CustomEvent('accounts-updated'));
                      }
                    };

                    return (
                      <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--panel-border)', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)' }}>Select Active Profile</div>
                        
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <select 
                            value={activeId}
                            onChange={(e) => handlePageSelect(e.target.value)}
                            style={{ 
                              background: 'var(--bg-dark)', 
                              border: '1px solid var(--panel-border)', 
                              color: 'var(--text-primary)', 
                              padding: '0.6rem 0.8rem', 
                              borderRadius: '8px', 
                              fontSize: '0.85rem', 
                              outline: 'none',
                              cursor: 'pointer',
                              width: '100%',
                              appearance: 'none',
                              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.8rem center',
                              backgroundSize: '1rem'
                            }}
                          >
                            {availablePages.map(p => {
                              const displayName = acc.id === 'instagram' && p.instagram_business_account 
                                ? `@${p.instagram_business_account.username || p.instagram_business_account.name} (via ${p.name})`
                                : `${p.name} (${p.category || 'Profile'})`;
                              return (
                                <option key={p.id} value={p.id} style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
                                  {displayName}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          Sharevix auto-resolves your Meta Pages. Switch the target channel above.
                        </span>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link2 color="var(--accent-blue)" size={20} /> Available Platforms ({availableAccounts.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {availableAccounts.map(acc => {
            const Icon = acc.icon;
            const isHovered = hoveredCardId === acc.id;
            const isWhiteBrand = acc.color.toLowerCase() === '#ffffff' || acc.color.toLowerCase() === '#fff';
            return (
              <div 
                key={acc.id} 
                className="glass-panel" 
                onMouseEnter={() => setHoveredCardId(acc.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1.5rem', 
                  background: isHovered ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)', 
                  border: isHovered ? `1px solid ${acc.color}40` : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: isHovered ? `0 0 20px ${acc.color}15` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    filter: isHovered ? 'none' : 'grayscale(100%) opacity(40%)',
                    transition: 'all 0.3s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={36} />
                  </div>
                  <div style={{ 
                    fontWeight: 600, 
                    color: isHovered ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.3s ease',
                    marginLeft: '0.5rem'
                  }}>{acc.name}</div>
                </div>
                {acc.comingSoon ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--panel-border)', fontWeight: 500 }}>
                    Soon
                  </span>
                ) : (
                  <button 
                    onClick={() => handleAccountConnect(acc)} 
                    style={{ 
                      background: isHovered ? acc.color : 'var(--panel-border)', 
                      border: '1px solid transparent', 
                      color: isHovered ? (isWhiteBrand ? '#000000' : '#ffffff') : 'var(--text-secondary)', 
                      padding: '0.5rem 1.25rem', 
                      borderRadius: '20px', 
                      cursor: 'pointer', 
                      fontSize: '0.85rem', 
                      fontWeight: 600,
                      boxShadow: isHovered ? `0 0 15px ${acc.color}40` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={isDisconnectModalOpen}
        title="Disconnect Account"
        message={`Are you sure you want to disconnect your ${disconnectTarget?.name || 'social'} account? You will not be able to publish posts or view analytics for this account until you reconnect it.`}
        confirmLabel="Disconnect"
        onConfirm={handleConfirmDisconnect}
        onCancel={() => {
          setIsDisconnectModalOpen(false);
          setDisconnectTarget(null);
        }}
      />

      {/* Connect Modal Removed */}
    </motion.div>
  );
}
