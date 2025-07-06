import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  const features = [
    {
      icon: '📊',
      title: 'Track Your Stress',
      description: 'Log Daily Workload',
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
      link: '/stress-tracking'
    },
    {
      icon: '🧠',
      title: 'Understand Stress Score',
      description: 'Enter Daily Tasks',
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
      link: '/stress-score'
    },
    {
      icon: '🤖',
      title: 'Chat with AI Assistant',
      description: 'Get tips & support',
      color: 'bg-green-100',
      textColor: 'text-green-600',
      link: '/ai-chat'
    },
    {
      icon: '👨‍⚕️',
      title: 'Contact Consultant',
      description: 'View & message experts',
      color: 'bg-orange-100',
      textColor: 'text-orange-600',
      link: '/consultants'
    }
  ]

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto mt-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#212121] mb-4">Welcome to the</h1>
          <h2 className="text-3xl font-semibold text-[#212121] mb-6">
            Mental Stress & Workload Management Dashboard
          </h2>
          <p className="text-xl text-[#4F4F4F] max-w-3xl mx-auto">
            This system is designed to support your mental well-being and productivity.
            It helps employees and organizations manage workload stress through simple
            tools for logging, feedback, and expert support.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center text-2xl`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#212121]">{feature.title}</h3>
              </div>
              <p className="text-[#4F4F4F] mb-4">{feature.description}</p>
              <span className={`inline-flex items-center ${feature.textColor} hover:underline`}>
                Learn more →
              </span>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Get Started Now</h3>
          <p className="text-xl mb-6 opacity-90">
            Choose your role and begin your journey toward better mental wellness and workload balance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signin"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
