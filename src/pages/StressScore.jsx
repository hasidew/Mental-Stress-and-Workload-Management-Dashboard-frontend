import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/api';

const StressScore = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentScore, setCurrentScore] = useState(null);
  const [workloadDetails, setWorkloadDetails] = useState(null);
  const [sharingPreferences, setSharingPreferences] = useState({
    share_with_supervisor: false,
    share_with_hr: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [hasAssignedTasks, setHasAssignedTasks] = useState(true);

  // Check if user is a supervisor
  const isSupervisor = user?.role === 'supervisor';
  const isHr = user?.role === 'hr_manager';

  useEffect(() => {
    fetchQuestions();
    fetchCurrentScore();
    fetchWorkloadDetails();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await apiService.getStressQuestions();
      setQuestions(data.questions);
    } catch (error) {
      showError('Failed to load stress assessment questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentScore = async () => {
    try {
      const data = await apiService.getMyStressScore();
      if (data.message) {
        setCurrentScore(null);
      } else {
        setCurrentScore(data);
        setSharingPreferences({
          share_with_supervisor: data.share_with_supervisor,
          share_with_hr: data.share_with_hr
        });
      }
    } catch (error) {
      console.log('No existing stress score found');
    }
  };

  const fetchWorkloadDetails = async () => {
    try {
      const data = await apiService.getWorkloadDetails();
      setWorkloadDetails(data);
      
      // Check if user has assigned tasks
      const totalAssignedTasks = (data.total_tasks || 0) + (data.pending_tasks || 0) + (data.high_priority_tasks || 0);
      setHasAssignedTasks(totalAssignedTasks > 0);
      
      // Show warning if no tasks assigned
      if (totalAssignedTasks === 0) {
        showWarning('No tasks are currently assigned to you for today. Stress score will be calculated using only the assessment questions. The workload component will be set to 0, and your final score will be: (Normalized PSS × 0.7) + (0 × 0.3)');
      }
    } catch (error) {
      console.log('Failed to fetch workload details');
      setHasAssignedTasks(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: parseInt(value)
    }));
  };

  // Helper function to get answer label
  const getAnswerLabel = (value) => {
    const labels = {
      0: 'Never',
      1: 'Almost Never', 
      2: 'Sometimes',
      3: 'Often',
      4: 'Very Often'
    };
    return labels[value] || '';
  };

  const handleSubmitAssessment = async () => {
    // Check if all questions are answered
    const answerArray = [];
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === undefined || answers[i] === null) {
        showError('Please answer all questions');
        return;
      }
      answerArray.push(answers[i]);
    }

    // Show warning if no tasks assigned but allow submission
    if (!hasAssignedTasks) {
      showWarning('No tasks are currently assigned to you. Stress score will be calculated using only the assessment questions. The workload component will be set to 0, and your final score will be: (Normalized PSS × 0.7) + (0 × 0.3)');
    }

    try {
      setSubmitting(true);
      const result = await apiService.submitStressAssessment({
        answers: answerArray,
        share_with_supervisor: sharingPreferences.share_with_supervisor,
        share_with_hr: sharingPreferences.share_with_hr
      });
      
      showSuccess(result.message);
      
      // Update current score with all the new fields
      setCurrentScore({
        id: result.id,
        score: result.score,
        level: result.level,
        pss_score: result.pss_score,
        normalized_pss: result.normalized_pss,
        workload_stress_score: result.workload_stress_score,
        total_hours_worked: result.total_hours_worked,
        share_with_supervisor: sharingPreferences.share_with_supervisor,
        share_with_hr: sharingPreferences.share_with_hr
      });
      
      // Refresh workload details
      await fetchWorkloadDetails();
      
      // Reset form
      setAnswers({});
    } catch (error) {
      showError(error.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSharing = async () => {
    try {
      await apiService.updateStressSharing(sharingPreferences);
      showSuccess('Sharing preferences updated successfully!');
      setShowSharingModal(false);
      
      // Refresh the current score data from server
      await fetchCurrentScore();
    } catch (error) {
      showError('Failed to update sharing preferences');
    }
  };

  const getStressLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStressLevelDescription = (level) => {
    switch (level) {
      case 'low': return 'Low stress level (0-3) - You are managing stress well. Keep up the good work!';
      case 'moderate': return 'Moderate stress level (4-6) - You are experiencing moderate stress. Consider stress management techniques.';
      case 'high': return 'High stress level (7-8.5) - You are experiencing high stress levels. Consider seeking support or professional help.';
      case 'critical': return 'Critical stress level (8.6+) - Immediate support recommended. Please seek professional help.';
      default: return '';
    }
  };

  // New function to get workload stress description
  const getWorkloadStressDescription = (hours) => {
    if (hours < 7.22) return 'Below standard hours (0.0)';
    if (hours >= 7.23 && hours <= 9.0) return 'Slightly above standard (0.5)';
    if (hours >= 9.01 && hours <= 11.99) return 'Moderately above standard (1.0)';
    if (hours >= 12.0) return 'Significantly above standard (2.0)';
    return 'Standard hours (0.0)';
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#212121]">Stress Assessment</h1>
            <Link to="/dashboard" className="text-[#212121] hover:text-blue-600">
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-[#4F4F4F]">Complete the assessment to understand your stress levels and get personalized insights</p>
        </div>

        {/* Task Assignment Warning */}
        {!hasAssignedTasks && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Tasks Currently Assigned</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You don't have any tasks assigned for today. Your stress score will be calculated using only the assessment questions.</p>
                  <p className="mt-1">The workload component will be set to 0, and your final score will be: <strong>Final Score = (Normalized PSS × 0.7) + (0 × 0.3)</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Score Display */}
          {currentScore && (
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-[#212121] mb-4">Your Current Stress Score</h2>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{currentScore.score.toFixed(1)}/10</div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStressLevelColor(currentScore.level)}`}>
                  {currentScore.level.toUpperCase()} STRESS
                </span>
              </div>
              <p className="text-[#4F4F4F] mb-4 text-center">
                {getStressLevelDescription(currentScore.level)}
              </p>
              
              {/* Score Explanation */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600 text-center">
                  <strong>How to interpret:</strong> A score of 0-3 indicates low stress, 4-6 moderate stress, 
                  7-8.5 high stress, and 8.6+ critical stress. Even with all "Never" answers, 
                  you may score in the moderate range due to PSS-10 reverse scoring methodology.
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  <strong>Note:</strong> PSS-10 maximum score is 24/40 (not 40/40) due to reverse scoring design.
                </p>
              </div>
              
              {/* Updated Calculation Formula */}
              
              {/* Detailed Breakdown */}
              
              
              <div className="space-y-3 mb-6">
                {!isSupervisor && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Share with Supervisor</span>
                    <span className={`text-sm ${currentScore.share_with_supervisor ? 'text-green-600' : 'text-gray-400'}`}>
                      {currentScore.share_with_supervisor ? '✓ Shared' : '✗ Private'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Share with HR</span>
                  <span className={`text-sm ${currentScore.share_with_hr ? 'text-green-600' : 'text-gray-400'}`}>
                    {currentScore.share_with_hr ? '✓ Shared' : '✗ Private'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  // Update sharing preferences state to match current score
                  setSharingPreferences({
                    share_with_supervisor: currentScore.share_with_supervisor,
                    share_with_hr: currentScore.share_with_hr
                  });
                  setShowSharingModal(true);
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Update Sharing Preferences
              </button>
            </div>
          )}

          {/* Assessment Form */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#212121] mb-4">
              {currentScore ? 'Retake Assessment' : 'Stress Assessment'}
            </h2>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Rate how often you have felt or thought a certain way during the past 24 hours:
              </p>
              <div className="grid grid-cols-5 gap-2 text-xs text-center mb-3">
                <div className="p-2 bg-gray-100 rounded">0 = Never</div>
                <div className="p-2 bg-gray-100 rounded">1 = Almost Never</div>
                <div className="p-2 bg-gray-100 rounded">2 = Sometimes</div>
                <div className="p-2 bg-gray-100 rounded">3 = Often</div>
                <div className="p-2 bg-gray-100 rounded">4 = Very Often</div>
              </div>
              
              {/* Important Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Important:</strong> Some questions are phrased positively (e.g., "You felt sure you could solve your problems"). 
                  For these questions, selecting "0 = Never" means you never felt confident, which contributes to stress. 
                  This is the correct PSS-10 methodology.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  <a href="/PSS_10_SCORING_EXPLANATION.md" target="_blank" className="underline hover:text-blue-800">
                    📖 Learn more about PSS-10 scoring methodology
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-[#212121] mb-3">{question}</p>
                  <div className="flex justify-between">
                    {[0, 1, 2, 3, 4].map((value) => (
                      <label key={value} className="flex flex-col items-center">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={value}
                          checked={answers[index] === value}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                          answers[index] === value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}>
                          {value}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sharing Preferences */}
            {!isHr && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#212121] mb-3">Sharing Preferences</h3>
                <div className="space-y-3">
                  {!isSupervisor && (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sharingPreferences.share_with_supervisor}
                        onChange={(e) => setSharingPreferences(prev => ({
                          ...prev,
                          share_with_supervisor: e.target.checked
                        }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Share my stress score with my supervisor</span>
                    </label>
                  )}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sharingPreferences.share_with_hr}
                      onChange={(e) => setSharingPreferences(prev => ({
                        ...prev,
                        share_with_hr: e.target.checked
                      }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Share my stress score with HR</span>
                  </label>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitAssessment}
              disabled={submitting || Object.keys(answers).length < questions.length}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : currentScore ? 'Update Assessment' : 'Submit Assessment'}
            </button>
          </div>
        </div>

        {/* Sharing Preferences Modal */}
        {showSharingModal && !isHr && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-[#212121] mb-4">Update Sharing Preferences</h2>
              
              <div className="space-y-4 mb-6">
                {!isSupervisor && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sharingPreferences.share_with_supervisor}
                      onChange={(e) => setSharingPreferences(prev => ({
                        ...prev,
                        share_with_supervisor: e.target.checked
                      }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Share with supervisor</span>
                  </label>
                )}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sharingPreferences.share_with_hr}
                    onChange={(e) => setSharingPreferences(prev => ({
                      ...prev,
                      share_with_hr: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Share with HR</span>
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateSharing}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowSharingModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StressScore; 