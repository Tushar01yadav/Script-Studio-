'use client';
import { useState, useRef, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function preprocessContent(content: string) {
  // Break inline lists onto new lines so they render properly
  return content.replace(/\s+(\d+\.\s+(?:\*\*|[A-Za-z]))/g, '\n$1');
}

function formatMessage(content: string) {
  const processed = preprocessContent(content);
  const lines = processed.split('\n');
  
  const parseBoldItalic = (text: string) => {
    // Escape simple HTML characters first to prevent XSS
    let parsed = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Bold: replace **text** with <strong>text</strong>
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: replace *text* with <em>text</em>
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
  };

  return (
    <div className="formatted-msg-container">
      {lines.map((line, index) => {
        const cleanLine = line.trim();
        if (!cleanLine) {
          return <div key={index} style={{ height: '8px' }} />;
        }

        // Bullet point lists
        if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
          return (
            <li key={index} style={{ marginLeft: '16px', listStyleType: 'disc', margin: '4px 0' }}>
              {parseBoldItalic(cleanLine.substring(2))}
            </li>
          );
        }

        // Numbered lists
        const numMatch = cleanLine.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={index} style={{ display: 'flex', gap: '6px', margin: '6px 0', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-color)', minWidth: '18px' }}>{numMatch[1]}.</span>
              <span>{parseBoldItalic(numMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={index} style={{ margin: '4px 0', lineHeight: '1.5' }}>
            {parseBoldItalic(cleanLine)}
          </p>
        );
      })}
    </div>
  );
}

interface Conversation {
  id: string;
  name: string;
  messages: { role: string; content: string }[];
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 'conv_default', name: 'Active Session', messages: [] }
  ]);
  const [activeId, setActiveId] = useState<string>('conv_default');
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId] = useState('user1'); 
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  useEffect(() => {
    const savedConvs = localStorage.getItem('mindstore_convs');
    const savedActiveId = localStorage.getItem('mindstore_active_id');
    if (savedConvs) {
      try {
        setConversations(JSON.parse(savedConvs));
      } catch (e) {
        console.error('Error loading conversations', e);
      }
    }
    if (savedActiveId) {
      setActiveId(savedActiveId);
    }
    setIsLoaded(true);
  }, []);

  const createNewChat = () => {
    const newId = `conv_${Date.now()}`;
    const newConv = {
      id: newId,
      name: 'New Chat',
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newId);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = conversations.filter(c => c.id !== id);
    if (remaining.length === 0) {
      const defaultId = 'conv_default';
      setConversations([{ id: defaultId, name: 'Active Session', messages: [] }]);
      setActiveId(defaultId);
    } else {
      setConversations(remaining);
      if (activeId === id) {
        setActiveId(remaining[0].id);
      }
    }
  };

  const startEditing = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const saveEditing = (id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim() || c.name } : c));
    setEditingId(null);
  };

  // Save to localStorage on updates
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mindstore_convs', JSON.stringify(conversations));
    }
  }, [conversations, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mindstore_active_id', activeId);
    }
  }, [activeId, isLoaded]);

  const activeConversation = conversations.find(c => c.id === activeId) || conversations[0] || { id: 'conv_default', name: 'Active Session', messages: [] };
  const chat = activeConversation.messages;

  // Scroll to bottom whenever chat updates or loading state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isLoading]);


  const sendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || message;
    if (!textToSend.trim() || isLoading) return;
    
    if (!customMessage) setMessage('');
    
    // Optimistically add user message and potentially update session name
    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        const newMessages = [...c.messages, { role: 'user', content: textToSend }];
        const name = (c.name === 'Active Session' || c.name === 'New Chat' || c.messages.length === 0)
          ? (textToSend.length > 25 ? textToSend.substring(0, 25) + '...' : textToSend)
          : c.name;
        return { ...c, name, messages: newMessages };
      }
      return c;
    }));
    
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, conversation_id: activeId, message: textToSend})
      });

      if (!res.ok) {
        let errMsg = `API error: ${res.statusText}`;
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            errMsg = errData.detail;
          } else if (errData && errData.response) {
            errMsg = errData.response;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      setConversations(prev => prev.map(c => {
        if (c.id === activeId) {
          return { ...c, messages: [...c.messages, { role: 'assistant', content: data.response }] };
        }
        return c;
      }));
    } catch (err: any) {
      console.error('Chat error:', err);
      setConversations(prev => prev.map(c => {
        if (c.id === activeId) {
          return { ...c, messages: [...c.messages, { role: 'assistant', content: err.message || 'Error: Could not connect to backend.' }] };
        }
        return c;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        return { ...c, name: 'Active Session', messages: [] };
      }
      return c;
    }));
  };

  const suggestions = [
    { text: "What did I mention about my project plans?", icon: "📅" },
    { text: "Recall my favorite coffee recipe and details", icon: "☕" },
    { text: "What are my goals for the upcoming quarter?", icon: "🎯" },
    { text: "Summarize the personal preferences I shared", icon: "🧠" }
  ];

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">🧠</span>
            <div className="logo-text">
              <h3>MindStore</h3>
              <span className="status-badge"><span className="pulse-dot"></span>Active Memory</span>
            </div>
          </div>
        </div>

        <div className="sidebar-content" style={{ overflowY: 'auto' }}>
          {/* New Chat Button above conversations */}
          <button className="new-chat-btn" onClick={createNewChat} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px',
            background: 'var(--accent-gradient)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '13.5px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}>
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Chat
          </button>

          <div className="section-title">Conversations</div>
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                className={`conv-item ${activeId === conv.id ? 'active' : ''}`}
                onClick={() => setActiveId(conv.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer', position: 'relative' }}
              >
                {editingId === conv.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                    <input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing(conv.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '4px',
                        color: 'white',
                        padding: '4px 6px',
                        fontSize: '12.5px',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                    <button onClick={() => saveEditing(conv.id)} style={{ background: 'transparent', border: 'none', color: '#34d399', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>✓</button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>&times;</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.name}</span>
                    </div>
                    
                    <div className="action-buttons" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span 
                        onClick={(e) => startEditing(conv.id, conv.name, e)}
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Edit name"
                      >
                        <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </span>

                      {conversations.length > 1 && (
                        <span 
                          onClick={(e) => deleteConversation(conv.id, e)} 
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          title="Delete chat"
                        >
                          <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">U</div>
            <div className="user-info">
              <div className="username">User One</div>
              <div className="userid">{userId}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="main-chat">
        <header className="chat-header">
          <div className="chat-title-area">
            <h2>Memory Companion</h2>
            <p>Personalized context retrieval active</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* New Chat Button in topbar */}
            <button onClick={createNewChat} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>

            <div className="connection-pill">
              <span className="dot"></span>
              Connected
            </div>
          </div>
        </header>

        <div className="chat-history">
          {chat.length === 0 ? (
            <div className="welcome-container">
              <div className="welcome-hero">
                <div className="welcome-avatar">🤖</div>
                <h1>Welcome to MindStore</h1>
                <p>I store memories, preferences, and conversations to assist you dynamically. Try asking one of the examples below:</p>
              </div>

              <div className="suggestions-grid">
                {suggestions.map((s, idx) => (
                  <button 
                    key={idx} 
                    className="suggestion-card" 
                    onClick={() => sendMessage(s.text)}
                  >
                    <span className="card-icon">{s.icon}</span>
                    <span className="card-text">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chat.map((m, i) => (
                <div key={i} className={`message-wrapper ${m.role === 'user' ? 'user-wrapper' : 'assistant-wrapper'}`}>
                  {m.role !== 'user' && <div className="message-avatar">🤖</div>}
                  <div className={`message ${m.role}`}>
                    {formatMessage(m.content)}
                  </div>
                  {m.role === 'user' && <div className="message-avatar user-avatar">U</div>}
                </div>
              ))}
              
              {isLoading && (
                <div className="message-wrapper assistant-wrapper">
                  <div className="message-avatar">🤖</div>
                  <div className="message assistant typing-container">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        <footer className="input-area-container">
          <div className="input-box-wrapper">
            <input 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Type a message or share a memory..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
            />
            <button 
              className={`send-button ${message.trim() ? 'active' : ''}`} 
              onClick={() => sendMessage()}
              disabled={isLoading || !message.trim()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

