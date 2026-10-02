import React, { useState, useRef, useEffect, useContext } from 'react';
import { aiService } from '../services';
import { useTranslation } from '../hooks/useTranslation';
import { AuthContext } from '../store/authStore';

const ChatWidget = () => {
  const { lang } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: lang === 'hi'
        ? 'नमस्ते! मैं रूरलकनेक्ट एआई सहायक हूँ। आप मुझसे स्थानीय व्यापार, थोक व खुदरा सामान, या नजदीकी नौकरियों के बारे में कुछ भी पूछ सकते हैं!'
        : 'Hello! I am your RuralConnect AI Assistant. Ask me about rural businesses, local jobs, wholesale prices, or platform help!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    if (!isAuthenticated) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: textToSend },
        { role: 'assistant', content: lang === 'hi' ? 'कृपया एआई चैट का उपयोग करने के लिए पहले लॉग इन करें।' : 'Please log in first to chat with the AI assistant.' }
      ]);
      setInput('');
      return;
    }

    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat({
        message: textToSend,
        conversationId,
        language: lang
      });

      const data = res.data.data;
      if (data.conversationId) setConversationId(data.conversationId);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          groundingData: data.groundingData
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: lang === 'hi' ? 'क्षमा करें, प्रतिक्रिया प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Sorry, failed to get a response. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = lang === 'hi' ? [
    '20000 रुपये में कौन सा बिज़नेस शुरू करूँ?',
    'मेरे पास की नौकरियां दिखाओ',
    'चावल और गेहूं के थोक भाव क्या हैं?'
  ] : [
    'What business can I start with ₹20,000?',
    'Show me nearby jobs',
    'What are wholesale grain prices?'
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        className="chat-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>🤖</span>
        <span>{lang === 'hi' ? 'एआई सहायक' : 'AI Assistant'}</span>
      </button>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="chat-modal-window">
          {/* Header */}
          <div
            style={{
              background: '#2E7D32',
              color: '#fff',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>🌾 RuralConnect AI</h3>
              <small style={{ opacity: 0.85 }}>{lang === 'hi' ? 'हिंदी और अंग्रेजी में सक्रिय' : 'Hindi & English ready'}</small>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.3rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? '#2E7D32' : '#f0f4f1',
                  color: m.role === 'user' ? '#fff' : '#222',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.92rem',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.content}

                {/* Grounded items preview if available */}
                {m.groundingData && m.groundingData.items && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #ccc', fontSize: '0.82rem' }}>
                    <strong>{lang === 'hi' ? '📌 उपलब्ध विकल्प:' : '📌 Available on Platform:'}</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {m.groundingData.items.slice(0, 3).map((item, i) => (
                        <li key={i}>{item.name || item.title} {item.price ? `(₹${item.price})` : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: '#f0f4f1', padding: '8px 14px', borderRadius: '12px', fontSize: '0.85rem', color: '#666' }}>
                ✍️ {lang === 'hi' ? 'एआई सोच रहा है...' : 'AI is thinking...'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '6px 12px', background: '#fafafa', borderTop: '1px solid #eee', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp)}
                style={{
                  whiteSpace: 'nowrap',
                  background: '#fff',
                  border: '1px solid #2E7D32',
                  color: '#2E7D32',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', padding: '10px', background: '#fff', borderTop: '1px solid #eee' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'hi' ? 'हिंदी या English में पूछें...' : 'Ask in Hindi or English...'}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: '1px solid #ccc',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                marginLeft: '8px',
                background: '#2E7D32',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                opacity: loading || !input.trim() ? 0.6 : 1
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
