import React from 'react';

// Helpers to wrap standard app icon shapes
const SquareAppIcon = ({ size, bg, children }) => (
  <div style={{ width: size, height: size, borderRadius: '22%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
    {children}
  </div>
);

const CircleAppIcon = ({ size, bg, children }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
    {children}
  </div>
);

// 1. Bilibili (Official Pink App Icon)
export const BilibiliIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#FB7299">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm3.8 13.5l-1.2-1.2-1.2 1.2a1 1 0 0 1-1.4 0l-1.2-1.2-1.2 1.2a1 1 0 0 1-1.4-1.4l1.2-1.2-1.2-1.2a1 1 0 0 1 1.4-1.4l1.2 1.2 1.2-1.2a1 1 0 0 1 1.4 0l1.2 1.2 1.2-1.2a1 1 0 0 1 1.4 1.4l-1.2 1.2 1.2 1.2a1 1 0 0 1 0 1.4z"/>
    </svg>
  </SquareAppIcon>
);

// 2. Bluesky (Official Butterfly Blue App Icon)
export const BlueskyIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#0085FF">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M12 11.1c-1.3-1.8-3.4-4.8-4.7-6.6-.7-.9-1.8-1.5-3-1.5C2 3 0 5 0 7.3c0 2.2 1.3 4 2.8 4.7l1.7.8c.8.4 1.2 1.2 1.2 2 0 3.3 2.7 6 6.3 6 3.6 0 6.3-2.7 6.3-6 0-.8.4-1.6 1.2-2l1.7-.8c1.5-.7 2.8-2.5 2.8-4.7C24 5 22 3 19.7 3c-1.2 0-2.3.6-3 1.5-1.3 1.8-3.4 4.8-4.7 6.6z"/>
    </svg>
  </SquareAppIcon>
);

// 3. Discord (Official Blurple App Icon)
export const DiscordIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#5865F2">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
    </svg>
  </SquareAppIcon>
);

// 4. Douyin (Official Music Note App Icon)
export const DouyinIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#000000">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 9.5a3.5 3.5 0 0 1-3.5-3.5V5h-2v9.5a2.5 2.5 0 0 1-2.5 2.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5V10c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5V9.5a1.5 1.5 0 0 0 1.5 1.5h2v-1.5z" fill="white" />
    </svg>
  </SquareAppIcon>
);

// 5. Facebook (Official Circular Blue App Icon)
export const FacebookIcon = ({ size = 24 }) => (
  <CircleAppIcon size={size} bg="#1877F2">
    <svg width="55%" height="55%" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  </CircleAppIcon>
);

// 6. Instagram (Official Gradient App Icon)
export const InstagramIcon = ({ size = 24 }) => (
  <div style={{
    width: size, height: size, borderRadius: '22%',
    background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  }}>
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  </div>
);

// 7. KakaoTalk (Official Yellow App Icon)
export const KakaotalkIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#FEE500">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="#3C1E1E">
      <path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.8 6.5l-1 3.7c-.1.3.2.5.5.3l4.3-2.8c.4.1.9.1 1.4.1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"/>
    </svg>
  </SquareAppIcon>
);

// 8. Kick (Official Bright Green App Icon)
export const KickIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#53FC18">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="black">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-2.5 12.5h-2.5v-1.5h2.5v1.5zm0-4.5h-2.5V9.5h2.5v1.5zm-5 4.5H9V9.5h2.5v6z"/>
    </svg>
  </SquareAppIcon>
);

// 9. LINE (Official Green App Icon)
export const LineIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#00C300">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M22 10.3c0-4.3-4.5-7.8-10-7.8S2 6 2 10.3c0 3.8 3.6 7 8.5 7.6.3 0 .8.2.9.6l.3 2s-.1.4-.3.5c-.2.1-.5.1-.5.1s-2.3-.8-3.2-1.1c-1-.3-2 1-1 1.6 2 1.3 5 2.6 5 2.6s.5.1.8-.1c.3-.2.4-.6.4-.6l.7-4.1c4.5-.7 7.9-3.9 7.9-7.6z"/>
    </svg>
  </SquareAppIcon>
);

// 10. LinkedIn (Official Square Blue App Icon)
export const LinkedinIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#0A66C2">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  </SquareAppIcon>
);

// 11. Mastodon (Official Purple App Icon)
export const MastodonIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#6364FF">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M21.26 13.59c-.27 2.65-2.52 4.77-5.17 4.96-2.02.14-4.04.14-6.06 0-2.65-.19-4.9-2.31-5.17-4.96C4.42 9.17 4.42 5.13 4.86.72A1 1 0 0 1 5.85 0h12.3a1 1 0 0 1 .99.72c.44 4.41.44 8.45 0 12.87zM8.5 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
    </svg>
  </SquareAppIcon>
);

// 12. Medium (Official Black & White App Icon)
export const MediumIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#000000">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm5.9 0c0 3.5-1.5 6.33-3.35 6.33S12.73 15.5 12.73 12s1.5-6.33 3.36-6.33S19.44 8.5 19.44 12zm2.25 0c0 2.89-.37 5.24-.83 5.24s-.83-2.35-.83-5.24.37-5.24.83-5.24.83 2.35.83 5.24z"/>
    </svg>
  </SquareAppIcon>
);

// 13. Messenger (Official Gradient Speech App Icon)
export const MessengerIcon = ({ size = 24 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'radial-gradient(circle at 10% 90%, #00C6FF 0%, #0072FF 50%, #0084FF 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  }}>
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.18 5.47 3.1 7.3v3.7a.8.8 0 0 0 1.2.7l3.65-2c.67.18 1.37.28 2.05.28 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.14 12.8L10.3 11.6l-4.56 3.2 5-5.3 2.84 3.2 4.56-3.2-5 5.3z"/>
    </svg>
  </div>
);

// 14. Naver Band (Official Green App Icon)
export const NaverbandIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#00CE3A">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2V9H9V7h4v9z"/>
    </svg>
  </SquareAppIcon>
);

// 15. Odnoklassniki / OK (Official Orange App Icon)
export const OkIcon = ({ size = 24 }) => (
  <CircleAppIcon size={size} bg="#EE8208">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-3.3 0-6 1.7-7 4.1a1 1 0 1 0 1.8.8c.7-1.6 2.4-2.7 4.2-2.7 1.8 0 3.5 1.1 4.2 2.7a1 1 0 0 0 1.8-.8c-1-2.4-3.7-4.1-7-4.1z"/>
    </svg>
  </CircleAppIcon>
);

// 16. Parler (Official Red App Icon)
export const ParlerIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#CB0000">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H9v-2h4c1.1 0 2-.9 2-2s-.9-2-2-2H9V6h6v2h-4v2h2c2.2 0 4 1.8 4 4s-1.8 4-4 4z"/>
    </svg>
  </SquareAppIcon>
);

// 17. Pinterest (Official Red Round App Icon)
export const PinterestIcon = ({ size = 24 }) => (
  <CircleAppIcon size={size} bg="#E60023">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439l1.24-5.253s-.315-.63-.315-1.56c0-1.462.852-2.553 1.902-2.553.896 0 1.33.674 1.33 1.483 0 .9-.57 2.248-.868 3.498-.248 1.047.525 1.902 1.556 1.902 1.87 0 3.3-1.97 3.3-4.811 0-2.518-1.81-4.277-4.39-4.277-2.997 0-4.757 2.247-4.757 4.576 0 .91.35 1.886.79 2.413.087.107.098.199.073.303-.08.324-.257 1.055-.292 1.201-.047.19-.158.232-.365.137C3.805 15.335 2.78 12.983 2.78 11.233c0-3.729 2.715-7.155 7.817-7.155 4.106 0 7.3 2.924 7.3 6.84 0 4.078-2.57 7.369-6.14 7.369-1.202 0-2.333-.625-2.72-1.364l-.74 2.819c-.267 1.02-.99 2.301-1.47 3.08 1.47.452 3.03.699 4.65.699 6.62 0 11.98-5.367 11.98-11.987C24.01 5.367 18.64 0 12.017 0z"/>
    </svg>
  </CircleAppIcon>
);

// 18. QQ (Official Blue App Icon)
export const QqIcon = ({ size = 24 }) => (
  <CircleAppIcon size={size} bg="#12B7F5">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 2.2.72 4.25 1.94 5.92-.16.88-.6 2.68-.78 3.56.24.08 1.88-.94 2.78-1.52C7.62 20.84 9.73 21.36 12 21.36c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1.8 13.8c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  </CircleAppIcon>
);

// 19. Quora (Official Red App Icon)
export const QuoraIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#B92B27">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M17.06 15.63a7.48 7.48 0 0 1-5.06 2c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8c0 2.45-1.1 4.64-2.84 6.13l3 3.3a.5.5 0 0 1-.74.68l-2.36-2.11zM12 4c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
    </svg>
  </SquareAppIcon>
);

// 20. Reddit (Official Red-Orange Round App Icon)
export const RedditIcon = ({ size = 24 }) => (
  <CircleAppIcon size={size} bg="#FF4500">
    <svg width="70%" height="70%" viewBox="0 0 24 24" fill="white">
      <path d="M24 11.5c0-1.654-1.346-3-3-3-.962 0-1.864.48-2.42 1.242-1.643-1.006-3.853-1.641-6.233-1.722l1.307-4.108 4.2.9c.078.77.72 1.38 1.5 1.38 1.103 0 2-.897 2-2s-.897-2-2-2c-.83 0-1.54.5-1.86 1.22l-4.747-1.018c-.221-.047-.42.096-.468.318l-1.478 4.67C6.071 6.301 3.821 6.941 2.15 7.962 1.585 7.2 0 7.5 0 8.5c0 1.654 1.346 3 3 3 .24 0 .47-.03.7-.08.02.25.02.5.02.75 0 3.66 4.03 6.63 9 6.63s9-2.97 9-6.63c0-.25 0-.5-.02-.75.23.05.46.08.7.08zm-16.5 1.5c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zm11 4.5c-1.782 1.782-5.218 1.782-7 0-.14-.14-.14-.38 0-.52.14-.14.38-.14.52 0 1.488 1.488 4.472 1.488 5.96 0 .14-.14.38-.14.52 0 .14.14.14.38 0 .52zm-.5-4.5c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5z"/>
    </svg>
  </CircleAppIcon>
);

// 21. Snapchat (Official Yellow Square App Icon)
export const SnapchatIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#FFFC00">
    <svg width="65%" height="65%" viewBox="0 0 24 24">
      <path 
        d="M11.996 2.004c-2.327 0-4.148.972-5.463 2.915-.658.973-.836 2.03-.836 3.088 0 .426.046.852.138 1.272.062.285.226.477.424.58.552.287 1.096.593 1.63.924.364.226.552.483.552.75 0 .193-.092.387-.276.58-.553.582-1.22 1.097-1.983 1.528-.415.232-.59.567-.534.978.056.41.383.67.973.74.836.1 1.673.136 2.51.103.328-.01.594.136.784.425.435.658 1.05.992 1.83.992.78 0 1.395-.334 1.83-.992.19-.29.456-.436.784-.425.837.033 1.674-.003 2.51-.103.59-.07.917-.33.973-.74.056-.411-.12-.746-.534-.978-.763-.43-1.43-.946-1.983-1.528-.184-.193-.276-.387-.276-.58 0-.267.188-.524.552-.75.534-.33 1.078-.637 1.63-.924.198-.103.362-.295.424-.58.092-.42.138-.846.138-1.272 0-1.058-.178-2.115-.836-3.088-1.315-1.943-3.136-2.915-5.463-2.915z"
        fill="white"
        stroke="black"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  </SquareAppIcon>
);

// 22. Telegram (Official Plane Circular App Icon)
export const TelegramIcon = ({ size = 24 }) => (
  <CircleAppIcon size={size} bg="#24A1DE">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .54-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.74 4-1.74 6.67-2.88 8-3.42 3.81-1.55 4.6-1.82 5.11-1.83.12 0 .37.03.53.15.14.12.18.28.2.42a1.66 1.66 0 0 1-.02.26z"/>
    </svg>
  </CircleAppIcon>
);

// 23. Threads (Official Black Round App Icon)
export const ThreadsIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#000000">
    <svg width="60%" height="60%" viewBox="0 0 192 192" fill="white">
      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
    </svg>
  </SquareAppIcon>
);

// 24. TikTok (Official Black App Icon)
export const TiktokIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#000000">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
      <path d="M16 6a3 3 0 0 0-3-3h-2v11a1.5 1.5 0 1 1-2.5-1.25V7.65c-2 .5-3.5 2.3-3.5 4.35 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5V9a6 6 0 0 0 4.5 2V9c-1.5 0-2.5-1.5-2.5-3z" fill="white" />
    </svg>
  </SquareAppIcon>
);

// 25. Truth Social (Official Purple App Icon)
export const TruthsocialIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#5F259F">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 11h-3.5v3.5a1 1 0 0 1-2 0V13H7.5a1 1 0 0 1 0-2H11V7.5a1 1 0 0 1 2 0V11h3.5a1 1 0 0 1 0 2z"/>
    </svg>
  </SquareAppIcon>
);

// 26. Tumblr (Official Dark Blue App Icon)
export const TumblrIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#36465D">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M19 12h-3V9.5a1.5 1.5 0 0 1 1.5-1.5H19V5h-3.5A4.5 4.5 0 0 0 11 9.5V12H8v3h3v9h5v-9h3v-3z"/>
    </svg>
  </SquareAppIcon>
);

// 27. Twitch (Official Purple App Icon)
export const TwitchIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#9146FF">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0H6zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714v9.429z"/>
    </svg>
  </SquareAppIcon>
);

// 28. Viber (Official Purple App Icon)
export const ViberIcon = ({ size = 24 }) => (
  <CircleAppIcon size={size} bg="#7360F2">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M19.8 12c.1-.8.2-1.6.2-2.4 0-4.2-3.4-7.6-7.6-7.6-1.5 0-2.9.4-4.1 1.2C7 2.3 5.4 2.3 4.2 3.1 2.3 4.3 1.3 6.3 1.3 8.5c0 5 3.3 9.3 8.3 10.4 1 .2 2 .3 3 .3 4.2 0 7.6-3.4 7.6-7.6l-.4.4z"/>
    </svg>
  </CircleAppIcon>
);

// 29. VK (Official Blue App Icon)
export const VkIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#0077FF">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M15.2 2H8.8C3.8 2 2 3.8 2 8.8v6.4C2 20.2 3.8 22 8.8 22h6.4c5 0 6.8-1.8 6.8-6.8V8.8C22 3.8 20.2 2 15.2 2zm3.3 12.3c0 .3-.1.5-.4.7-.2.2-.5.3-.8.3h-1.3c-.6 0-1.1-.3-1.6-.8-.4-.4-.8-.8-1.2-.8s-.7.2-.7.6v1c0 .3-.1.5-.3.6-.2.1-.4.2-.7.2-1.3 0-2.5-.5-3.5-1.5-1-1-1.7-2.3-2.2-3.8-.1-.3 0-.5.2-.6.2-.1.4-.2.7-.2h1.3c.3 0 .5.1.6.3.3.6.6 1.2 1 1.7.2.3.4.4.6.4.1 0 .2 0 .2-.2v-2.2c0-.3-.1-.5-.3-.6-.2-.1-.5-.1-.7-.1V8c.5-.3 1.1-.4 1.7-.4.3 0 .5.1.6.3.1.2.2.5.2.8v2.4c0 .2.1.3.2.3.1 0 .2-.1.3-.2.6-.9 1.1-1.9 1.4-2.9.1-.2.2-.3.5-.3h1.3c.3 0 .5.1.6.3a.6.6 0 0 1 0 .6c-.3.8-.8 1.6-1.4 2.3-.2.3-.2.5 0 .7.4.4.9.9 1.3 1.4.3.4.4.7.4.9z"/>
    </svg>
  </SquareAppIcon>
);

// 30. WeChat (Official Green App Icon)
export const WechatIcon = ({ size = 24 }) => (
  <CircleAppIcon size={size} bg="#07C160">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M8.7 2C4.45 2 1 4.8 1 8.25c0 2 .1 3 1.8 4.2-.1.4-.4 1.4-.4 1.4s1 .1 2-.6c1.3.4 2.7.5 4.3.5.3 0 .7 0 1-.05A7.05 7.05 0 0 1 9.5 9.5c0-3.3 3.1-6 6.8-6 .3 0 .7 0 1 .05C15.8 4.15 12.5 2 8.7 2zm9.15 7.5c-3.1 0-5.6 2-5.6 4.5 0 1.3.6 2.5 1.7 3.3l-.3 1s.9 0 1.7-.5c.8.2 1.6.3 2.5.3 3.1 0 5.6-2 5.6-4.5S21 9.5 17.85 9.5z"/>
    </svg>
  </CircleAppIcon>
);

// 31. WhatsApp (Official Green Speech App Icon)
export const WhatsappIcon = ({ size = 24 }) => (
  <CircleAppIcon size={size} bg="#25D366">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M12.03 2a9.97 9.97 0 0 0-9.96 9.97c0 1.76.46 3.48 1.33 5.01L2 22l5.19-1.36a9.92 9.92 0 0 0 4.84 1.26h.01a9.97 9.97 0 0 0 9.97-9.97A9.97 9.97 0 0 0 12.03 2zm5.73 13.06c-.24.69-1.42 1.26-1.97 1.35-.48.08-1.1.15-3.18-.73-2.67-1.1-4.4-3.83-4.53-4-.13-.18-1.09-1.46-1.09-2.78 0-1.32.69-1.96.93-2.23.24-.26.53-.32.7-.32h.51c.18 0 .41-.07.64.47.24.6 1.14 2.78 1.2 2.9.06.12.1.26.02.42-.08.16-.18.27-.36.48-.18.21-.38.47-.54.64-.18.18-.37.38-.16.74.21.36.95 1.57 2.05 2.54 1.41 1.25 2.6 1.64 2.97 1.83.37.19.6.16.82-.1.21-.25.92-1.07 1.17-1.43.25-.36.5-.3.84-.17.34.13 2.17 1.02 2.54 1.21.37.19.62.29.7.45.08.16.08.9-.16 1.59z"/>
    </svg>
  </CircleAppIcon>
);

// 32. X / Twitter (Official Black App Icon)
export const TwitterIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#000000">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  </SquareAppIcon>
);

// 33. Xiaohongshu (Official Red App Icon)
export const XiaohongshuIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#FE2C55">
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
      <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm3 12a3 3 0 0 1-6 0v-4a3 3 0 0 1 6 0v4z"/>
    </svg>
  </SquareAppIcon>
);

// 34. YouTube (Official Red Play App Icon)
export const YoutubeIcon = ({ size = 24 }) => (
  <SquareAppIcon size={size} bg="#FF0000">
    <svg width="65%" height="65%" viewBox="0 0 24 24" fill="white">
      <path d="M23.498 6.163c-.272-.997-1.062-1.787-2.06-2.06-1.814-.49-9.1-.49-9.1-.49s-7.285 0-9.1.49c-.997.273-1.787 1.063-2.06 2.06C.3 7.973.3 12 .3 12s0 4.027.478 5.837c.272.997 1.063 1.787 2.06 2.06 1.815.49 9.1.49 9.1.49s7.285 0 9.1-.49c.998-.273 1.788-1.063 2.06-2.06.478-1.81.478-5.837.478-5.837s0-4.027-.478-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  </SquareAppIcon>
);


