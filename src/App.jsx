import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Navbar from './components/Navbar'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import HrDashboard from './pages/HrDashboard'
import HrPsychiatristManagement from './pages/HrConsultantManagement'
import StressScore from './pages/StressScore'
import AiChat from './pages/AiChat'
import Consultants from './pages/Consultants'
import AdminDashboard from './pages/AdminDashboard'
import AdminSignUp from './pages/AdminSignUp'
import TaskManagement from './pages/TaskManagement'
import SupervisorTaskManagement from './pages/SupervisorTaskManagement'
import SupervisorStressMonitoring from './pages/SupervisorStressMonitoring'
import Features from './pages/Features'
import About from './pages/About'
import Contact from './pages/Contact'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DebugInfo from './components/DebugInfo'
import RoleChangeHandler from './components/RoleChangeHandler'
import RoleTestComponent from './components/RoleTestComponent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard" element={
                <ProtectedRoute>
                  <HrDashboard />
                </ProtectedRoute>
              } />
              <Route path="hr-psychiatrist-management" element={
                <ProtectedRoute>
                  <HrPsychiatristManagement />
                </ProtectedRoute>
              } />
              <Route path="stress-score" element={
                <ProtectedRoute>
                  <StressScore />
                </ProtectedRoute>
              } />
              <Route path="ai-chat" element={
                <ProtectedRoute>
                  <AiChat />
                </ProtectedRoute>
              } />
              <Route path="psychiatrists" element={
                <ProtectedRoute>
                  <Consultants />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="task-management" element={
                <ProtectedRoute>
                  <TaskManagement />
                </ProtectedRoute>
              } />
              <Route path="supervisor/task-management" element={
                <ProtectedRoute>
                  <SupervisorTaskManagement />
                </ProtectedRoute>
              } />
              <Route path="supervisor/stress-monitoring" element={
                <ProtectedRoute>
                  <SupervisorStressMonitoring />
                </ProtectedRoute>
              } />
              <Route path="features" element={<Features />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
            </Route>

            <Route path="signin" element={<SignIn />} />
            <Route path='signup' element={<SignUp />} />
            <Route path='admin-signup' element={<AdminSignUp />} />
            {/* <Route path="register" element={<Register />} /> */}
          </Routes>
          <RoleChangeHandler />
          <RoleTestComponent />
          <DebugInfo />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
