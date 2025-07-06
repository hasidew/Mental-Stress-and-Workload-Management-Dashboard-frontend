import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Consultants = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const consultants = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Clinical Psychologist',
      category: 'psychologist',
      experience: '15 years',
      rating: 4.9,
      availability: 'Available',
      image: '👩‍⚕️',
      description: 'Specializes in workplace stress, anxiety, and burnout management. Offers both individual and group therapy sessions.',
      languages: ['English', 'Spanish'],
      consultationFee: 'LKR 15,000/hour',
      nextAvailable: 'Today, 2:00 PM'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Psychiatrist',
      category: 'psychiatrist',
      experience: '12 years',
      rating: 4.8,
      availability: 'Available',
      image: '👨‍⚕️',
      description: 'Expert in mental health medication management and treatment for depression, anxiety, and stress-related disorders.',
      languages: ['English', 'Mandarin'],
      consultationFee: 'LKR 20,000/hour',
      nextAvailable: 'Tomorrow, 10:00 AM'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      specialization: 'Licensed Counselor',
      category: 'counselor',
      experience: '8 years',
      rating: 4.7,
      availability: 'Available',
      image: '👩‍💼',
      description: 'Specializes in work-life balance, career counseling, and stress management techniques.',
      languages: ['English', 'Spanish'],
      consultationFee: 'LKR 12,000/hour',
      nextAvailable: 'Today, 4:00 PM'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialization: 'Occupational Therapist',
      category: 'therapist',
      experience: '10 years',
      rating: 4.6,
      availability: 'Available',
      image: '👨‍💼',
      description: 'Focuses on workplace ergonomics, stress prevention, and creating healthy work environments.',
      languages: ['English'],
      consultationFee: 'LKR 13,000/hour',
      nextAvailable: 'Wednesday, 1:00 PM'
    },
    {
      id: 5,
      name: 'Dr. Lisa Park',
      specialization: 'Mindfulness Coach',
      category: 'coach',
      experience: '6 years',
      rating: 4.9,
      availability: 'Available',
      image: '🧘‍♀️',
      description: 'Certified mindfulness instructor helping with meditation, stress reduction, and mental wellness.',
      languages: ['English', 'Korean'],
      consultationFee: 'LKR 10,000/hour',
      nextAvailable: 'Today, 6:00 PM'
    },
    {
      id: 6,
      name: 'Dr. Robert Thompson',
      specialization: 'Workplace Wellness Specialist',
      category: 'specialist',
      experience: '18 years',
      rating: 4.8,
      availability: 'Available',
      image: '👨‍🔬',
      description: 'Expert in organizational psychology and creating healthy workplace cultures.',
      languages: ['English'],
      consultationFee: 'LKR 18,000/hour',
      nextAvailable: 'Thursday, 3:00 PM'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Specialists' },
    { id: 'psychologist', name: 'Psychologists' },
    { id: 'psychiatrist', name: 'Psychiatrists' },
    { id: 'counselor', name: 'Counselors' },
    { id: 'therapist', name: 'Therapists' },
    { id: 'coach', name: 'Wellness Coaches' },
    { id: 'specialist', name: 'Specialists' }
  ];

  const filteredConsultants = consultants.filter(consultant => {
    const matchesCategory = selectedCategory === 'all' || consultant.category === selectedCategory;
    const matchesSearch = consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultant.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContact = (consultant) => {
    console.log('Contacting:', consultant.name);
    // Handle contact logic
  };

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#212121]">Mental Health Consultants</h1>
            <Link to="/dashboard" className="text-[#212121] hover:text-blue-600">
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-[#4F4F4F]">Connect with qualified mental health professionals for personalized support</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#212121] mb-2">Search Consultants</label>
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[#212121] mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Consultants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultants.map((consultant) => (
            <div key={consultant.id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    {consultant.image}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#212121]">{consultant.name}</h3>
                    <p className="text-sm text-[#4F4F4F]">{consultant.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{consultant.rating}</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {consultant.availability}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#4F4F4F] mb-4">{consultant.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4F4F4F]">Experience:</span>
                  <span className="font-medium">{consultant.experience}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4F4F4F]">Languages:</span>
                  <span className="font-medium">{consultant.languages.join(', ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4F4F4F]">Fee:</span>
                  <span className="font-medium">{consultant.consultationFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4F4F4F]">Next Available:</span>
                  <span className="font-medium text-blue-600">{consultant.nextAvailable}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleContact(consultant)}
                  className="flex-1 bg-[#212121] text-white py-2 px-4 rounded-md hover:bg-[#333] transition-colors"
                >
                  Contact
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredConsultants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#4F4F4F] text-lg">No consultants found matching your criteria.</p>
            <p className="text-[#4F4F4F]">Try adjusting your search or filter options.</p>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">🚨 Emergency Support</h3>
          <p className="text-red-700 mb-4">
            If you're experiencing a mental health crisis or need immediate support, please contact:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-red-800">National Crisis Hotline:</p>
              <p className="text-red-700">+94 768130758</p>
            </div>
            <div>
              <p className="font-medium text-red-800">Crisis Text Line:</p>
              <p className="text-red-700">Text HOME to 741741</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultants; 