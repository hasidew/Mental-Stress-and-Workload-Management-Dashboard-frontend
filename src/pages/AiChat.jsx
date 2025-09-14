import React, { useState, useEffect, useRef } from 'react';
import { validationRules, validateForm } from '../utils/validation';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/api';
import { parseBoldText } from '../utils/textFormatting.jsx';

const AiChat = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI wellness assistant. I'm here to help you with **stress management**, **workload balance**, and mental wellness tips. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Colombo'
      })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const inputRef = useRef(null);

  // Validation schema for AiChat form
  const validationSchema = {
    inputMessage: [validationRules.required, validationRules.textLength]
  };

  // Scroll to bottom of chat messages container only
  const scrollToBottom = () => {
    const container = document.getElementById('chat-messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length]);

  // Load chat sessions on component mount
  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  // Load chat sessions
  const loadChatSessions = async () => {
    try {
      const sessions = await apiService.getChatSessions();
      setChatSessions(sessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  // Load messages for a specific session
  const loadSessionMessages = async (sessionId) => {
    try {
      const messagesData = await apiService.getChatMessages(sessionId);
      const formattedMessages = messagesData.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Asia/Colombo'
        })
      }));
      setMessages(formattedMessages);
      setSelectedSession(sessionId);
    } catch (error) {
      console.error('Error loading session messages:', error);
    }
  };

  // Start new chat
  const startNewChat = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hello! I'm your AI wellness assistant. I'm here to help you with **stress management**, **workload balance**, and mental wellness tips. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Asia/Colombo'
        })
      }
    ]);
    setSessionId(null);
    setSelectedSession(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Validate message
    const formErrors = validateForm({ inputMessage }, validationSchema);
    setErrors(formErrors);
    setTouched({ inputMessage: true });
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Colombo'
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const data = await apiService.sendChatMessage(inputMessage, sessionId);
      setSessionId(data.session_id);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        timestamp: new Date().toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Asia/Colombo'
        })
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Reload chat sessions to show the new one
      loadChatSessions();
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsTyping(false);
      // Focus back to input field after sending message
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage(e);
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  const quickReplies = [
    "I'm feeling stressed",
    "Help with workload management",
    "Sleep problems",
    "Exercise recommendations",
    "Need professional help"
  ];

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#212121]">AI Wellness Assistant</h1>
            <Link to="/dashboard" className="text-[#212121] hover:text-blue-600">
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-[#4F4F4F]">Chat with your AI assistant for personalized mental wellness support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Sessions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#212121]">Chat History</h3>
                <button
                  onClick={startNewChat}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  New Chat
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {chatSessions.length === 0 ? (
                  <p className="text-[#4F4F4F] text-sm text-center py-4">No previous chats</p>
                ) : (
                  chatSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadSessionMessages(session.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSession === session.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-sm text-[#212121] font-medium truncate">
                        Chat {new Date(session.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-[#4F4F4F]">
                        {session.message_count} messages
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">AI Wellness Assistant</h2>
                    <p className="text-blue-100 text-sm">Online • Ready to help</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 relative" id="chat-messages-container">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-[#212121]'} rounded-lg p-3`}>
                      <div className="whitespace-pre-line">{parseBoldText(message.content)}</div>
                      <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-[#4F4F4F]'}`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Replies */}
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-[#4F4F4F] mb-3">Quick replies:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-[#212121] hover:bg-gray-50 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
                  <div className="flex space-x-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        // Clear error when user starts typing
                        if (errors.inputMessage) {
                          setErrors(prev => ({ ...prev, inputMessage: null }));
                        }
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, inputMessage: true }))}
                      placeholder="Type your message..."
                      className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                        touched.inputMessage && errors.inputMessage 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                  </div>
                  {touched.inputMessage && errors.inputMessage && (
                    <p className="text-red-500 text-sm">{errors.inputMessage}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-[#212121] mb-4">💡 How I can help you</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#4F4F4F]">
            <div>
              <p className="font-medium mb-2">• Stress management techniques</p>
              <p className="font-medium mb-2">• Workload prioritization</p>
              <p className="font-medium mb-2">• Sleep improvement tips</p>
            </div>
            <div>
              <p className="font-medium mb-2">• Exercise recommendations</p>
              <p className="font-medium mb-2">• Mindfulness exercises</p>
              <p className="font-medium mb-2">• Professional support guidance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChat; 