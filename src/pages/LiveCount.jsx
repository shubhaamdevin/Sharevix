import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Users, AlertCircle, Link2, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon, LinkedinIcon, ThreadsIcon, PinterestIcon } from '../components/Icons';
import { isFacebookTokenError, disconnectFacebookAndInstagram, isGoogleTokenError, disconnectYouTube, isThreadsTokenError, disconnectThreads } from '../services/tokenHelper';

const platformDetails = {
  facebook: { name: 'Facebook', icon: FacebookIcon, color: '#1877F2', type: 'Fans' },
  instagram: { name: 'Instagram', icon: InstagramIcon, color: '#E1306C', type: 'Followers' },
  youtube: { name: 'YouTube', icon: YoutubeIcon, color: '#FF0000', type: 'Subscribers' },
  x: { name: 'X (Twitter)', icon: TwitterIcon, color: '#ffffff', type: 'Followers' },
  threads: { name: 'Threads', icon: ThreadsIcon, color: '#ffffff', type: 'Followers' }
};

export default function LiveCount() {
  const navigate = useNavigate();
  const [activePlatform, setActivePlatform] = useState('youtube');
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [baseCount, setBaseCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [isTicking, setIsTicking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load connected accounts from LocalStorage
  const checkConnections = () => {
    const saved = JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
    setConnectedPlatforms(saved);
  };

  useEffect(() => {
    checkConnections();
    window.addEventListener('accounts-updated', checkConnections);
    return () => window.removeEventListener('accounts-updated', checkConnections);
  }, []);

  const isConnected = connectedPlatforms.includes(activePlatform);

  // Fetch actual or mock base counts on platform change
  useEffect(() => {
    if (!isConnected) {
      setIsTicking(false);
      return;
    }

    const fetchBaseCount = async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
        setIsTicking(false);
        // Simulate connection loading lag
        await new Promise(r => setTimeout(r, 800));
      }

      if (activePlatform === 'facebook') {
        const token = localStorage.getItem('fb_access_token');
        let pageId = localStorage.getItem('fb_page_id');
        if (token) {
          try {
            if (!pageId) {
              const res = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`);
              const data = await res.json();
              if (res.ok && data.data && data.data.length > 0) {
                pageId = data.data[0].id;
              } else if (!res.ok) {
                throw data.error || new Error(data.error?.message || "Failed to query Facebook pages");
              }
            }
            if (pageId) {
              const res = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=fan_count,followers_count&access_token=${token}`);
              const data = await res.json();
              if (res.ok) {
                let count = 0;
                if (data.followers_count !== undefined && data.followers_count !== null) {
                  count = data.followers_count;
                } else if (data.fan_count !== undefined && data.fan_count !== null) {
                  count = data.fan_count;
                }
                setBaseCount(count);
                setDisplayCount(count);
                if (showLoading) setIsLoading(false);
                setIsTicking(count > 0);
                return;
              } else {
                throw data.error || new Error(data.error?.message || "Failed to query Facebook Page statistics");
              }
            }
          } catch (e) {
            console.error("Facebook count fetch error:", e);
            if (isFacebookTokenError(e)) {
              disconnectFacebookAndInstagram();
            }
          }
        }
      }

      if (activePlatform === 'instagram') {
        const token = localStorage.getItem('fb_access_token');
        let pageId = localStorage.getItem('fb_page_id');
        if (token) {
          try {
            if (!pageId) {
              const res = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`);
              const data = await res.json();
              if (res.ok && data.data && data.data.length > 0) {
                pageId = data.data[0].id;
              } else if (!res.ok) {
                throw data.error || new Error(data.error?.message || "Failed to query Facebook pages for Instagram");
              }
            }
            if (pageId) {
              const res = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account{followers_count}&access_token=${token}`);
              const data = await res.json();
              if (res.ok) {
                if (data.instagram_business_account) {
                  const count = data.instagram_business_account.followers_count || 0;
                  setBaseCount(count);
                  setDisplayCount(count);
                  if (showLoading) setIsLoading(false);
                  setIsTicking(count > 0);
                  return;
                }
              } else {
                throw data.error || new Error(data.error?.message || "Failed to query Instagram account statistics");
              }
            }
          } catch (e) {
            console.error("Instagram count fetch error:", e);
            if (isFacebookTokenError(e)) {
              disconnectFacebookAndInstagram();
            }
          }
        }
      }

      if (activePlatform === 'youtube') {
        const token = localStorage.getItem('youtube_access_token');
        if (token) {
          try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.items && data.items.length > 0) {
              const count = parseInt(data.items[0].statistics.subscriberCount) || 0;
              setBaseCount(count);
              setDisplayCount(count);
              if (showLoading) setIsLoading(false);
              setIsTicking(count > 0);
              return;
            } else if (!res.ok) {
              throw data.error || new Error(data.error?.message || "Failed to query YouTube API");
            }
          } catch (e) {
            console.error("YouTube LiveCount error:", e);
            if (isGoogleTokenError(e)) {
              disconnectYouTube();
            }
          }
        }
      }

      if (activePlatform === 'threads') {
        const token = localStorage.getItem('threads_access_token');
        if (token) {
          try {
            let count = 0;
            // 1. Try to fetch from /me/threads_insights (Official way for followers_count)
            const insightsRes = await fetch('/api/threads-proxy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                path: '/me/threads_insights',
                targetMethod: 'GET',
                params: {
                  metric: 'followers_count',
                  access_token: token
                }
              })
            });
            const insightsData = await insightsRes.json();
            
            if (insightsRes.ok && insightsData.data && insightsData.data.length > 0) {
              count = insightsData.data[0].total_value?.value ?? 0;
            } else {
              // 2. Fallback: Try to query /me profile field just in case
              console.warn("Threads insights failed, falling back to /me profile query", insightsData);
              const profileRes = await fetch('/api/threads-proxy', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  path: '/me',
                  targetMethod: 'GET',
                  params: {
                    fields: 'follower_count',
                    access_token: token
                  }
                })
              });
              const profileData = await profileRes.json();
              if (profileRes.ok) {
                count = profileData.follower_count ?? profileData.followers_count ?? 0;
              } else {
                throw insightsData.error || profileData.error || new Error("Failed to query Threads metrics");
              }
            }

            setBaseCount(count);
            setDisplayCount(count);
            if (showLoading) setIsLoading(false);
            setIsTicking(count > 0);
            return;
          } catch (e) {
            console.error("Threads LiveCount error:", e);
            if (isThreadsTokenError(e)) {
              disconnectThreads();
            }
          }
        }
      }

      // Simulated base counts for connected platforms default to 0 to keep values original
      const count = 0;
      setBaseCount(count);
      setDisplayCount(count);
      if (showLoading) setIsLoading(false);
      setIsTicking(false);
    };

    // Initial fetch
    fetchBaseCount(true);

    // Poll for live API updates every 5 seconds
    const interval = setInterval(() => {
      fetchBaseCount(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [activePlatform, connectedPlatforms]);

  useEffect(() => {
    setDisplayCount(baseCount);
  }, [baseCount]);

  const activeDetails = platformDetails[activePlatform];
  const Icon = activeDetails.icon;

  const isMockConnection = false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <Radio size={28} color="#ff3d00" className={isTicking ? 'animate-pulse' : ''} /> Real-Time Live Count
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Watch your subscribers, followers, and fans grow live with real-time dynamic ticking.</p>
      </div>

      {/* Platform Switcher Grid */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '16px', border: '1px solid var(--panel-border)', width: 'fit-content' }}>
        {Object.entries(platformDetails).map(([id, info]) => {
          const PlatIcon = info.icon;
          const isActive = activePlatform === id;
          const isPlatConnected = connectedPlatforms.includes(id);

          return (
            <button 
              key={id}
              onClick={() => setActivePlatform(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: isActive ? `${info.color}15` : 'transparent',
                border: isActive ? `1px solid ${info.color}` : '1px solid transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                padding: '0.6rem 1.2rem', borderRadius: '12px', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                boxShadow: isActive ? `0 0 10px ${info.color}20` : 'none'
              }}
            >
              <PlatIcon size={16} color={isActive ? info.color : 'var(--text-secondary)'} />
              {info.name}
              {isPlatConnected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>}
            </button>
          );
        })}
      </div>

      {/* Live Count Display Area */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '380px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glowing Background Radial */}
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          background: `radial-gradient(circle, ${activeDetails.color}08 0%, transparent 70%)`,
          zIndex: 1, pointerEvents: 'none'
        }} />

        {isConnected && !isLoading && (
          <div style={{ 
            position: 'absolute', top: '20px', right: '24px', 
            display: 'flex', alignItems: 'center', 
            background: 'rgba(255, 0, 0, 0.12)', border: '1px solid rgba(255, 0, 0, 0.25)',
            padding: '4px 10px', borderRadius: '6px', 
            fontSize: '0.75rem', fontWeight: 800, color: '#ff4d4d', letterSpacing: '0.05em', textTransform: 'uppercase',
            zIndex: 10
          }}>
            <div style={{ position: 'relative', width: '6px', height: '6px', borderRadius: '50%', background: '#ff0000', marginRight: '6px' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                borderRadius: '50%', border: '1px solid #ff0000',
                animation: 'ripple 1.6s infinite ease-out'
              }} />
            </div>
            Live {activeDetails.type}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isConnected ? (
            
            // Platform Not Connected View
            <motion.div 
              key="not-connected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', zIndex: 5, textAlign: 'center', padding: '2rem' }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 61, 0, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 61, 0, 0.2)' }}>
                <AlertCircle size={32} color="var(--error)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{activeDetails.name} is Not Connected</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.95rem' }}>
                  Live follower counts are only available for authenticated profiles. Connect your {activeDetails.name} account to begin tracking.
                </p>
              </div>
              <button 
                onClick={() => navigate('/accounts')}
                className="btn-primary" 
                style={{ 
                  padding: '0.75rem 1.75rem', borderRadius: '12px', fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: `linear-gradient(45deg, ${activeDetails.color}, var(--accent-blue))`
                }}
              >
                <Link2 size={18} /> Connect {activeDetails.name} <ChevronRight size={16} />
              </button>
            </motion.div>

          ) : isLoading ? (

            // Loading / Syncing State
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', zIndex: 5 }}
            >
              <div className="animate-spin" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.03)', borderTop: `3px solid ${activeDetails.color}` }}></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                ESTABLISHING STREAM WITH {activeDetails.name.toUpperCase()}...
              </div>
            </motion.div>

          ) : (

            // Active Live Ticker Count View (YouTube Style)
            <motion.div 
              key="connected-live"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', zIndex: 5 }}
            >
              {/* Ticking Numbers Display */}
              <div style={{ 
                fontSize: '5.5rem', fontWeight: 900, fontFamily: 'monospace', 
                color: '#fff', letterSpacing: '-0.02em', textShadow: `0 0 40px ${activeDetails.color}35`,
                display: 'flex', gap: '2px', padding: '1rem 2rem', borderRadius: '24px', 
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)'
              }}>
                <AnimatePresence mode="popLayout">
                  {displayCount.toLocaleString().split('').map((char, index) => (
                    <motion.span 
                      key={`${char}-${index}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      style={{ display: 'inline-block' }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              {/* Platform Branding Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 1.5rem', borderRadius: '30px', border: '1px solid var(--panel-border)' }}>
                <Icon size={24} color={activeDetails.color} />
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeDetails.name} Page Live Counter</span>
              </div>



            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pulse & Ripple Keyframe Animation Styles */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
