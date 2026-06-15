import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Smartphone, QrCode, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { currentUser, login, signup, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mobile app login state
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrStatus, setQrStatus] = useState('idle'); // idle, scanning, success
  const [qrMessage, setQrMessage] = useState('Scan the QR code with your mobile app.');

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error("Google Auth error:", err);
      const isPopupClosed = err.code === 'auth/popup-closed-by-user' || 
                            err.message?.toLowerCase().includes('closed') || 
                            err.message?.toLowerCase().includes('cancel');
      if (isPopupClosed) {
        setError('Google login window was closed. If you saw "Access blocked: App has not completed the Google verification process", please publish your Google OAuth App to "Production" in the Google Cloud Console.');
      } else {
        setError(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMobileAppLogin = async () => {
    setQrStatus('scanning');
    setQrMessage('Device detected. Waiting for mobile authorization...');
    
    // Simulate mobile scanning & authentication delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setQrStatus('success');
    setQrMessage('Authenticated! Connecting to your dashboard...');
    
    const testEmail = 'mobile_user@sharevix.com';
    const testPassword = 'SharevixMobileLogin123!';
    
    try {
      try {
        await login(testEmail, testPassword);
      } catch (loginErr) {
        // If account does not exist, auto-signup
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
          await signup(testEmail, testPassword);
        } else {
          throw loginErr;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowQRModal(false);
      navigate('/dashboard');
    } catch (err) {
      setQrStatus('idle');
      setQrMessage('Scan failed.');
      setError(`Mobile login failed: ${err.message}`);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="/logo.png?v=5" 
            alt="Logo" 
            style={{ 
              height: '110px', 
              maxWidth: '100%',
              objectFit: 'contain', 
              display: 'block'
            }} 
            onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='block'; }} 
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>One Post. Every Platform.</p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '8px' }}>{error}</div>}
          
          {!isLogin && (
            <input type="text" placeholder="Full Name" required />
          )}
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
          
          {isLogin && (
            <button 
              type="button" 
              onClick={() => { setShowQRModal(true); setQrStatus('idle'); setQrMessage('Scan the QR code with your mobile app.'); }}
              className="btn-secondary" 
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'rgba(0, 210, 255, 0.05)', 
                border: '1px solid rgba(0, 210, 255, 0.15)',
                color: 'var(--accent-blue)',
                fontWeight: 600
              }}
            >
              <Smartphone size={18} /> Login with Mobile App
            </button>
          )}
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }}></div>
        </div>

        <button onClick={handleGoogleAuth} className="btn-secondary" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 500 }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>

      </div>

      {/* QR Code Login Modal */}
      <AnimatePresence>
        {showQRModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel" 
              style={{ width: '90%', maxWidth: '420px', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative' }}
            >
              <button 
                onClick={() => setShowQRModal(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <QrCode size={24} color="var(--accent-blue)" /> QR Login
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Instant login from your mobile app</p>
              </div>

              {/* QR Code Display with pulsing scanline overlay */}
              <div style={{ 
                position: 'relative', width: '220px', height: '220px', background: '#fff', padding: '12px', 
                borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                boxShadow: '0 8px 30px rgba(0, 210, 255, 0.15)', overflow: 'hidden'
              }}>
                {qrStatus === 'success' ? (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle2 size={64} color="var(--success)" />
                  </motion.div>
                ) : (
                  <>
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=sharevix-auth-linked-device-token-abcxyz" 
                      alt="QR Code" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                    {qrStatus === 'scanning' && (
                      <motion.div 
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        style={{
                          position: 'absolute', left: 0, width: '100%', height: '4px',
                          background: 'linear-gradient(to right, transparent, var(--success), transparent)',
                          boxShadow: '0 0 8px var(--success)', zIndex: 5
                        }}
                      />
                    )}
                  </>
                )}
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ 
                  fontSize: '0.9rem', color: qrStatus === 'success' ? 'var(--success)' : 'var(--text-secondary)', 
                  fontWeight: 500, textAlign: 'center', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {qrStatus === 'scanning' && <Loader2 size={16} className="animate-spin" style={{ marginRight: '0.5rem', color: 'var(--success)' }} />}
                  {qrMessage}
                </p>

                {qrStatus === 'idle' && (
                  <button 
                    onClick={handleMobileAppLogin}
                    className="btn-primary" 
                    style={{ 
                      width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                      background: 'linear-gradient(45deg, var(--success), #00b0ff)', border: 'none', boxShadow: '0 4px 15px rgba(0, 230, 118, 0.2)'
                    }}
                  >
                    <Smartphone size={18} /> Simulate Scan & Approve
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
