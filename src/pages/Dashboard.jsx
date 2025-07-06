import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stressScore, setStressScore] = useState(65);
  const [workloadLevel, setWorkloadLevel] = useState('Medium');
  const [recentActivities] = useState([
    { id: 1, activity: 'Logged daily tasks', time: '2 hours ago', type: 'task' },
    { id: 2, activity: 'Chatted with AI Assistant', time: '4 hours ago', type: 'chat' },
    { id: 3, activity: 'Contacted Consultant', time: '1 day ago', type: 'consultant' },
    { id: 4, activity: 'Updated stress score', time: '2 days ago', type: 'stress' },
  ]);

  const getStressColor = (score) => {
    if (score < 30) return 'text-green-600 bg-green-100';
    if (score < 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getWorkloadColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Welcome back, John!</h1>
          <p className="text-[#4F4F4F]">Here's your mental wellness overview for today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Current Stress Score</p>
                <p className={`text-2xl font-bold ${getStressColor(stressScore)}`}>
                  {stressScore}/100
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Workload Level</p>
                <p className={`text-2xl font-bold ${getWorkloadColor(workloadLevel)}`}>
                  {workloadLevel}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4F4F4F] text-sm">Days Tracked</p>
                <p className="text-2xl font-bold text-[#212121]">14</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/stress-tracking" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">Log Daily Tasks</h3>
              <p className="text-[#4F4F4F] text-sm">Track your workload</p>
            </div>
          </Link>

          <Link to="/stress-score" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">Stress Score</h3>
              <p className="text-[#4F4F4F] text-sm">Understand your stress</p>
            </div>
          </Link>

          <Link to="/ai-chat" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">AI Assistant</h3>
              <p className="text-[#4F4F4F] text-sm">Get tips & support</p>
            </div>
          </Link>

          <Link to="/consultants" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">Consultants</h3>
              <p className="text-[#4F4F4F] text-sm">Expert support</p>
            </div>
          </Link>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-[#212121] mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">
                      {activity.type === 'task' && '📝'}
                      {activity.type === 'chat' && '🤖'}
                      {activity.type === 'consultant' && '👨‍⚕️'}
                      {activity.type === 'stress' && '🧠'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#212121] font-medium">{activity.activity}</p>
                    <p className="text-[#4F4F4F] text-sm">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 