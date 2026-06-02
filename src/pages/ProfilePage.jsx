import { useState } from 'react'
import { useUser, SignOutButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { useStore } from '../store'
import { hashPin } from '../utils'
import { exportDataToFile, importDataFromFile } from '../db'
import { Lock, Unlock } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const { journalPin, setJournalPin, showToast } = useStore()

  const [pinMode, setPinMode] = useState(null) // 'set', 'remove'
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [error, setError] = useState('')

  const fileInputRef = useRef(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await importDataFromFile(file)
      window.location.reload()
    } catch (err) {
      alert('Failed to import data: Invalid file format.')
    }
  }

  if (!user) return null

  const handleSetPin = async () => {
    if (newPin.length < 4) { setError('PIN must be at least 4 chars'); return }
    const hashed = await hashPin(newPin)
    setJournalPin(hashed)
    showToast('Journal PIN set!')
    setPinMode(null)
    setNewPin('')
    setError('')
  }

  const handleRemovePin = async () => {
    const hashed = await hashPin(currentPin)
    if (hashed !== journalPin) { setError('Incorrect PIN'); return }
    setJournalPin(null)
    showToast('Journal PIN removed')
    setPinMode(null)
    setCurrentPin('')
    setError('')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', marginBottom: '1rem' }}>
        <img 
          src={user.imageUrl} 
          alt="Avatar" 
          style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem', objectFit: 'cover' }} 
        />
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', marginBottom: '0.2rem' }}>
          {user.fullName || user.firstName || user.username || 'User'}
        </h2>
        <p style={{ color: 'var(--md)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {user.primaryEmailAddress?.emailAddress}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="btn btn-wide" onClick={() => navigate('/')}>Back to Dashboard</button>
          
          <SignOutButton signOutCallback={() => navigate('/login')}>
            <button className="btn-ghost btn-wide" style={{ color: 'var(--danger)', borderColor: 'rgba(248,113,113,0.3)' }}>
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px', marginBottom: '1rem' }}>
        <div className="ct">Data Management</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={exportDataToFile}>Export Data</button>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={handleImportClick}>Import Data</button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".json" />
        </div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="ct">Journal Security</div>
        
        {!pinMode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {journalPin ? <><Lock size={16} strokeWidth={2} /> PIN Lock is Active</> : <><Unlock size={16} strokeWidth={2} /> Journal is Unlocked</>}
            </span>
            <button className="btn-ghost" onClick={() => setPinMode(journalPin ? 'remove' : 'set')} style={{ padding: '6px 12px', fontSize: '0.8rem', margin: 0 }}>
              {journalPin ? 'Remove PIN' : 'Set PIN'}
            </button>
          </div>
        )}

        {pinMode === 'set' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--md)', margin: 0 }}>Enter a new PIN to lock your journal.</p>
            <input 
              type="password" 
              className="chat-in" 
              placeholder="New PIN (min 4 chars)" 
              value={newPin} 
              onChange={e => setNewPin(e.target.value)} 
              maxLength={20}
            />
            {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button className="btn" style={{ flex: 1, margin: 0 }} onClick={handleSetPin}>Save</button>
              <button className="btn-ghost" style={{ flex: 1, margin: 0 }} onClick={() => { setPinMode(null); setError('') }}>Cancel</button>
            </div>
          </div>
        )}

        {pinMode === 'remove' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--md)', margin: 0 }}>Enter your current PIN to remove the lock.</p>
            <input 
              type="password" 
              className="chat-in" 
              placeholder="Current PIN" 
              value={currentPin} 
              onChange={e => setCurrentPin(e.target.value)} 
            />
            {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button className="btn" style={{ flex: 1, margin: 0, background: 'var(--danger)', color: 'black' }} onClick={handleRemovePin}>Remove</button>
              <button className="btn-ghost" style={{ flex: 1, margin: 0 }} onClick={() => { setPinMode(null); setError('') }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
