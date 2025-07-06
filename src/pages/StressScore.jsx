import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const StressScore = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [stressScore, setStressScore] = useState(null)

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }])
      setNewTask('')
    }
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const calculateStressScore = () => {
    if (tasks.length === 0) return 0
    
    const completedTasks = tasks.filter(task => task.completed).length
    const totalTasks = tasks.length
    const completionRate = (completedTasks / totalTasks) * 100
    
    // Simple stress score calculation
    let score = 0
    if (completionRate >= 80) score = 1-2
    else if (completionRate >= 60) score = 3-4
    else if (completionRate >= 40) score = 5-6
    else if (completionRate >= 20) score = 7-8
    else score = 9-10
    
    setStressScore(score)
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
            <h2 className="text-xl font-semibold text-[#212121] mb-6">Add Your Daily Tasks</h2>
            
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
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-[#4F4F4F] text-center py-8">No tasks added yet</p>
              )}
            </div>

            <button
              onClick={calculateStressScore}
              disabled={tasks.length === 0}
              className="w-full mt-6 bg-gradient-to-r from-[#212121] to-gray-800 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Calculate Stress Score
            </button>
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