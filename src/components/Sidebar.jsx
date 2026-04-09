import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useStore } from '../store'
import { calcStreak } from '../utils'

export default function Sidebar({ activeSection, onNav }) {
  const habits = useStore(s => s.habits)
  const maxHStreak = habits.reduce((m, h) => Math.max(m, calcStreak(h)), 0)

  const { user } = useUser()
  const navigate = useNavigate()

  const navItems = [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'journal', icon: '📔', label: 'Journal' },
    { id: 'todos', icon: '✅', label: 'To-Do List' },
    { id: 'habits', icon: '🔁', label: 'Habits' },
    { id: 'roadmap', icon: '🗺️', label: 'Roadmap' },
    { id: 'calendar', icon: '📅', label: 'Calendar' }
  ]

  const insightItems = [
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'weekly', icon: '🗓️', label: 'Weekly Review' },
    { id: 'ai', icon: '🤖', label: 'AI Coach' }
  ]

  return (
    <aside className="sb">
      <div className="sb-section">Main</div>
      {navItems.map(item => (
        <div key={item.id} className={`nav-item ${activeSection === item.id ? 'active' : ''}`} onClick={() => onNav(item.id)}>
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}

      <div className="sb-section">Insights</div>
      {insightItems.map(item => (
        <div key={item.id} className={`nav-item ${activeSection === item.id ? 'active' : ''}`} onClick={() => onNav(item.id)}>
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}

      <div className="sb-footer">
        <div className="sb-user" onClick={() => navigate('/profile')}>
          {user ? (
            <img src={user.imageUrl} alt="Avatar" className="avatar" style={{ padding: 0, objectFit: 'cover' }} />
          ) : (
            <div className="avatar" id="av">JS</div>
          )}
          <div className="sb-user-info">
            <div className="sb-user-name">{user ? (user.fullName || user.firstName || user.username || 'User') : 'User'}</div>
            <div className="sb-user-sub">Best streak: {maxHStreak} days</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

