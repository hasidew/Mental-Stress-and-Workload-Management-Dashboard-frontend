// Role-based URL utilities
export const getDashboardUrl = (role) => {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'hr_manager':
      return '/hr-dashboard';
    case 'supervisor':
    case 'psychiatrist':
    case 'employee':
    default:
      return '/dashboard';
  }
};

export const getRoleBasedUrls = (role) => {
  const baseUrls = {
    dashboard: getDashboardUrl(role),
    stressScore: '/stress-score',
    aiChat: '/ai-chat',
    psychiatrists: '/psychiatrists',
    taskManagement: '/task-management',
  };

  // Add role-specific URLs
  switch (role) {
    case 'admin':
      return {
        ...baseUrls,
        users: '/admin/users',
        departments: '/admin/departments',
        teams: '/admin/teams',
        psychiatrists: '/admin/psychiatrists',
      };
    case 'supervisor':
      return {
        ...baseUrls,
        supervisorTaskManagement: '/supervisor/task-management',
        supervisorStressMonitoring: '/supervisor/stress-monitoring',
        teamBookings: '/psychiatrist/team-bookings',
        teamStressScores: '/stress/team-scores',
      };
    case 'hr_manager':
      return {
        ...baseUrls,
        hrDashboard: '/hr-dashboard',
        teamBookings: '/psychiatrist/team-bookings',
        teamStressScores: '/stress/team-scores',
      };
    default:
      return baseUrls;
  }
};

export const shouldRedirectToAdmin = (role) => {
  return role === 'admin';
};

export const canAccessFeature = (feature, role) => {
  const rolePermissions = {
    admin: ['all'],
    supervisor: ['dashboard', 'stressScore', 'aiChat', 'psychiatrists', 'taskManagement', 'supervisorTaskManagement', 'supervisorStressMonitoring', 'teamBookings', 'teamStressScores'],
    hr_manager: ['dashboard', 'stressScore', 'aiChat', 'psychiatrists', 'taskManagement', 'teamBookings', 'teamStressScores'],
    psychiatrist: ['dashboard', 'stressScore', 'aiChat', 'psychiatrists'],
    employee: ['dashboard', 'stressScore', 'aiChat', 'psychiatrists', 'taskManagement'],
  };

  const permissions = rolePermissions[role] || rolePermissions.employee;
  return permissions.includes('all') || permissions.includes(feature);
}; 