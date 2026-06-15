import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Connecting your account...');

  useEffect(() => {
    const processAuth = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state'); // We passed platformId in state
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Connection failed: ${error}`);
        setTimeout(() => navigate('/accounts'), 3000);
        return;
      }

      if (code && state) {
        const connectedAccounts = JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
        if (!connectedAccounts.includes(state)) {
          connectedAccounts.push(state);
          localStorage.setItem('connectedAccounts', JSON.stringify(connectedAccounts));
        }

        // Auto-fetch pages if connecting facebook or instagram
        if (state === 'facebook' || state === 'instagram') {
          try {
            // Real Facebook Graph API fetch using access token code
            const res = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${code}`);
            const data = await res.json();
            if (res.ok && data.data && data.data.length > 0) {
              const pages = data.data.map(p => ({
                id: p.id,
                name: p.name,
                access_token: p.access_token,
                category: p.category
              }));
              localStorage.setItem('fb_available_pages', JSON.stringify(pages));
              localStorage.setItem('fb_page_id', pages[0].id);
              localStorage.setItem('fb_page_name', pages[0].name);
              localStorage.setItem('fb_access_token', pages[0].access_token);
            } else if (!res.ok) {
              console.error("Facebook API error:", data);
            }
          } catch (err) {
            console.error("Real Graph API page fetch failed:", err);
          }
        }

        setStatus('success');
        setMessage(`Successfully connected to ${state}! Redirecting...`);
        setTimeout(() => navigate('/accounts'), 2000);
      } else {
        setStatus('error');
        setMessage('Invalid callback parameters.');
        setTimeout(() => navigate('/accounts'), 3000);
      }
    };

    processAuth();
  }, [searchParams, navigate]);

  return (
    <div style={{ flex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        
        {status === 'processing' && (
          <>
            <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-blue)', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Processing</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connected!</h2>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle size={48} style={{ color: 'var(--error)', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Failed</h2>
          </>
        )}
        
        <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
        
      </div>
    </div>
  );
}
