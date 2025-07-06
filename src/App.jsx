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
import StressTracking from './pages/StressTracking'
import StressScore from './pages/StressScore'
import AiChat from './pages/AiChat'
import Consultants from './pages/Consultants'
import Features from './pages/Features'
import About from './pages/About'
import Contact from './pages/Contact'
import { ToastProvider } from './contexts/ToastContext'

function App() {
  const [count, setCount] = useState(0)

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stress-tracking" element={<StressTracking />} />
            <Route path="stress-score" element={<StressScore />} />
            <Route path="ai-chat" element={<AiChat />} />
            <Route path="consultants" element={<Consultants />} />
            <Route path="features" element={<Features />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          <Route path="signin" element={<SignIn />} />
          <Route path='signup' element={<SignUp />} />
          {/* <Route path="register" element={<Register />} /> */}
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
