import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/api';

const SupervisorStressMonitoring = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [stressData, setStressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStressData();
  }, []);

  const fetchStressData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTeamStressScores();
      setStressData(data);
    } catch (error) {
      showError('Failed to load team stress data');
      console.error('Error fetching stress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStressLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStressLevelDescription = (level) => {
    switch (level) {
      case 'low':
        return 'Good stress management. Keep up the healthy habits!';
      case 'medium':
        return 'Moderate stress levels. Consider stress management techniques.';
      case 'high':
        return 'High stress levels detected. Consider seeking support or consultation.';
      default:
        return 'Stress level not available.';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#EDF4FA] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Team Stress Monitoring</h1>
          <p className="text-[#4F4F4F]">Monitor your team members' stress levels and well-being</p>
        </div>

        {/* Overview Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold text-[#212121] mb-4">Team Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stressData?.total_members || 0}</p>
              <p className="text-sm text-gray-600">Total Team Members</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stressData?.team_scores?.filter(s => s.level === 'low').length || 0}
              </p>
              <p className="text-sm text-gray-600">Low Stress</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {stressData?.team_scores?.filter(s => s.level === 'medium').length || 0}
              </p>
              <p className="text-sm text-gray-600">Medium Stress</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {stressData?.team_scores?.filter(s => s.level === 'high').length || 0}
              </p>
              <p className="text-sm text-gray-600">High Stress</p>
            </div>
          </div>
        </div>

        {/* Team Members Stress Scores */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-[#212121] mb-4">Team Stress Scores</h2>
          
          {!stressData || stressData.team_scores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No stress scores shared by team members yet.</p>
              <p className="text-sm text-gray-400">
                Team members need to complete stress assessments and choose to share with supervisors.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stressData.team_scores.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#212121] mb-1">
                        {member.employee_name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Last updated: {new Date(member.updated_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getStressLevelDescription(member.level)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {member.score}/40
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStressLevelColor(member.level)}`}>
                        {member.level.toUpperCase()} STRESS
                      </span>
                    </div>
                  </div>
                  
                  {/* Stress Level Indicator */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">Stress Level:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            member.level === 'low' ? 'bg-green-500' :
                            member.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${(member.score / 40) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">About Stress Monitoring</h3>
          <div className="text-blue-700 space-y-2">
            <p className="text-sm">
              • Only team members who have completed stress assessments and chosen to share with supervisors are shown here.
            </p>
            <p className="text-sm">
              • <strong>Employees:</strong> Must check "Share with supervisor" to appear in this view.
            </p>
            <p className="text-sm">
              • <strong>Supervisors:</strong> Can only share their stress scores with HR, not with other supervisors.
            </p>
            <p className="text-sm">
              • Stress scores are based on the Perceived Stress Scale (PSS) with scores ranging from 0-40.
            </p>
            <p className="text-sm">
              • Low stress: 0-13, Medium stress: 14-26, High stress: 27-40.
            </p>
            <p className="text-sm">
              • Consider reaching out to team members with high stress levels to offer support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorStressMonitoring; 