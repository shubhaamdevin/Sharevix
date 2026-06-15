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
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#E1306C' },
  { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: '#ffffff' },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: '#FF0000' },
  { id: 'x', name: 'X (Twitter)', icon: TwitterIcon, color: '#ffffff' }
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
  
  const isPlatformMock = (id) => {
    if (id === 'youtube' || id === 'x' || id === 'threads') return true;
    if (id === 'facebook') {
      const pageId = localStorage.getItem('fb_page_id');
      const token = localStorage.getItem('fb_access_token');
      return !pageId || pageId === '123456789012345' || !token || token.startsWith('mock_');
    }
    if (id === 'instagram') {
      const pageId = localStorage.getItem('fb_page_id');
      const token = localStorage.getItem('fb_access_token');
      const igId = localStorage.getItem('ig_business_account_id');
      return !pageId || pageId === '123456789012345' || !token || token.startsWith('mock_') || !igId || igId === 'mock_ig_business_account_id_123456' || igId === '987654321098765';
    }
    return false;
  };
  
  useEffect(() => {
    const loadAccounts = () => {
      const savedConnections = JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
      setAllAccounts(platformDefinitions.map(def => ({ ...def, connected: savedConnections.includes(def.id) })));
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
      setConnectTarget(acc);
      setIsConnectModalOpen(true);
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

    window.dispatchEvent(new CustomEvent('show-notification', { 
      detail: { type: 'success', message: `${disconnectTarget.name} disconnected successfully` } 
    }));
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
              return (
                <div key={acc.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Icon size={40} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{acc.name}</div>
                        {isPlatformMock(acc.id) ? (
                          <div style={{ fontSize: '0.85rem', color: '#ffb300', fontWeight: 500 }}>
                            Connected (Mock Simulation)
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                            Connected {acc.id === 'facebook' && localStorage.getItem('facebook_username') ? `(${localStorage.getItem('facebook_username')})` : ''}
                            {acc.id === 'instagram' && localStorage.getItem('instagram_username') ? `(@${localStorage.getItem('instagram_username')})` : ''}
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
            return (
              <div 
                key={acc.id} 
                className="glass-panel" 
                onMouseEnter={() => setHoveredCardId(acc.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1.25rem', 
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
                <button 
                  onClick={() => handleAccountConnect(acc)} 
                  style={{ 
                    background: isHovered ? acc.color : 'var(--panel-border)', 
                    border: '1px solid transparent', 
                    color: isHovered ? '#ffffff' : 'var(--text-secondary)', 
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

      {/* Connect Modal */}
      <AnimatePresence>
        {isConnectModalOpen && connectTarget && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              background: 'rgba(0,0,0,0.8)', 
              zIndex: 99999, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backdropFilter: 'blur(10px)',
              padding: '1rem'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              style={{ 
                background: 'var(--bg-dark)', 
                border: '1px solid var(--panel-border)', 
                borderRadius: '24px', 
                padding: '2.5rem', 
                width: '100%',
                maxWidth: '460px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)', 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                textAlign: 'center',
                alignItems: 'center'
              }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsConnectModalOpen(false)} 
                style={{ 
                  position: 'absolute', 
                  top: '1.25rem', 
                  right: '1.25rem', 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <X size={18} />
              </button>

              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: `${connectTarget.color}15`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: `1px solid ${connectTarget.color}30`,
                marginBottom: '0.5rem'
              }}>
                {React.createElement(connectTarget.icon, { size: 36 })}
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                  Connect {connectTarget.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                  Choose how you want to connect your account. Use Real Connection for live posting (requires an active Meta App) or Mock Connection for local development and sandbox testing.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setIsConnectModalOpen(false);
                    window.location.href = generateOAuthUrl(connectTarget.id);
                  }}
                  style={{ 
                    width: '100%', 
                    background: connectTarget.color,
                    border: 'none', 
                    color: '#fff', 
                    padding: '0.85rem', 
                    borderRadius: '12px', 
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: `0 4px 15px ${connectTarget.color}30`,
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  Real OAuth Connection
                </button>

                <button 
                  onClick={() => {
                    setIsConnectModalOpen(false);
                    const mockUrl = `/auth/callback?code=mock_code_${Date.now()}&state=${connectTarget.id}`;
                    navigate(mockUrl);
                  }}
                  style={{ 
                    width: '100%', 
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)', 
                    color: 'var(--text-primary)', 
                    padding: '0.85rem', 
                    borderRadius: '12px', 
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  Simulated Mock Connection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
