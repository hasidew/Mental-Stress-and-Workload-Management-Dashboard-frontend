import React from 'react'
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, logout, getUserRole } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/features', label: 'Features' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' }
    ];

    const authenticatedNavItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/task-management', label: 'Task Management' },
        { path: '/stress-score', label: 'Stress Assessment' },
        { path: '/ai-chat', label: 'AI Chat' },
        { path: '/consultants', label: 'Consultants' }
    ];

    const supervisorNavItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/supervisor/task-management', label: 'Team Tasks' },
        { path: '/supervisor/stress-monitoring', label: 'Team Stress' },
        { path: '/task-management', label: 'My Tasks' },
        { path: '/stress-score', label: 'My Stress' },
        { path: '/ai-chat', label: 'AI Chat' },
        { path: '/consultants', label: 'Consultants' }
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
                        <img src="/images/logo.png" alt="MindCare Logo" className="w-10 h-10 object-contain" />
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-[#212121] group-hover:text-blue-600 transition-colors">
                                MindCare
                            </h1>
                            <p className="text-xs text-[#4F4F4F]">Mental Wellness Platform</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {isAuthenticated() ? (
                            <>
                                {(getUserRole() === 'admin' ? adminNavItems : 
                                  getUserRole() === 'supervisor' ? supervisorNavItems : 
                                  authenticatedNavItems).map((item) => (
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
                            </>
                        ) : (
                            <>
                                {navItems.map((item) => (
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
                            </>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated() ? (
                            <>
                                <span className="text-sm text-gray-600">
                                    Welcome, {getUserRole()} (Role: {getUserRole()})
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-red-600 hover:text-red-800 font-medium transition-colors px-5 py-2 rounded-xl hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/signin"
                                    className="text-[#212121] hover:text-blue-600 font-medium transition-colors px-5 py-2 rounded-xl hover:bg-gray-100"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-gradient-to-r from-[#212121] to-gray-800 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-[#212121] hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon when menu is closed */}
                            <svg
                                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {/* Icon when menu is open */}
                            <svg
                                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-gray-100">
                    {isAuthenticated() ? (
                        <>
                            {(getUserRole() === 'admin' ? adminNavItems : 
                              getUserRole() === 'supervisor' ? supervisorNavItems : 
                              authenticatedNavItems).map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                                        isActive(item.path)
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-[#212121] hover:bg-gray-100 hover:text-blue-600'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            
                            {/* Mobile Auth Buttons */}
                            <div className="pt-4 pb-3 border-t border-gray-200">
                                <div className="space-y-2">
                                    <div className="text-center text-sm text-gray-600 mb-2">
                                        Welcome, {getUserRole()}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-center w-full px-3 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                                    >
                                        <span className="mr-2">🚪</span>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                                        isActive(item.path)
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-[#212121] hover:bg-gray-100 hover:text-blue-600'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            
                            {/* Mobile Auth Buttons */}
                            <div className="pt-4 pb-3 border-t border-gray-200">
                                <div className="space-y-2">
                                    <Link
                                        to="/signin"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center px-3 py-3 rounded-xl text-base font-medium text-[#212121] hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
                                    >
                                        <span className="mr-2">🔑</span>
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center px-3 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-[#212121] to-gray-800 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                                    >
                                        <span className="mr-2">🚀</span>
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
