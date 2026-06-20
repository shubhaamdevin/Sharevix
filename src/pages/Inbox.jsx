import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Send, Star, Info, ShieldAlert, AlertCircle } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '../components/Icons';

const initialDemoConversations = [
  {
    id: 'demo_1',
    name: 'Amit Sharma',
    platform: 'facebook',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    lastMessage: 'Aapki service prices kya hain for monthly package?',
    time: '2 mins ago',
    unread: true,
    messages: [
      { id: 1, sender: 'them', text: 'Hello! I saw your post about social media management.', time: '10:15 AM' },
      { id: 2, sender: 'me', text: 'Hi Amit! How can we help you today?', time: '10:17 AM' },
      { id: 3, sender: 'them', text: 'Aapki service prices kya hain for monthly package?', time: '10:18 AM' }
    ]
  },
  {
    id: 'demo_2',
    name: 'Neha Kapoor',
    platform: 'instagram',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    lastMessage: 'Awesome design! Loved the post style.',
    time: '1 hour ago',
    unread: false,
    messages: [
      { id: 1, sender: 'them', text: 'Awesome design! Loved the post style.', time: '09:05 AM' }
    ]
  },
  {
    id: 'demo_3',
    name: 'Rajesh Kumar',
    platform: 'facebook',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    lastMessage: 'Can we schedule a call tomorrow morning?',
    time: 'Yesterday',
    unread: false,
    messages: [
      { id: 1, sender: 'them', text: 'Are your schedulers automated?', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Yes Rajesh, they publish directly to Facebook and Instagram automatically.', time: 'Yesterday' },
      { id: 3, sender: 'them', text: 'Can we schedule a call tomorrow morning?', time: 'Yesterday' }
    ]
  }
];

export default function Inbox() {
  const [conversations, setConversations] = useState(initialDemoConversations);
  const [selectedId, setSelectedId] = useState('demo_1');
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRealSync, setIsRealSync] = useState(false);
  const [loading, setLoading] = useState(false);

  const fbToken = localStorage.getItem('fb_access_token');
  const fbPageId = localStorage.getItem('fb_page_id');

  const fetchRealConversations = async () => {
    if (!fbToken || !fbPageId) {
      setIsRealSync(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${fbPageId}/conversations?fields=senders,messages{message,created_time,from},updated_time&access_token=${fbToken}`);
      const data = await res.json();
      
      if (res.ok && data.data) {
        const formatted = data.data.map(conv => {
          const senderName = conv.senders?.data?.[0]?.name || 'Anonymous User';
          const msgs = (conv.messages?.data || []).map(m => ({
            id: m.id,
            sender: m.from?.id === fbPageId ? 'me' : 'them',
            text: m.message,
            time: new Date(m.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })).reverse();

          return {
            id: conv.id,
            name: senderName,
            platform: 'facebook',
            avatar: `https://graph.facebook.com/v18.0/${conv.senders?.data?.[0]?.id || ''}/picture?type=square`,
            lastMessage: msgs[msgs.length - 1]?.text || 'No messages',
            time: new Date(conv.updated_time).toLocaleDateString(),
            unread: false,
            messages: msgs
          };
        });
        
        if (formatted.length > 0) {
          setConversations(formatted);
          setSelectedId(formatted[0].id);
          setIsRealSync(true);
        }
      }
    } catch (err) {
      console.warn("Failed to load real FB conversations, using demo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealConversations();
  }, [fbToken, fbPageId]);

  const currentChat = conversations.find(c => c.id === selectedId);

  const handleSend = async () => {
    if (!replyText.trim()) return;

    if (isRealSync && !String(selectedId).startsWith('demo_')) {
      // Send real message via Facebook API
      try {
        const res = await fetch(`https://graph.facebook.com/v18.0/${selectedId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: replyText,
            access_token: fbToken
          })
        });
        if (res.ok) {
          fetchRealConversations();
          setReplyText('');
          window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: 'Message sent!' }}));
        } else {
          const errData = await res.json();
          throw new Error(errData.error?.message || "Failed to send");
        }
      } catch (err) {
        window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'error', message: err.message }}));
      }
    } else {
      // Offline fallback / demo update
      const newMessage = {
        id: Date.now(),
        sender: 'me',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations(prev => prev.map(c => {
        if (c.id === selectedId) {
          return {
            ...c,
            lastMessage: replyText,
            time: 'Just now',
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      }));
      setReplyText('');
    }
  };

  const filteredChats = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', gap: '1rem' }}>
      
      {/* Real Sync Status Alert Banner */}
      {!isRealSync && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: 'rgba(255, 152, 0, 0.05)', border: '1px dashed rgba(255, 152, 0, 0.3)', borderRadius: '12px', fontSize: '0.82rem', color: 'orange' }}>
          <AlertCircle size={16} />
          <span><strong>Demo Mode Active:</strong> Sync real Meta Page conversations by connecting your Facebook account inside the <strong>Accounts</strong> tab.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, background: 'var(--panel-bg)', borderRadius: '24px', border: '1px solid var(--panel-border)', overflow: 'hidden' }}>
        
        {/* LEFT: Chats List */}
        <div style={{ borderRight: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Search */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Unified Inbox</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.15)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <Search size={16} color="var(--text-secondary)" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', fontSize: '0.85rem' }}>Syncing data stream...</div>
            ) : filteredChats.map(chat => {
              const isSelected = chat.id === selectedId;
              const PlatformIcon = chat.platform === 'facebook' ? FacebookIcon : InstagramIcon;
              return (
                <div 
                  key={chat.id}
                  onClick={() => setSelectedId(chat.id)}
                  style={{
                    display: 'flex', gap: '0.75rem', padding: '0.85rem', borderRadius: '14px', cursor: 'pointer',
                    background: isSelected ? 'var(--sidebar-active-bg)' : 'transparent',
                    border: isSelected ? '1px solid var(--panel-border)' : '1px solid transparent',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={chat.avatar} alt={chat.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} />
                    <div style={{ position: 'absolute', bottom: -2, right: -2, background: chat.platform === 'facebook' ? '#1877F2' : '#E1306C', padding: '3px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PlatformIcon size={12} color="#fff" />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{chat.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{chat.time}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread && (
                    <div style={{ width: '8px', height: '8px', background: 'var(--accent-blue)', borderRadius: '50%', alignSelf: 'center', marginLeft: '0.5rem' }}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Chat Window */}
        {currentChat ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Chat Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={currentChat.avatar} alt={currentChat.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} />
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentChat.name}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Active on {currentChat.platform.toUpperCase()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ padding: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Star size={18} /></button>
                <button style={{ padding: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Info size={18} /></button>
              </div>
            </div>

            {/* Messages Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {currentChat.messages.map(m => {
                const isMe = m.sender === 'me';
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '60%', padding: '0.85rem 1.1rem', borderRadius: '16px',
                      background: isMe ? 'var(--accent-purple)' : 'rgba(255,255,255,0.03)',
                      color: isMe ? '#fff' : 'var(--text-primary)',
                      border: isMe ? 'none' : '1px solid var(--panel-border)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{m.text}</div>
                      <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: '0.25rem', opacity: 0.7 }}>{m.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Footer */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--panel-border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder={`Reply to ${currentChat.name}...`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{ flex: 1, padding: '0.8rem 1.2rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '16px', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
              />
              <button 
                onClick={handleSend}
                style={{ padding: '0.8rem 1.2rem', background: 'var(--btn-primary-bg)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <Send size={16} /> Send
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)', gap: '1rem' }}>
            <MessageSquare size={36} />
            <span>Select a conversation to start messaging</span>
          </div>
        )}
      </div>
    </div>
  );
}
