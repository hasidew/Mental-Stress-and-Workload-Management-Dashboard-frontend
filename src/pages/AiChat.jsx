import React, { useState } from 'react';
import { validationRules, validateForm } from '../utils/validation';
import { Link } from 'react-router-dom';

const AiChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI wellness assistant. I'm here to help you with stress management, workload balance, and mental wellness tips. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation schema for AiChat form
  const validationSchema = {
    inputMessage: [validationRules.required, validationRules.textLength]
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
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('stress') || input.includes('anxiety')) {
      return "I understand you're feeling stressed. Here are some quick techniques:\n\n1. Take 5 deep breaths - inhale for 4 counts, hold for 4, exhale for 6\n2. Try the 5-4-3-2-1 grounding technique\n3. Take a 5-minute walk\n4. Listen to calming music\n\nWould you like me to guide you through any of these techniques?";
    }
    
    if (input.includes('workload') || input.includes('overwhelm')) {
      return "Managing workload can be challenging. Here are some strategies:\n\n1. Prioritize tasks using the Eisenhower Matrix\n2. Break large tasks into smaller, manageable chunks\n3. Set realistic daily goals\n4. Learn to say 'no' when necessary\n5. Schedule regular breaks\n\nWould you like help creating a task prioritization system?";
    }
    
    if (input.includes('sleep') || input.includes('insomnia')) {
      return "Good sleep is crucial for mental wellness. Try these tips:\n\n1. Maintain a consistent sleep schedule\n2. Create a relaxing bedtime routine\n3. Avoid screens 1 hour before bed\n4. Keep your bedroom cool and dark\n5. Practice relaxation techniques\n\nAre you having trouble falling asleep or staying asleep?";
    }
    
    if (input.includes('exercise') || input.includes('physical')) {
      return "Physical activity is excellent for stress relief! Here are some options:\n\n1. 10-minute desk stretches\n2. Walking meetings\n3. Quick home workouts\n4. Yoga or meditation\n5. Dancing to your favorite music\n\nEven 10 minutes of movement can make a difference. What type of exercise interests you?";
    }
    
    if (input.includes('help') || input.includes('support')) {
      return "I'm here to support you! Here are some resources:\n\n1. Contact a mental health consultant through our platform\n2. Use our stress tracking tools\n3. Practice mindfulness exercises\n4. Connect with colleagues for support\n5. Consider professional counseling\n\nWhat specific area would you like help with?";
    }
    
    return "Thank you for sharing that with me. I'm here to help with stress management, workload balance, sleep issues, exercise recommendations, and general mental wellness support. What would you like to focus on today?";
  };

  const quickReplies = [
    "I'm feeling stressed",
    "Help with workload management",
    "Sleep problems",
    "Exercise recommendations",
    "Need professional help"
  ];

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
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
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-[#212121]'} rounded-lg p-3`}>
                  <p className="whitespace-pre-line">{message.content}</p>
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