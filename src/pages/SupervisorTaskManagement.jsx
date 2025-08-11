import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/api';

const SupervisorTaskManagement = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigned_date: new Date().toISOString().split('T')[0], // Default to today
    duration: '',
    due_date: '',
    employee_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, membersData] = await Promise.all([
        apiService.supervisorGetTeamTasks(),
        apiService.supervisorGetTeamMembers()
      ]);
      setTasks(tasksData);
      setTeamMembers(membersData);
    } catch (error) {
      showError('Failed to load team data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assigned_date: formData.assigned_date ? `${formData.assigned_date}T00:00:00` : null,
        duration: formData.duration ? parseInt(formData.duration) * 60 : null, // Convert hours to minutes
        due_date: formData.due_date ? `${formData.due_date}T00:00:00` : null
      };
      
      await apiService.supervisorCreateTask(taskData, parseInt(formData.employee_id));
      showSuccess('Task assigned successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', priority: 'medium', assigned_date: new Date().toISOString().split('T')[0], duration: '', due_date: '', employee_id: '' });
      fetchData();
    } catch (error) {
      showError(error.message || 'Failed to assign task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assigned_date: formData.assigned_date ? `${formData.assigned_date}T00:00:00` : null,
        duration: formData.duration ? parseInt(formData.duration) * 60 : null, // Convert hours to minutes
        due_date: formData.due_date ? `${formData.due_date}T00:00:00` : null
      };
      
      await apiService.supervisorUpdateTask(editingTask.id, taskData);
      showSuccess('Task updated successfully!');
      setShowEditModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', priority: 'medium', assigned_date: new Date().toISOString().split('T')[0], duration: '', due_date: '', employee_id: '' });
      fetchData();
    } catch (error) {
      showError(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiService.supervisorDeleteTask(taskId);
        showSuccess('Task deleted successfully!');
        fetchData();
      } catch (error) {
        showError(error.message || 'Failed to delete task');
      }
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assigned_date: task.assigned_date ? task.assigned_date.split('T')[0] : new Date().toISOString().split('T')[0],
      duration: task.duration ? Math.floor(task.duration / 60) : '', // Convert minutes to hours
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      employee_id: task.employee_id ? task.employee_id.toString() : ''
    });
    setShowEditModal(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Team Task Management</h1>
          <p className="text-[#4F4F4F]">Manage tasks for your team members</p>
        </div>

        {/* Team Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold text-[#212121] mb-4">Team Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{teamMembers.length}</p>
              <p className="text-sm text-gray-600">Team Members</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed Tasks</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {tasks.filter(t => t.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending Tasks</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#212121]">Team Tasks</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Assign New Task
            </button>
          </div>

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks assigned to team members yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#212121] mb-1">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Assigned to: <strong>{task.employee_name}</strong></span>
                        <span>Assigned by: <strong>{task.assigned_by_name}</strong></span>
                        {task.assigned_date && (
                          <span>Assigned: <strong>{new Date(task.assigned_date).toLocaleDateString()}</strong></span>
                        )}
                        {task.duration && (
                          <span>Duration: <strong>{Math.floor(task.duration / 60)} hours</strong></span>
                        )}
                        {task.due_date && (
                          <span>Due: <strong>{new Date(task.due_date).toLocaleDateString()}</strong></span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => {
              setShowCreateModal(false);
              setFormData({ title: '', description: '', priority: 'medium', assigned_date: new Date().toISOString().split('T')[0], duration: '', due_date: '', employee_id: '' });
            }}
            onSubmit={handleCreateTask}
            formData={formData}
            setFormData={setFormData}
            teamMembers={teamMembers}
          />
        )}

        {/* Edit Task Modal */}
        {showEditModal && editingTask && (
          <EditTaskModal
            onClose={() => {
              setShowEditModal(false);
              setEditingTask(null);
              setFormData({ title: '', description: '', priority: 'medium', assigned_date: new Date().toISOString().split('T')[0], duration: '', due_date: '', employee_id: '' });
            }}
            onSubmit={handleUpdateTask}
            formData={formData}
            setFormData={setFormData}
            task={editingTask}
            teamMembers={teamMembers}
          />
        )}
      </div>
    </div>
  );
};

// Create Task Modal Component
const CreateTaskModal = ({ onClose, onSubmit, formData, setFormData, teamMembers }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#212121]">Assign New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Task Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Assign to Employee <span className="text-red-500">*</span></label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an employee</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.username}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Assigned Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="assigned_date"
              value={formData.assigned_date}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[#212121] font-medium mb-2">Duration (hours)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
            >
              Assign Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Task Modal Component
const EditTaskModal = ({ onClose, onSubmit, formData, setFormData, task, teamMembers }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#212121]">Edit Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[#212121] font-medium mb-2">Task Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Assigned to Employee</label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.username}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Assigned Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="assigned_date"
              value={formData.assigned_date}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[#212121] font-medium mb-2">Duration (hours)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-[#212121] font-medium mb-2">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
            >
              Update Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupervisorTaskManagement; 