import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/api';

const StressScore = () => {
  const { showSuccess, showError } = useToast();
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('stressScoreTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  })
  const [newTask, setNewTask] = useState('')
  const [stressScore, setStressScore] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addTask = () => {
    if (newTask.trim()) {
      const newTasks = [...tasks, { id: Date.now(), text: newTask, completed: false }];
      setTasks(newTasks);
      localStorage.setItem('stressScoreTasks', JSON.stringify(newTasks));
      setNewTask('')
      showSuccess('Task added successfully!');
    } else {
      showError('Please enter a task description');
    }
  }

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('stressScoreTasks', JSON.stringify(updatedTasks));
  }

  const removeTask = (id) => {
    const taskToRemove = tasks.find(task => task.id === id);
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('stressScoreTasks', JSON.stringify(updatedTasks));
    showSuccess(`Removed task: "${taskToRemove.text}"`);
  }

  const calculateStressScore = () => {
    if (tasks.length === 0) {
      showError('Please add some tasks first');
      return;
    }
    
    const completedTasks = tasks.filter(task => task.completed).length
    const totalTasks = tasks.length
    const completionRate = (completedTasks / totalTasks) * 100
    
    // Simple stress score calculation
    let score = 0
    if (completionRate >= 80) score = Math.floor(Math.random() * 2) + 1 // 1-2
    else if (completionRate >= 60) score = Math.floor(Math.random() * 2) + 3 // 3-4
    else if (completionRate >= 40) score = Math.floor(Math.random() * 2) + 5 // 5-6
    else if (completionRate >= 20) score = Math.floor(Math.random() * 2) + 7 // 7-8
    else score = Math.floor(Math.random() * 2) + 9 // 9-10
    
    setStressScore(score)
    showSuccess(`Stress score calculated: ${score}/10`);
  }

  const submitStressScore = async () => {
    if (stressScore === null) {
      showError('Please calculate your stress score first');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.submitStressScore({ score: stressScore });
      showSuccess('Stress score submitted successfully!');
    } catch (error) {
      showError('Failed to submit stress score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#212121]">Stress Score Analysis</h1>
            <Link to="/dashboard" className="text-[#212121] hover:text-blue-600">
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-[#4F4F4F]">Understand your stress patterns and get personalized recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Management */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#212121]">Add Your Daily Tasks</h2>
              <span className="text-sm text-gray-500">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} • {tasks.filter(t => t.completed).length} completed
              </span>
            </div>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter a task..."
                className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <button
                onClick={addTask}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Add
              </button>
            </div>

            {tasks.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{tasks.filter(t => t.completed).length}/{tasks.length} completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={task.completed ? 'line-through text-gray-500' : 'text-[#212121]'}>
                      {task.text}
                    </span>
                  </div>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[#4F4F4F] mb-2">No tasks added yet</p>
                  <p className="text-sm text-gray-400">Add some tasks to calculate your stress score</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={calculateStressScore}
                disabled={tasks.length === 0}
                className="flex-1 bg-gradient-to-r from-[#212121] to-gray-800 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Calculate Stress Score
              </button>
              {tasks.length > 0 && (
                <button
                  onClick={() => {
                    setTasks([]);
                    setStressScore(null);
                    localStorage.removeItem('stressScoreTasks');
                    showSuccess('All tasks cleared!');
                  }}
                  className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {stressScore !== null && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-xl font-semibold text-[#212121] mb-4">Your Stress Score</h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stressScore}/10</div>
                  <p className="text-[#4F4F4F]">
                    {stressScore <= 2 && "Low stress level - Great job managing your workload!"}
                    {stressScore >= 3 && stressScore <= 4 && "Moderate stress - Consider taking more breaks."}
                    {stressScore >= 5 && stressScore <= 6 && "High stress - Try to prioritize tasks better."}
                    {stressScore >= 7 && stressScore <= 8 && "Very high stress - Consider seeking support."}
                    {stressScore >= 9 && "Critical stress level - Please reach out for help immediately."}
                  </p>
                </div>
                <button
                  onClick={submitStressScore}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Stress Score'
                  )}
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/stress-tracking" className="block w-full bg-blue-600 text-white py-3 px-4 rounded-xl text-center hover:bg-blue-700 transition-colors">
                  Log Today's Activities
                </Link>
                <Link to="/ai-chat" className="block w-full bg-green-600 text-white py-3 px-4 rounded-xl text-center hover:bg-green-700 transition-colors">
                  Chat with AI Assistant
                </Link>
                <Link to="/consultants" className="block w-full bg-orange-600 text-white py-3 px-4 rounded-xl text-center hover:bg-orange-700 transition-colors">
                  Contact Consultant
                </Link>
              </div>
            </div>

            {/* Stress Management Tips */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">Stress Management Tips</h3>
              <div className="space-y-3 text-sm text-[#4F4F4F]">
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">•</span>
                  <p>Practice deep breathing for 5 minutes daily</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">•</span>
                  <p>Take a 10-minute walk during lunch breaks</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">•</span>
                  <p>Set boundaries between work and personal time</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">•</span>
                  <p>Stay hydrated and maintain regular meal times</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StressScore 