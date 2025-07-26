import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const HrConsultantManagement = () => {
  const { getUserRole } = useAuth();
  const { showError, showSuccess } = useToast();
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [consultantBookings, setConsultantBookings] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    qualifications: '',
    registration_number: '',
    hospital: '',
    specialization: '',
    availabilities: []
  });

  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllConsultants();
      setConsultants(data);
    } catch (error) {
      showError('Failed to load consultants');
      console.error('Error fetching consultants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultantBookings = async (consultantId) => {
    try {
      const data = await apiService.getConsultantBookings(consultantId);
      setConsultantBookings(data);
    } catch (error) {
      showError('Failed to load consultant bookings');
      console.error('Error fetching consultant bookings:', error);
    }
  };

  const handleAddAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availabilities: [...prev.availabilities, { day_of_week: 0, start_time: '09:00', end_time: '17:00' }]
    }));
  };

  const handleRemoveAvailability = (index) => {
    setFormData(prev => ({
      ...prev,
      availabilities: prev.availabilities.filter((_, i) => i !== index)
    }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      availabilities: prev.availabilities.map((availability, i) => 
        i === index ? { ...availability, [field]: value } : availability
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditModal) {
        await apiService.updateConsultant(selectedConsultant.id, formData);
        showSuccess('Consultant updated successfully');
      } else {
        await apiService.createConsultantWithAvailability(formData);
        showSuccess('Consultant added successfully');
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setFormData({
        name: '',
        qualifications: '',
        registration_number: '',
        hospital: '',
        specialization: '',
        availabilities: []
      });
      setSelectedConsultant(null);
      fetchConsultants();
    } catch (error) {
      showError(error.message || 'Failed to save consultant');
    }
  };

  const handleEdit = (consultant) => {
    setSelectedConsultant(consultant);
    setFormData({
      name: consultant.name,
      qualifications: consultant.qualifications,
      registration_number: consultant.registration_number,
      hospital: consultant.hospital,
      specialization: consultant.specialization,
      availabilities: consultant.availabilities.map(avail => ({
        day_of_week: avail.day_of_week,
        start_time: avail.start_time,
        end_time: avail.end_time
      }))
    });
    setShowEditModal(true);
  };

  const handleDelete = async (consultantId) => {
    if (window.confirm('Are you sure you want to delete this consultant? All scheduled appointments will be cancelled.')) {
      try {
        await apiService.deleteConsultant(consultantId);
        showSuccess('Consultant deleted successfully');
        fetchConsultants();
      } catch (error) {
        showError('Failed to delete consultant');
      }
    }
  };

  const handleViewBookings = async (consultant) => {
    setSelectedConsultant(consultant);
    await fetchConsultantBookings(consultant.id);
    setShowBookingsModal(true);
  };

  const getDayName = (dayOfWeek) => {
    return daysOfWeek.find(day => day.value === dayOfWeek)?.label || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Consultant Management</h1>
          <p className="text-gray-600 mt-2">Manage consultants and their availability</p>
        </div>

        {/* Add Consultant Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Consultant
          </button>
        </div>

        {/* Consultants List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultants.map((consultant) => (
            <div key={consultant.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{consultant.name}</h3>
                  <p className="text-sm text-gray-600">{consultant.specialization}</p>
                  <p className="text-sm text-gray-600">{consultant.hospital}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewBookings(consultant)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Bookings
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Qualifications:</strong> {consultant.qualifications}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Registration:</strong> {consultant.registration_number}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Availability:</h4>
                <div className="space-y-1">
                  {consultant.availabilities.map((availability, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      {getDayName(availability.day_of_week)}: {availability.start_time} - {availability.end_time}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(consultant)}
                  className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(consultant.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {consultants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No consultants found. Add your first consultant to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Consultant Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {showEditModal ? 'Edit Consultant' : 'Add New Consultant'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.hospital}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications <span className="text-red-500">*</span></label>
                  <textarea
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Availability Schedule</label>
                    <button
                      type="button"
                      onClick={handleAddAvailability}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Add Time Slot
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.availabilities.map((availability, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <select
                          value={availability.day_of_week}
                          onChange={(e) => handleAvailabilityChange(index, 'day_of_week', parseInt(e.target.value))}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {daysOfWeek.map(day => (
                            <option key={day.value} value={day.value}>{day.label}</option>
                          ))}
                        </select>
                        <input
                          type="time"
                          value={availability.start_time}
                          onChange={(e) => handleAvailabilityChange(index, 'start_time', e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={availability.end_time}
                          onChange={(e) => handleAvailabilityChange(index, 'end_time', e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAvailability(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showEditModal ? 'Update Consultant' : 'Add Consultant'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setFormData({
                        name: '',
                        qualifications: '',
                        registration_number: '',
                        hospital: '',
                        specialization: '',
                        availabilities: []
                      });
                      setSelectedConsultant(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Consultant Bookings Modal */}
      {showBookingsModal && selectedConsultant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bookings for {selectedConsultant.name}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booked By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultantBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.employee_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.booked_by_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.booking_date).toLocaleDateString()} at{' '}
                          {new Date(booking.booking_date).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.duration_minutes} minutes
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {booking.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {consultantBookings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings found for this consultant.</p>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowBookingsModal(false);
                    setSelectedConsultant(null);
                    setConsultantBookings([]);
                  }}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrConsultantManagement; 