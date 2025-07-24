import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/api';

const StressScore = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentScore, setCurrentScore] = useState(null);
  const [sharingPreferences, setSharingPreferences] = useState({
    share_with_supervisor: false,
    share_with_hr: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);

  // Check if user is a supervisor
  const isSupervisor = user?.role === 'supervisor';
  const isHr = user?.role === 'hr_manager';

  useEffect(() => {
    fetchQuestions();
    fetchCurrentScore();
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

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: parseInt(value)
    }));
  };

  const handleSubmitAssessment = async () => {
    // Check if all questions are answered
    const answerArray = [];
    for (let i = 0; i < questions.length; i++) {
      if (!answers[i]) {
        showError('Please answer all questions');
        return;
      }
      answerArray.push(answers[i]);
    }

    try {
      setSubmitting(true);
      const result = await apiService.submitStressAssessment({
        answers: answerArray,
        share_with_supervisor: sharingPreferences.share_with_supervisor,
        share_with_hr: sharingPreferences.share_with_hr
      });
      
      showSuccess(result.message);
      setCurrentScore({
        score: result.score,
        level: result.level,
        share_with_supervisor: sharingPreferences.share_with_supervisor,
        share_with_hr: sharingPreferences.share_with_hr
      });
      
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
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStressLevelDescription = (level) => {
    switch (level) {
      case 'low': return 'You are managing stress well. Keep up the good work!';
      case 'medium': return 'You are experiencing moderate stress. Consider stress management techniques.';
      case 'high': return 'You are experiencing high stress levels. Consider seeking support or professional help.';
      default: return '';
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Score Display */}
          {currentScore && (
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-[#212121] mb-4">Your Current Stress Score</h2>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{currentScore.score}/40</div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStressLevelColor(currentScore.level)}`}>
                  {currentScore.level.toUpperCase()} STRESS
                </span>
              </div>
              <p className="text-[#4F4F4F] mb-4 text-center">
                {getStressLevelDescription(currentScore.level)}
              </p>
              
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
                Rate how often you have felt or thought a certain way in the last month:
              </p>
              <div className="grid grid-cols-5 gap-2 text-xs text-center">
                <div className="p-2 bg-gray-100 rounded">1 = Never</div>
                <div className="p-2 bg-gray-100 rounded">2 = Almost Never</div>
                <div className="p-2 bg-gray-100 rounded">3 = Sometimes</div>
                <div className="p-2 bg-gray-100 rounded">4 = Fairly Often</div>
                <div className="p-2 bg-gray-100 rounded">5 = Very Often</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-[#212121] mb-3">{question}</p>
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((value) => (
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