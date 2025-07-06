import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { validationRules, validateForm } from '../utils/validation'

const StressTracking = () => {
  const [formData, setFormData] = useState({
    date: '',
    workload: '',
    stressLevel: '',
    sleepHours: '',
    exerciseMinutes: '',
    notes: ''
  })
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation schema for StressTracking form
  const validationSchema = {
    date: [validationRules.required, validationRules.date],
    workload: [validationRules.select],
    stressLevel: [validationRules.select],
    sleepHours: [validationRules.number],
    exerciseMinutes: [validationRules.number],
    notes: [validationRules.textLength]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const fieldErrors = validateForm({ [name]: value }, { [name]: validationSchema[name] });
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({ date: true, workload: true, stressLevel: true, sleepHours: true, exerciseMinutes: true, notes: true });
    
    // Validate entire form
    const formErrors = validateForm(formData, validationSchema);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    console.log('Stress tracking data:', formData)
    // Reset form
    setFormData({
      date: '',
      workload: '',
      stressLevel: '',
      sleepHours: '',
      exerciseMinutes: '',
      notes: ''
    })
    setErrors({});
    setTouched({});
  }

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#212121]">Daily Workload Tracking</h1>
            <Link to="/dashboard" className="text-[#212121] hover:text-blue-600">
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-[#4F4F4F]">Log your daily activities and workload to track your stress patterns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Form */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#212121] mb-6">Daily Log</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#212121] mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.date && errors.date 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  />
                  {touched.date && errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#212121] mb-1">Workload Level (1-10)</label>
                  <select
                    name="workload"
                    value={formData.workload}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.workload && errors.workload 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select workload level</option>
                    <option value="1">1 - Very Light</option>
                    <option value="2">2 - Light</option>
                    <option value="3">3 - Moderate</option>
                    <option value="4">4 - Somewhat Heavy</option>
                    <option value="5">5 - Heavy</option>
                    <option value="6">6 - Very Heavy</option>
                    <option value="7">7 - Extremely Heavy</option>
                    <option value="8">8 - Overwhelming</option>
                    <option value="9">9 - Critical</option>
                    <option value="10">10 - Emergency</option>
                  </select>
                  {touched.workload && errors.workload && (
                    <p className="text-red-500 text-sm mt-1">{errors.workload}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#212121] mb-1">Stress Level (1-10)</label>
                  <select
                    name="stressLevel"
                    value={formData.stressLevel}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.stressLevel && errors.stressLevel 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select stress level</option>
                    <option value="1">1 - No Stress</option>
                    <option value="2">2 - Minimal Stress</option>
                    <option value="3">3 - Low Stress</option>
                    <option value="4">4 - Some Stress</option>
                    <option value="5">5 - Moderate Stress</option>
                    <option value="6">6 - High Stress</option>
                    <option value="7">7 - Very High Stress</option>
                    <option value="8">8 - Severe Stress</option>
                    <option value="9">9 - Critical Stress</option>
                    <option value="10">10 - Emergency Stress</option>
                  </select>
                  {touched.stressLevel && errors.stressLevel && (
                    <p className="text-red-500 text-sm mt-1">{errors.stressLevel}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#212121] mb-1">Sleep Hours</label>
                  <input
                    type="number"
                    name="sleepHours"
                    value={formData.sleepHours}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="0"
                    max="24"
                    step="0.5"
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.sleepHours && errors.sleepHours 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Hours of sleep"
                  />
                  {touched.sleepHours && errors.sleepHours && (
                    <p className="text-red-500 text-sm mt-1">{errors.sleepHours}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#212121] mb-1">Exercise Minutes</label>
                  <input
                    type="number"
                    name="exerciseMinutes"
                    value={formData.exerciseMinutes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="0"
                    max="300"
                    className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.exerciseMinutes && errors.exerciseMinutes 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Minutes of exercise"
                  />
                  {touched.exerciseMinutes && errors.exerciseMinutes && (
                    <p className="text-red-500 text-sm mt-1">{errors.exerciseMinutes}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#212121] mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="4"
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.notes && errors.notes 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Any additional notes about your day..."
                />
                {touched.notes && errors.notes && (
                  <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#212121] to-gray-800 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
              >
                Submit Entry
              </button>
            </form>
          </div>

          {/* Tips Section */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">💡 Tips for Better Stress Management</h3>
            <div className="space-y-3 text-sm text-[#4F4F4F]">
              <div className="flex items-start space-x-2">
                <span className="text-green-600">•</span>
                <p>Take regular breaks every 90 minutes</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">•</span>
                <p>Practice deep breathing exercises</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">•</span>
                <p>Stay hydrated throughout the day</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">•</span>
                <p>Set realistic daily goals</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">•</span>
                <p>Maintain a consistent sleep schedule</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">•</span>
                <p>Connect with colleagues regularly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StressTracking 