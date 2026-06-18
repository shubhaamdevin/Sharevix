export const generateOAuthUrl = (platformId) => {
  const redirectUri = `${window.location.origin}/auth/callback`;
  const state = platformId; // Pass platformId in state to identify on callback

  switch (platformId) {
    case 'facebook':
      return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${import.meta.env.VITE_FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=token&scope=pages_manage_posts,pages_read_engagement,pages_show_list`;
    case 'instagram': // Instagram uses Facebook Graph API for business accounts
      return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${import.meta.env.VITE_FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=token&scope=pages_manage_posts,pages_read_engagement,pages_show_list,instagram_basic,instagram_content_publish,instagram_business_basic,instagram_business_content_publish`;
      
    case 'threads':
      const threadsClientId = import.meta.env.VITE_THREADS_CLIENT_ID || '1326065365671425';
      return `https://threads.net/oauth/authorize?client_id=${threadsClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=threads_basic,threads_content_publish,threads_manage_insights&response_type=code&state=${state}`;

    case 'x':
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${import.meta.env.VITE_X_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20tweet.write%20users.read&state=${state}&code_challenge=E9Melhoa2OwvFrGMTJguCH5F3dHwGFi1GYrUhai5uqM&code_challenge_method=S256`;
      
    case 'linkedin':
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${import.meta.env.VITE_LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=w_member_social`;
      
    case 'tiktok':
      return `https://www.tiktok.com/v2/auth/authorize/?client_key=${import.meta.env.VITE_TIKTOK_CLIENT_ID}&response_type=code&scope=video.upload,video.publish&redirect_uri=${redirectUri}&state=${state}`;

    case 'youtube':
      // Implicit flow - access token returned directly, no client secret needed
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_YOUTUBE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=https://www.googleapis.com/auth/youtube.upload%20https://www.googleapis.com/auth/youtube.readonly&state=${state}`;
      
    case 'pinterest':
      return `https://www.pinterest.com/oauth/?client_id=${import.meta.env.VITE_PINTEREST_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=boards:read,pins:read,pins:write&state=${state}`;
      
    case 'reddit':
      return `https://www.reddit.com/api/v1/authorize?client_id=${import.meta.env.VITE_REDDIT_CLIENT_ID}&response_type=code&state=${state}&redirect_uri=${redirectUri}&duration=permanent&scope=submit`;
      
    case 'discord':
      return `https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=webhook.incoming&state=${state}`;
      
    default:
      // Generic OAuth 2.0 Fallback structure for other platforms
      return `https://api.${platformId}.com/oauth/authorize?client_id=PLACEHOLDER_CLIENT_ID&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
  }
};
