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
      // Get params from URL Query String
      let code = searchParams.get('code');
      let state = searchParams.get('state'); // platformId
      let error = searchParams.get('error');
      let accessToken = null;

      // Also parse URL Hash Fragment (for Implicit Flow: response_type=token)
      if (window.location.hash) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          if (hashParams.has('access_token')) {
            accessToken = hashParams.get('access_token');
          }
          if (hashParams.has('state')) {
            state = hashParams.get('state');
          }
          if (hashParams.has('error')) {
            error = hashParams.get('error');
          }
        } catch (e) {
          console.warn("Failed to parse URL hash fragment:", e);
        }
      }

      if (error) {
        setStatus('error');
        setMessage(`Connection failed: ${error}`);
        setTimeout(() => navigate('/accounts'), 4000);
        return;
      }

      const tokenToUse = accessToken || code;

      if (tokenToUse && state) {
        // Reject mock connection tokens
        if (tokenToUse.startsWith('mock_')) {
          setStatus('error');
          setMessage('Mock/Simulated connection tokens are not supported. Please use a real social media profile.');
          setTimeout(() => navigate('/accounts'), 4000);
          return;
        }

        const connectedAccounts = JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
        if (!connectedAccounts.includes(state)) {
          connectedAccounts.push(state);
          localStorage.setItem('connectedAccounts', JSON.stringify(connectedAccounts));
        }

        // Auto-fetch details if connecting youtube (implicit flow - token in URL hash)
        if (state === 'youtube') {
          let ytSaved = false;
          let fetchError = null;

          try {
            // In implicit flow, accessToken is already parsed from the URL hash above
            if (!accessToken) {
              throw new Error("No access token received from Google. Please ensure your Google OAuth client is configured as a 'Single-page application (SPA)' in Google Cloud Console.");
            }

            setMessage('Fetching your YouTube channel...');
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const ytData = await ytRes.json();

            if (ytRes.ok && ytData.items && ytData.items.length > 0) {
              const channel = ytData.items[0];
              const expiryTimestamp = Date.now() + (3600 * 1000) - 60000; // 1 hour - 1 min buffer
              localStorage.setItem('youtube_channel_id', channel.id);
              localStorage.setItem('youtube_channel_name', channel.snippet.title);
              localStorage.setItem('youtube_access_token', accessToken);
              localStorage.setItem('youtube_username', channel.snippet.customUrl || channel.snippet.title);
              localStorage.setItem('youtube_subscribers', channel.statistics.subscriberCount || '0');
              localStorage.setItem('youtube_token_expiry', String(expiryTimestamp));
              ytSaved = true;
            } else if (!ytRes.ok) {
              fetchError = ytData.error?.message || 'Failed to query YouTube API';
            } else {
              fetchError = 'No YouTube Channel found on this Google account. Please create a channel first.';
            }
          } catch (err) {
            fetchError = err.message;
            console.error('YouTube connection failed:', err);
          }

          if (!ytSaved) {
            const updatedConnections = connectedAccounts.filter(id => id !== 'youtube');
            localStorage.setItem('connectedAccounts', JSON.stringify(updatedConnections));
            setStatus('error');
            setMessage(`YouTube connection failed: ${fetchError || 'Could not verify channel'}`);
            setTimeout(() => navigate('/accounts'), 4000);
            return;
          }
        }

        // Auto-fetch details if connecting threads
        if (state === 'threads') {
          let threadsSaved = false;
          let fetchError = null;

          try {
            const redirectUri = `${window.location.origin}/auth/callback`;
            // Call our serverless Vercel function to exchange code for access_token safely
            const exchangeRes = await fetch(`/api/threads-token?code=${tokenToUse}&redirect_uri=${encodeURIComponent(redirectUri)}`);
            const exchangeData = await exchangeRes.json();
            
            if (!exchangeRes.ok) {
              throw new Error(exchangeData.error || 'Failed to exchange Threads authorization code');
            }

            const accessToken = exchangeData.access_token;
            
            // Query Threads /me profile API via proxy
            const profileRes = await fetch('/api/threads-proxy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                path: '/me',
                targetMethod: 'GET',
                params: {
                  fields: 'id,username,name',
                  access_token: accessToken
                }
              })
            });
            const profileData = await profileRes.json();
            
            if (profileRes.ok && profileData.username) {
              localStorage.setItem('threads_username', profileData.username);
              localStorage.setItem('threads_access_token', accessToken);
              localStorage.setItem('threads_user_id', profileData.id);
              threadsSaved = true;
            } else if (!profileRes.ok) {
              throw new Error(profileData.error?.message || 'Failed to fetch Threads profile details');
            } else {
              throw new Error('Threads profile details are incomplete.');
            }
          } catch (err) {
            fetchError = err.message;
            console.error("Threads connection failed:", err);
          }

          if (!threadsSaved) {
            const updatedConnections = connectedAccounts.filter(id => id !== 'threads');
            localStorage.setItem('connectedAccounts', JSON.stringify(updatedConnections));
            
            setStatus('error');
            setMessage(`Threads Connection Failed: ${fetchError || 'Unable to verify profile'}`);
            setTimeout(() => navigate('/accounts'), 4000);
            return;
          }
        }

        // Auto-fetch pages if connecting facebook or instagram
        if (state === 'facebook' || state === 'instagram') {
          let pagesSaved = false;
          let fetchError = null;
          let longLivedToken = tokenToUse;

          try {
            // Step 1: Exchange short-lived user token for a long-lived token (~60 days)
            setMessage('Securing a long-lived Facebook session...');
            try {
              const longTokenRes = await fetch(`/api/fb-long-token?short_token=${encodeURIComponent(tokenToUse)}`);
              const longTokenData = await longTokenRes.json();
              if (longTokenRes.ok && longTokenData.access_token) {
                longLivedToken = longTokenData.access_token;
                // Save expiry: expires_in is in seconds
                const expiresIn = longTokenData.expires_in || 5183944; // default ~60 days
                const expiryTimestamp = Date.now() + (expiresIn * 1000) - 86400000; // subtract 1 day buffer
                localStorage.setItem('fb_token_expiry', String(expiryTimestamp));
                localStorage.setItem('fb_user_token', longLivedToken);
              } else {
                console.warn('Long-lived token exchange failed, using short-lived token:', longTokenData);
              }
            } catch (ltErr) {
              console.warn('Long-lived token exchange request failed, using short-lived token:', ltErr);
            }

            // Step 2: Fetch pages using the (long-lived) token
            setMessage('Fetching your Facebook Pages...');
            const fields = 'name,access_token,category,instagram_business_account';
            const res = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=${fields}&access_token=${longLivedToken}`);
            const data = await res.json();
            if (res.ok && data.data && data.data.length > 0) {
              const pages = data.data.map(p => ({
                id: p.id,
                name: p.name,
                access_token: p.access_token,
                category: p.category,
                instagram_business_account: p.instagram_business_account
              }));
              localStorage.setItem('fb_available_pages', JSON.stringify(pages));
              localStorage.setItem('fb_page_id', pages[0].id);
              localStorage.setItem('fb_page_name', pages[0].name);
              localStorage.setItem('fb_access_token', pages[0].access_token);
              localStorage.setItem('facebook_username', pages[0].name);

              if (state === 'instagram') {
                const pageWithIg = pages.find(p => p.instagram_business_account && p.instagram_business_account.id);
                if (pageWithIg) {
                  localStorage.setItem('ig_business_account_id', pageWithIg.instagram_business_account.id);
                  localStorage.setItem('fb_page_id', pageWithIg.id);
                  localStorage.setItem('fb_page_name', pageWithIg.name);
                  localStorage.setItem('fb_access_token', pageWithIg.access_token);
                  const igUsername = pageWithIg.instagram_business_account.username || pageWithIg.instagram_business_account.name || pageWithIg.name;
                  localStorage.setItem('instagram_username', igUsername);
                  pagesSaved = true;
                } else {
                  fetchError = 'No Instagram Business Account linked to your Facebook Pages. Please link your Instagram Professional account to your Facebook Page.';
                }
              } else {
                pagesSaved = true;
              }
            } else if (!res.ok) {
              fetchError = data.error?.message || 'Failed to fetch Facebook pages';
              console.error('Facebook API error:', data);
            } else if (data.data && data.data.length === 0) {
              fetchError = 'No Facebook Pages found on this account. Make sure you have created a Facebook Page';
            }
          } catch (err) {
            fetchError = err.message;
            console.error('Facebook/Instagram page fetch failed:', err);
          }

          if (!pagesSaved) {
            const updatedConnections = connectedAccounts.filter(id => id !== state);
            localStorage.setItem('connectedAccounts', JSON.stringify(updatedConnections));
            setStatus('error');
            setMessage(`Connection Failed: ${fetchError || 'No active Facebook Pages found'}`);
            setTimeout(() => navigate('/accounts'), 4000);
            return;
          }
        }

        setStatus('success');
        setMessage(`Successfully connected to ${state}! Redirecting...`);
        window.dispatchEvent(new CustomEvent('accounts-updated'));
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
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
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
        
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 1rem' }}>{message}.</p>
        
      </div>
    </div>
  );
}
