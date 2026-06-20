import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, MessageSquare, Send, Calendar, Globe } from 'lucide-react';
import { dbService } from '../services/db';

export default function ApprovalPortal() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending'); // pending, approved, changes_requested
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const posts = await dbService.getPosts();
        const found = posts.find(p => String(p.id) === String(postId));
        if (found) {
          setPost(found);
          setStatus(found.approvalStatus || 'pending');
          setComments(found.approvalComments || []);
        }
      } catch (err) {
        console.error("Error fetching post for approval", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const updatePostApproval = async (newStatus) => {
    try {
      const posts = await dbService.getPosts();
      const idx = posts.findIndex(p => String(p.id) === String(postId));
      if (idx !== -1) {
        posts[idx].approvalStatus = newStatus;
        posts[idx].approvalComments = comments;
        localStorage.setItem('postHistory', JSON.stringify(posts));
        setStatus(newStatus);
        
        window.dispatchEvent(new CustomEvent('show-notification', {
          detail: { 
            type: 'success', 
            message: `Post marked as ${newStatus.replace('_', ' ')}!` 
          }
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      id: Date.now(),
      author: 'Client (Reviewer)',
      text: commentInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [...comments, newComment];
    setComments(updated);
    setCommentInput('');

    // Save to local storage
    dbService.getPosts().then(posts => {
      const idx = posts.findIndex(p => String(p.id) === String(postId));
      if (idx !== -1) {
        posts[idx].approvalComments = updated;
        localStorage.setItem('postHistory', JSON.stringify(posts));
      }
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
        <h3>Loading Review Portal...</h3>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-primary)', gap: '1rem' }}>
        <XCircle size={48} color="var(--error)" />
        <h3>Draft Post not found.</h3>
        <p style={{ color: 'var(--text-secondary)' }}>It might have been deleted or published already.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-primary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-blue)', fontWeight: 700, letterSpacing: '1px' }}>Sharevix Approval Hub</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>Review Post Draft</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ 
              padding: '0.4rem 0.8rem', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: 700,
              background: status === 'approved' ? 'rgba(76, 175, 80, 0.1)' : status === 'changes_requested' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
              color: status === 'approved' ? 'var(--success)' : status === 'changes_requested' ? 'var(--error)' : 'orange',
              border: `1px solid ${status === 'approved' ? 'var(--success)' : status === 'changes_requested' ? 'var(--error)' : 'orange'}`
            }}>
              {status.toUpperCase().replace('_', ' ')}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} className="composer-grid">
          
          {/* LEFT: Draft Details */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Post Content</h3>
            
            {post.media && post.media.length > 0 && (
              <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)', maxHeight: '300px' }}>
                {post.media[0].type?.startsWith('video') ? (
                  <video src={post.media[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                ) : (
                  <img src={post.media[0].url} alt="Review attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--panel-border)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {post.content}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} /> Scheduled for: {post.date ? new Date(post.date).toLocaleString() : 'Not Scheduled'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={14} /> Platforms: {post.platforms?.join(', ').toUpperCase()}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={() => updatePostApproval('changes_requested')} 
                style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(244, 67, 54, 0.08)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <XCircle size={18} /> Request Changes
              </button>
              <button 
                onClick={() => updatePostApproval('approved')} 
                style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--btn-primary-bg)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <CheckCircle2 size={18} /> Approve Post
              </button>
            </div>
          </div>

          {/* RIGHT: Collaboration & Comments */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} /> Comments & Feedback
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {comments.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                  No comments yet. Leave some feedback for the designer.
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{c.author}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{c.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{c.text}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Type your feedback here..." 
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button 
                onClick={handleAddComment}
                style={{ padding: '0.75rem', background: 'var(--btn-primary-bg)', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
