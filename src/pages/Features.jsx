import React from 'react';
import { Link } from 'react-router-dom';

const Features = () => {
  const features = [
    {
      id: 1,
      title: 'Daily Stress Tracking',
      description: 'Log your daily workload, tasks, and stress levels to identify patterns and triggers.',
      icon: '📊',
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
      link: '/stress-tracking'
    },
    {
      id: 2,
      title: 'Stress Score Analysis',
      description: 'Get personalized stress scores and understand your mental wellness patterns over time.',
      icon: '🧠',
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
      link: '/stress-score'
    },
    {
      id: 3,
      title: 'AI Wellness Assistant',
      description: 'Chat with our AI assistant for instant support, tips, and stress management techniques.',
      icon: '🤖',
      color: 'bg-green-100',
      textColor: 'text-green-600',
      link: '/ai-chat'
    },
    {
      id: 4,
      title: 'Professional Consultants',
      description: 'Connect with qualified mental health professionals for personalized support and guidance.',
      icon: '👨‍⚕️',
      color: 'bg-orange-100',
      textColor: 'text-orange-600',
      link: '/consultants'
    },
    {
      id: 5,
      title: 'Workload Management',
      description: 'Track and manage your daily tasks, set priorities, and maintain work-life balance.',
      icon: '📝',
      color: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      link: '/stress-tracking'
    },
    {
      id: 6,
      title: 'Progress Analytics',
      description: 'View detailed analytics and trends to understand your mental wellness journey.',
      icon: '📈',
      color: 'bg-pink-100',
      textColor: 'text-pink-600',
      link: '/stress-score'
    }
  ];

  const benefits = [
    {
      title: 'Proactive Stress Management',
      description: 'Identify stress triggers early and take preventive measures before they escalate.',
      icon: '🛡️'
    },
    {
      title: 'Personalized Support',
      description: 'Get tailored recommendations based on your unique stress patterns and lifestyle.',
      icon: '🎯'
    },
    {
      title: 'Professional Guidance',
      description: 'Access qualified mental health professionals when you need expert support.',
      icon: '👨‍⚕️'
    },
    {
      title: 'Data-Driven Insights',
      description: 'Understand your mental wellness through comprehensive analytics and tracking.',
      icon: '📊'
    },
    {
      title: '24/7 AI Support',
      description: 'Get instant help and guidance anytime, anywhere through our AI assistant.',
      icon: '🤖'
    },
    {
      title: 'Work-Life Balance',
      description: 'Maintain healthy boundaries and achieve better work-life integration.',
      icon: '⚖️'
    }
  ];

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#212121] mb-4">Platform Features</h1>
          <p className="text-xl text-[#4F4F4F] max-w-3xl mx-auto">
            Comprehensive tools and resources designed to support your mental wellness and help you manage stress effectively.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center text-2xl`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#212121]">{feature.title}</h3>
              </div>
              <p className="text-[#4F4F4F] mb-4">{feature.description}</p>
              <Link 
                to={feature.link}
                className={`inline-flex items-center ${feature.textColor} hover:underline`}
              >
                Learn more →
              </Link>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-3xl font-bold text-[#212121] text-center mb-8">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-lg">{benefit.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#212121] mb-1">{benefit.title}</h3>
                  <p className="text-sm text-[#4F4F4F]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-3xl font-bold text-[#212121] text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-[#212121] mb-2">Track Your Activities</h3>
              <p className="text-[#4F4F4F]">Log your daily workload, stress levels, and activities to build a comprehensive picture of your mental wellness.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-[#212121] mb-2">Get Insights</h3>
              <p className="text-[#4F4F4F]">Receive personalized analysis and recommendations based on your data and stress patterns.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-[#212121] mb-2">Take Action</h3>
              <p className="text-[#4F4F4F]">Implement recommended strategies and connect with professionals for ongoing support.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Wellness Journey?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of users who have improved their mental wellness with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </Link>
            <Link 
              to="/dashboard"
              className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Explore Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features; 