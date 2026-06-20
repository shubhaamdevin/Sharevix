import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Send, Star, Info, AlertCircle, Loader2, Mic, Image as ImageIcon, Smile, Paperclip } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '../components/Icons';
import EmojiPicker from 'emoji-picker-react';

export default function Inbox() {
  const fbToken = localStorage.getItem('fb_access_token');
  const fbPageId = localStorage.getItem('fb_page_id');

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRealSync, setIsRealSync] = useState(!!(fbToken && fbPageId));
  const [loading, setLoading] = useState(!!(fbToken && fbPageId));
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const typingTimeoutRef = useRef(null);
  const chatBodyRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [readMessageIds, setReadMessageIds] = useState(() => JSON.parse(localStorage.getItem('read_message_ids') || '{}'));

  const addEmoji = (emoji) => {
    setReplyText(prev => prev + emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageMessage = {
          id: Date.now(),
          sender: 'me',
          type: 'image',
          imageUrl: event.target.result,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversations(prev => prev.map(c => {
          if (c.id === selectedId) {
            return {
              ...c,
              lastMessage: '📷 Photo attachment',
              time: 'Just now',
              messages: [...c.messages, imageMessage]
            };
          }
          return c;
        }));
        window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: 'Image sent successfully!' }}));
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audioMessage = {
          id: Date.now(),
          sender: 'me',
          type: 'audio',
          audioUrl: audioUrl,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversations(prev => prev.map(c => {
          if (c.id === selectedId) {
            return {
              ...c,
              lastMessage: '🎵 Voice message',
              time: 'Just now',
              messages: [...c.messages, audioMessage]
            };
          }
          return c;
        }));
        window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: 'Voice message sent!' }}));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Could not start audio recording:", err);
      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'error', message: 'Permission to access microphone denied' }}));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };


  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRealConversations = async (showLoadingState = false) => {
    if (!fbToken || !fbPageId) {
      setIsRealSync(false);
      setLoading(false);
      return;
    }

    if (showLoadingState) setLoading(true);
    try {
      // 1. Fetch Facebook Page Conversations
      const fbPromise = fetch(`https://graph.facebook.com/v18.0/${fbPageId}/conversations?fields=senders,messages{message,created_time,from},updated_time&access_token=${fbToken}`).then(r => r.json());

      // 2. Fetch linked Instagram Business Account ID
      const igAccPromise = fetch(`https://graph.facebook.com/v18.0/${fbPageId}?fields=instagram_business_account&access_token=${fbToken}`).then(r => r.json());

      const [fbData, igAccData] = await Promise.all([fbPromise, igAccPromise]);

      let fbList = [];
      let igList = [];

      // Format Facebook conversations
      if (fbData && fbData.data) {
        fbList = fbData.data.map(conv => {
          const senderName = conv.senders?.data?.[0]?.name || 'Anonymous User';
          const msgs = (conv.messages?.data || []).map(m => ({
            id: m.id,
            sender: m.from?.id === fbPageId ? 'me' : 'them',
            text: m.message,
            time: new Date(m.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date(m.created_time).getTime()
          })).reverse();

          const lastMsg = msgs[msgs.length - 1];
          const isOnline = lastMsg && lastMsg.sender === 'them' && (Date.now() - lastMsg.timestamp) < 5 * 60 * 1000;
          const isUnread = lastMsg && lastMsg.sender === 'them' && selectedId !== conv.id && readMessageIds[conv.id] !== lastMsg.id;

          return {
            id: conv.id,
            name: senderName,
            platform: 'facebook',
            avatar: `https://graph.facebook.com/v18.0/${conv.senders?.data?.[0]?.id || ''}/picture?type=square`,
            lastMessage: lastMsg?.text || 'No messages',
            time: new Date(conv.updated_time).toLocaleDateString(),
            unread: isUnread,
            messages: msgs,
            psid: conv.senders?.data?.[0]?.id,
            isOnline: !!isOnline,
            updatedTimeRaw: new Date(conv.updated_time).getTime()
          };
        });
      }

      // 3. Fetch Instagram conversations if business account is linked
      const igBusinessAccountId = igAccData?.instagram_business_account?.id;
      if (igBusinessAccountId) {
        const igRes = await fetch(`https://graph.facebook.com/v18.0/${igBusinessAccountId}/conversations?fields=senders,messages{message,created_time,from},updated_time&access_token=${fbToken}`);
        const igData = await igRes.json();
        
        if (igData && igData.data) {
          igList = igData.data.map(conv => {
            const senderName = conv.senders?.data?.[0]?.username || conv.senders?.data?.[0]?.name || 'Instagram User';
            const msgs = (conv.messages?.data || []).map(m => ({
              id: m.id,
              sender: m.from?.id === igBusinessAccountId ? 'me' : 'them',
              text: m.message,
              time: new Date(m.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date(m.created_time).getTime()
            })).reverse();

            const lastMsg = msgs[msgs.length - 1];
            const isOnline = lastMsg && lastMsg.sender === 'them' && (Date.now() - lastMsg.timestamp) < 5 * 60 * 1000;
            const isUnread = lastMsg && lastMsg.sender === 'them' && selectedId !== conv.id && readMessageIds[conv.id] !== lastMsg.id;

            return {
              id: conv.id,
              name: senderName,
              platform: 'instagram',
              avatar: `https://graph.facebook.com/v18.0/${conv.senders?.data?.[0]?.id || ''}/picture?type=square`,
              lastMessage: lastMsg?.text || 'No messages',
              time: new Date(conv.updated_time).toLocaleDateString(),
              unread: isUnread,
              messages: msgs,
              psid: conv.senders?.data?.[0]?.id,
              isOnline: !!isOnline,
              updatedTimeRaw: new Date(conv.updated_time).getTime()
            };
          });
        }
      }

      // Combine and Sort
      const combined = [...fbList, ...igList].sort((a, b) => b.updatedTimeRaw - a.updatedTimeRaw);
      setConversations(combined);
      setIsRealSync(true);
    } catch (err) {
      console.warn("Failed to load Unified Inbox data:", err);
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  // Poll for new messages every 5 seconds
  useEffect(() => {
    fetchRealConversations(true);
    const interval = setInterval(() => {
      fetchRealConversations(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [fbToken, fbPageId]);

  const currentChat = conversations.find(c => c.id === selectedId);

  // Auto Scroll to bottom on updates
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, otherUserTyping, selectedId]);

  // Mark selected conversation's last message as read and save to localStorage
  useEffect(() => {
    if (selectedId && currentChat) {
      const lastMsg = currentChat.messages[currentChat.messages.length - 1];
      if (lastMsg && readMessageIds[selectedId] !== lastMsg.id) {
        const updatedReadIds = { ...readMessageIds, [selectedId]: lastMsg.id };
        setReadMessageIds(updatedReadIds);
        localStorage.setItem('read_message_ids', JSON.stringify(updatedReadIds));
        
        // Clear unread flag locally
        setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, unread: false } : c));
      }
    }
  }, [selectedId, currentChat?.messages, readMessageIds]);

  // Send Typing Indicator Action to Facebook API
  const sendTypingIndicator = async (isActive) => {
    if (!isRealSync || !currentChat?.psid || !fbToken) return;
    try {
      await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${fbToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: currentChat.psid },
          sender_action: isActive ? 'typing_on' : 'typing_off'
        })
      });
    } catch (err) {
      console.warn("Error sending typing indicator:", err);
    }
  };

  const handleInputChange = (e) => {
    setReplyText(e.target.value);
    
    // Trigger typing indicator on Facebook
    sendTypingIndicator(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);

    if (isRealSync && !String(selectedId).startsWith('demo_')) {
      try {
        const res = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${fbToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: currentChat.psid },
            message: { text: replyText }
          })
        });
        if (res.ok) {
          setReplyText('');
          await fetchRealConversations(false);
          window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: 'Message sent!' }}));
        } else {
          const errData = await res.json();
          throw new Error(errData.error?.message || "Failed to send");
        }
      } catch (err) {
        window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'error', message: err.message }}));
      } finally {
        setSending(false);
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
      setSending(false);

      // Simulate client typing a mock response after 1.5 seconds
      setTimeout(() => {
        setOtherUserTyping(true);
      }, 800);

      setTimeout(() => {
        setOtherUserTyping(false);
        const replyBack = {
          id: Date.now() + 1,
          sender: 'them',
          text: 'Thank you for your reply! Our team will get back to you shortly.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversations(prev => prev.map(c => {
          if (c.id === selectedId) {
            return {
              ...c,
              lastMessage: replyBack.text,
              time: 'Just now',
              messages: [...c.messages, replyBack]
            };
          }
          return c;
        }));
      }, 3000);
    }
  };

  const filteredChats = conversations.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' ? true : c.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', gap: '1rem', minHeight: 0 }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, background: 'var(--panel-bg)', borderRadius: '24px', border: '1px solid var(--panel-border)', overflow: 'hidden', minHeight: 0 }}>
        
        {/* LEFT: Chats List */}
        <div style={{ borderRight: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          {/* Search & Filter Header */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Unified Inbox</h2>
              <select 
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value)}
                style={{ 
                  background: 'rgba(255,255,255,0.06)', 
                  border: '1px solid var(--panel-border)', 
                  borderRadius: '10px', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.78rem', 
                  fontWeight: 600, 
                  padding: '0.4rem 0.75rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all" style={{ background: '#1c1c1e', color: '#fff' }}>All Chats</option>
                <option value="facebook" style={{ background: '#1c1c1e', color: '#fff' }}>Facebook</option>
                <option value="instagram" style={{ background: '#1c1c1e', color: '#fff' }}>Instagram</option>
              </select>
            </div>
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
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minHeight: 0 }}>
            {loading && conversations.length === 0 ? (
              // High fidelity skeleton loader for conversations list
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem', borderRadius: '14px', border: '1px solid transparent', alignItems: 'center', opacity: 0.6 }} className="animate-pulse">
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}></div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ width: '60%', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ width: '90%', height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}></div>
                  </div>
                </div>
              ))
            ) : filteredChats.map(chat => {
              const isSelected = chat.id === selectedId;
              const PlatformIcon = chat.platform === 'facebook' ? FacebookIcon : InstagramIcon;
              const isCurrentTyping = isSelected && otherUserTyping;
              return (
                <div 
                  key={chat.id}
                  onClick={() => {
                    setSelectedId(chat.id);
                    setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c));
                  }}
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
                    {/* Active Now Status Dot */}
                    {chat.isOnline && (
                      <div style={{ position: 'absolute', top: -2, right: -2, width: '10px', height: '10px', background: '#00e676', border: '2px solid var(--bg-dark)', borderRadius: '50%' }}></div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{chat.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{chat.time}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: isCurrentTyping ? 'var(--success)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isCurrentTyping ? 700 : 400 }}>
                      {isCurrentTyping ? 'typing...' : chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread && (
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      background: 'linear-gradient(135deg, #00d2ff, #0084ff)', 
                      borderRadius: '50%', 
                      alignSelf: 'center', 
                      marginLeft: '0.5rem',
                      boxShadow: '0 0 10px rgba(0, 132, 255, 0.8)'
                    }}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Chat Window */}
        {loading && !currentChat ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            {/* Header skeleton */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }} className="animate-pulse">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ width: '100px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                  <div style={{ width: '60px', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
            {/* Messages skeleton */}
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }} className="animate-pulse">
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}><div style={{ width: '220px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><div style={{ width: '180px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}><div style={{ width: '250px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }} /></div>
            </div>
          </div>
        ) : currentChat ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            {/* Chat Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <img src={currentChat.avatar} alt={currentChat.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} />
                  <div style={{ position: 'absolute', top: -1, right: -1, width: '10px', height: '10px', background: currentChat.isOnline ? '#00e676' : '#9e9e9e', border: '2px solid var(--bg-dark)', borderRadius: '50%' }}></div>
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentChat.name}</h4>
                  <span style={{ fontSize: '0.7rem', color: currentChat.isOnline ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                    {currentChat.isOnline ? 'Active now' : 'Offline'} • {currentChat.platform.toUpperCase()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ padding: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Star size={18} /></button>
                <button style={{ padding: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Info size={18} /></button>
              </div>
            </div>

            {/* Messages Body */}
            <div 
              ref={chatBodyRef}
              style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}
            >
              {loading && currentChat.messages.length === 0 ? (
                // Messages loading skeleton
                Array.from({ length: 3 }).map((_, idx) => {
                  const isMe = idx % 2 === 0;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }} className="animate-pulse">
                      <div style={{
                        maxWidth: '50%', width: '180px', height: '60px', borderRadius: '16px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--panel-border)',
                      }} />
                    </div>
                  );
                })
              ) : currentChat.messages.map(m => {
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
                      {m.type === 'image' ? (
                        <img src={m.imageUrl} alt="Uploaded attachment" style={{ maxWidth: '100%', borderRadius: '12px', display: 'block', maxHeight: '200px' }} />
                      ) : m.type === 'audio' ? (
                        <audio controls src={m.audioUrl} style={{ width: '200px', display: 'block', outline: 'none' }} />
                      ) : (
                        <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{m.text}</div>
                      )}
                      <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: '0.25rem', opacity: 0.7 }}>{m.time}</div>
                    </div>
                  </div>
                );
              })}

              {/* Bouncing Dots Typing Loader Bubble */}
              {otherUserTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    padding: '0.85rem 1.1rem', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <motion.div style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%' }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0 }} />
                    <motion.div style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%' }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.15 }} />
                    <motion.div style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%' }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.3 }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0, position: 'relative' }}>
              
              {/* Emojis Overlay Popup */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{ position: 'absolute', bottom: '100%', right: '10px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                  >
                    <EmojiPicker 
                      onEmojiClick={(emojiData) => addEmoji(emojiData.emoji)} 
                      theme="dark" 
                      lazyLoadEmojis={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Utility Bar & Input controls */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
                
                {/* Audio/Mic Button */}
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isRecording ? 'red' : '#1877F2' }}
                >
                  <Mic size={20} style={{ transform: isRecording ? 'scale(1.2)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {/* Image Select Button */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877F2' }}
                >
                  <ImageIcon size={20} />
                </button>

                {/* Input Text Box with internal Smiley Picker */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '0.4rem 1rem', border: '1px solid var(--panel-border)' }}>
                  <input 
                    type="text" 
                    placeholder={isRecording ? "Recording audio message... Click Mic again to send" : "Aa"}
                    value={replyText}
                    onChange={handleInputChange}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    disabled={isRecording}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: isRecording ? 'red' : 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
                  />
                  <button 
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1877F2', display: 'flex', alignItems: 'center' }}
                  >
                    <Smile size={18} />
                  </button>
                </div>

                {/* Send Button */}
                <button 
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  style={{ 
                    background: 'none', border: 'none', cursor: replyText.trim() ? 'pointer' : 'default', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: replyText.trim() ? '#1877F2' : 'var(--text-secondary)',
                    transition: 'color 0.2s'
                  }}
                >
                  {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
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
