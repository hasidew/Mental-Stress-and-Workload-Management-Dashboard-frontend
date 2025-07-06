import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Mental Health Officer',
      image: '👩‍⚕️',
      bio: 'Leading clinical psychologist with 15+ years experience in workplace mental health.'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Technology',
      image: '👨‍💻',
      bio: 'Expert in AI and mental health technology with focus on accessible wellness solutions.'
    },
    {
      name: 'Emma Rodriguez',
      role: 'User Experience Director',
      image: '👩‍🎨',
      bio: 'Specialist in creating intuitive, supportive digital experiences for mental wellness.'
    },
    {
      name: 'Dr. James Wilson',
      role: 'Research Director',
      image: '👨‍🔬',
      bio: 'Leading research on workplace stress patterns and effective intervention strategies.'
    }
  ];

  const values = [
    {
      title: 'Privacy & Confidentiality',
      description: 'Your mental health data is protected with the highest security standards.',
      icon: '🔒'
    },
    {
      title: 'Evidence-Based Approach',
      description: 'All recommendations are based on scientific research and clinical expertise.',
      icon: '📚'
    },
    {
      title: 'Accessibility',
      description: 'Making mental health support available to everyone, regardless of background.',
      icon: '♿'
    },
    {
      title: 'Continuous Improvement',
      description: 'Constantly evolving our platform based on user feedback and research.',
      icon: '🔄'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '50+', label: 'Mental Health Professionals' },
    { number: '95%', label: 'User Satisfaction' },
    { number: '24/7', label: 'AI Support Available' }
  ];

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#212121] mb-4">About Our Platform</h1>
          <p className="text-xl text-[#4F4F4F] max-w-3xl mx-auto">
            We're dedicated to revolutionizing mental wellness in the workplace through innovative technology and compassionate care.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#212121] mb-4">Our Mission</h2>
              <p className="text-[#4F4F4F] mb-4">
                To create a world where mental wellness is prioritized, accessible, and supported in every workplace. 
                We believe that healthy minds lead to productive, fulfilling lives and successful organizations.
              </p>
              <p className="text-[#4F4F4F] mb-6">
                Our platform combines cutting-edge AI technology with human expertise to provide personalized 
                mental health support that adapts to your unique needs and circumstances.
              </p>
              <Link 
                to="/features"
                className="bg-[#212121] text-white px-6 py-3 rounded-full hover:bg-[#333] transition-colors inline-block"
              >
                Explore Our Features
              </Link>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-4xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-[#212121] mb-2">Mental Wellness First</h3>
              <p className="text-[#4F4F4F]">Supporting your journey to better mental health</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-[#212121] mb-2">{stat.number}</div>
              <div className="text-[#4F4F4F]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-3xl font-bold text-[#212121] text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xl">{value.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#212121] mb-2">{value.title}</h3>
                  <p className="text-[#4F4F4F]">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-3xl font-bold text-[#212121] text-center mb-8">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  {member.image}
                </div>
                <h3 className="font-semibold text-[#212121] mb-1">{member.name}</h3>
                <p className="text-blue-600 text-sm mb-2">{member.role}</p>
                <p className="text-xs text-[#4F4F4F]">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-3xl font-bold text-[#212121] text-center mb-8">Our Story</h2>
          <div className="max-w-4xl mx-auto text-[#4F4F4F] space-y-4">
            <p>
              Founded in 2023, our platform emerged from a simple observation: workplace stress was reaching 
              unprecedented levels, yet accessible mental health support remained limited. Our team of mental 
              health professionals, technologists, and researchers came together with a shared vision.
            </p>
            <p>
              We recognized that traditional mental health services, while valuable, often had barriers to access 
              - cost, stigma, scheduling conflicts, and geographical limitations. We set out to create a solution 
              that would bridge these gaps.
            </p>
            <p>
              Today, our platform serves thousands of users across various industries, helping them track their 
              mental wellness, manage stress effectively, and access professional support when needed. We continue 
              to evolve based on user feedback and the latest research in mental health technology.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-xl mb-6 opacity-90">
            Be part of the movement to prioritize mental wellness in the workplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              to="/contact"
              className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 