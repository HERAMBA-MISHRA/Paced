import { useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'

import Overview from './components/Overview'
import Journal from './components/Journal'
import Todos from './components/Todos'
import Habits from './components/Habits'
import Roadmap from './components/Roadmap'
import Calendar from './components/Calendar'
import Analytics from './components/Analytics'
import WeeklyReview from './components/WeeklyReview'
import AICoach from './components/AICoach'

import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return <div className="section active">Loading auth...</div>
  if (!isSignedIn) return <Navigate to="/login" replace />
  return children
}

function DashboardLayout() {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { user } = useUser()
  const userName = user?.fullName || user?.username || user?.firstName || 'User'

  const [theme, setTheme] = useState(
    localStorage.getItem('paced-theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme', theme
    )
    localStorage.setItem('paced-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      {/* Hamburger — hidden on desktop, shown via CSS on mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          padding: '8px 10px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)'
        }}
        className="hamburger-btn"
      >
        <div style={{width:'20px',height:'2px',background:'#fff',margin:'4px 0'}}/>
        <div style={{width:'20px',height:'2px',background:'#fff',margin:'4px 0'}}/>
        <div style={{width:'20px',height:'2px',background:'#fff',margin:'4px 0'}}/>
      </button>

      {/* Dark backdrop when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 998,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Sidebar wrapper — slides in on mobile */}
      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          activeSection={activeSection}
          onNav={(s) => { setActiveSection(s); setSidebarOpen(false) }}
        />
      </div>

      <main className="main" id="main">
        <div className="top-bar">
          <div className="top-bar-left">
            <span className="top-brand">Paced</span>
          </div>
          <div className="top-bar-right">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Toggle theme"
              style={{ width: '38px', height: '38px', borderRadius: '50%', fontSize: '16px' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="avatar" id="av">
              {userName?.slice(0, 2).toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        {activeSection === 'overview' && <Overview />}
        {activeSection === 'journal' && <Journal />}
        {activeSection === 'todos' && <Todos />}
        {activeSection === 'habits' && <Habits />}
        {activeSection === 'roadmap' && <Roadmap />}
        {activeSection === 'calendar' && <Calendar />}
        {activeSection === 'analytics' && <Analytics />}
        {activeSection === 'weekly' && <WeeklyReview />}
        {activeSection === 'ai' && <AICoach />}
      </main>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <div className={`bnav-item ${activeSection === 'overview' ? 'active' : ''}`} 
            onClick={() => setActiveSection('overview')}>
            <span className="bnav-icon">⌂</span>
            <span className="bnav-label">Overview</span>
          </div>
          <div className={`bnav-item ${activeSection === 'journal' ? 'active' : ''}`} 
            onClick={() => setActiveSection('journal')}>
            <span className="bnav-icon">✎</span>
            <span className="bnav-label">Journal</span>
          </div>
          <div className={`bnav-item ${activeSection === 'todos' ? 'active' : ''}`} 
            onClick={() => setActiveSection('todos')}>
            <span className="bnav-icon">✓</span>
            <span className="bnav-label">Tasks</span>
          </div>
          <div className={`bnav-item ${activeSection === 'habits' ? 'active' : ''}`} 
            onClick={() => setActiveSection('habits')}>
            <span className="bnav-icon">↻</span>
            <span className="bnav-label">Habits</span>
          </div>
          <div className={`bnav-item ${activeSection === 'roadmap' ? 'active' : ''}`} 
            onClick={() => setActiveSection('roadmap')}>
            <span className="bnav-icon">🗺️</span>
            <span className="bnav-label">Roadmap</span>
          </div>
          <div className={`bnav-item ${activeSection === 'calendar' ? 'active' : ''}`} 
            onClick={() => setActiveSection('calendar')}>
            <span className="bnav-icon">📅</span>
            <span className="bnav-label">Calendar</span>
          </div>
          <div className={`bnav-item ${activeSection === 'analytics' ? 'active' : ''}`} 
            onClick={() => setActiveSection('analytics')}>
            <span className="bnav-icon">📊</span>
            <span className="bnav-label">Analytics</span>
          </div>
          <div className={`bnav-item ${activeSection === 'weekly' ? 'active' : ''}`} 
            onClick={() => setActiveSection('weekly')}>
            <span className="bnav-icon">🗓️</span>
            <span className="bnav-label">Weekly</span>
          </div>
          <div className={`bnav-item ${activeSection === 'ai' ? 'active' : ''}`} 
            onClick={() => setActiveSection('ai')}>
            <span className="bnav-icon">🤖</span>
            <span className="bnav-label">AI Coach</span>
          </div>
        </div>
      </nav>

      <Toast />
    </>
  )
}

export default function App() {
  return (
    <>
      <div className="bg"><div className="orb o1"></div><div className="orb o2"></div><div className="orb o3"></div></div>
      
      <div id="app">
        <Routes>
          <Route path="/login/*" element={<SignInPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  )
}

