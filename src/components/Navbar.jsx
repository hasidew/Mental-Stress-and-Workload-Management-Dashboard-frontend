import React from 'react'
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, logout, getUserRole } = useAuth();
    const navigate = useNavigate();

    const publicLinks = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/features', label: 'Features' },
        { path: '/contact', label: 'Contact' }
    ];

    const authenticatedLinks = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/stress-score', label: 'Stress Score' },
        { path: '/ai-chat', label: 'AI Chat' },
        { path: '/task-management', label: 'Tasks' },
        { path: '/psychiatrists', label: 'Book Psychiatrist' }
    ];

    const supervisorNavItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/supervisor/task-management', label: 'Team Tasks' },
        { path: '/supervisor/stress-monitoring', label: 'Team Stress' },
        { path: '/task-management', label: 'My Tasks' },
        { path: '/stress-score', label: 'My Stress' },
        { path: '/ai-chat', label: 'AI Chat' },
        { path: '/psychiatrists', label: 'Book Psychiatrist' }
    ];

    const psychiatristNavItems = [
        { path: '/psychiatrist-dashboard', label: 'Dashboard' }
    ];

    const hrNavItems = [
        { path: '/hr-dashboard', label: 'HR Dashboard' },
        { path: '/hr-psychiatrist-management', label: 'Manage Psychiatrists' },
        { path: '/psychiatrists', label: 'Book Psychiatrist' }
    ];

    const adminNavItems = [
        { path: '/admin-dashboard', label: 'Admin Dashboard' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
            <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <img src="/images/logo.png" alt="MindEase Logo" className="w-10 h-10 object-contain" />
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-[#212121] group-hover:text-blue-600 transition-colors">
                                MindEase
                            </h1>
                            <p className="text-xs text-[#4F4F4F]">Ease your workload. Free your mind.</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {isAuthenticated() ? (
                            <>
                                {(getUserRole() === 'admin' ? adminNavItems : 
                                  getUserRole() === 'supervisor' ? supervisorNavItems :
                                  getUserRole() === 'psychiatrist' ? psychiatristNavItems :
                                  getUserRole() === 'hr_manager' ? hrNavItems :
                                  authenticatedLinks).map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                            isActive(item.path)
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-[#212121] hover:bg-gray-100 hover:text-blue-600'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                
                                {/* Notification Bell */}
                                <NotificationBell />
                                
                                {/* User Menu */}
                                <div className="relative ml-4">
                                    <button
                                        onClick={() => setIsOpen(!isOpen)}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-[#212121] hover:bg-gray-100 transition-all duration-200"
                                    >
                                        <span>Account</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {publicLinks.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                            isActive(item.path)
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-[#212121] hover:bg-gray-100 hover:text-blue-600'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                
                                <div className="flex items-center space-x-2 ml-4">
                                    <Link
                                        to="/signin"
                                        className="px-4 py-2 text-sm font-medium text-[#212121] hover:text-blue-600 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[#212121] hover:text-blue-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {isAuthenticated() ? (
                                <>
                                    {(getUserRole() === 'admin' ? adminNavItems : 
                                      getUserRole() === 'supervisor' ? supervisorNavItems :
                                      getUserRole() === 'psychiatrist' ? psychiatristNavItems :
                                      getUserRole() === 'hr_manager' ? hrNavItems :
                                      authenticatedLinks).map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                                isActive(item.path)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-[#212121] hover:bg-gray-100'
                                            }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                    
                                    {/* Mobile Notification Bell */}
                                    <div className="px-3 py-2">
                                        <NotificationBell />
                                    </div>
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[#212121] hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    {publicLinks.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                                isActive(item.path)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-[#212121] hover:bg-gray-100'
                                            }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                    
                                    <div className="pt-4 pb-3 border-t border-gray-200">
                                        <Link
                                            to="/signin"
                                            className="block px-3 py-2 rounded-md text-base font-medium text-[#212121] hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="block px-3 py-2 rounded-md text-base font-medium text-[#212121] hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
