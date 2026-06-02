import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { dateKey, fmtDate, hashPin } from '../utils'
import { BookOpen, Lock, Sparkles } from 'lucide-react'

const PROMPTS = [
  "What made you smile today, even for just a moment?",
  "Describe one challenge you faced and what it taught you.",
  "What's one thing you're grateful for right now?",
  "If you could send a message to your future self, what would it say?",
  "What's been weighing on your mind lately, and how might you release it?",
  "Describe a small win you had today — no win is too small.",
  "What's one habit or thought pattern you want to change, and why?"
]

export default function Journal() {
  const { journal, saveJournal, showToast, journalPin } = useStore()
  
  const [jOffset, setJOffset] = useState(0)
  const [content, setContent] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [loadingPrompt, setLoadingPrompt] = useState(false)

  // Security layer
  const [isUnlocked, setIsUnlocked] = useState(!journalPin)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  const key = dateKey(jOffset)
  
  // Load entry when offset changes
  useEffect(() => {
    setContent(journal[key] || '')
    setAiPrompt('')
  }, [key, journal])

  const w = content.trim().split(/\s+/).filter(Boolean).length

  const handleSave = () => {
    if (!content.trim()) {
      showToast('Nothing to save')
      return
    }
    saveJournal(key, content.trim())
    showToast('Entry saved')
  }

  const handleAiPrompt = async () => {
    setLoadingPrompt(true)
    setAiPrompt('Generating your prompt…')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Give me a short, thoughtful journaling prompt for today. Please just respond with the core prompt text, nothing else.' }] })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiPrompt(data.text)
    } catch (e) {
      setAiPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
    } finally {
      setLoadingPrompt(false)
    }
  }

  const jumpJournal = (targetKey) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const target = new Date(targetKey); target.setHours(0, 0, 0, 0)
    setJOffset(Math.round((target - today) / 86400000))
  }

  const handleUnlock = async () => {
    const hashed = await hashPin(pinInput)
    if (hashed === journalPin) {
      setIsUnlocked(true)
      setPinInput('')
      setPinError('')
    } else {
      setPinError('Incorrect PIN')
      setPinInput('')
    }
  }

  if (!isUnlocked) {
    return (
      <div className="section active" id="sec-journal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Lock size={40} strokeWidth={1.5} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", marginBottom: '1rem' }}>Journal Locked</h2>
          <p style={{ color: 'var(--md)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Enter your PIN to access your private entries.</p>
          <input 
            type="password" 
            className="chat-in" 
            placeholder="PIN" 
            value={pinInput} 
            onChange={e => setPinInput(e.target.value)} 
            onKeyDown={e => { if (e.key === 'Enter') handleUnlock() }}
            autoFocus
          />
          {pinError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>{pinError}</div>}
          <button className="btn btn-wide" onClick={handleUnlock}>Unlock</button>
        </div>
      </div>
    )
  }

  const entries = Object.entries(journal).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div className="section active" id="sec-journal">
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={28} strokeWidth={2} /> Journal
          </h1>
          <p>Capture your thoughts, feelings and reflections</p>
        </div>
        {journalPin && (
          <button className="btn-ghost" onClick={() => setIsUnlocked(false)} style={{ margin: 0, padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} strokeWidth={2} /> Lock
          </button>
        )}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="j-nav">
            <button className="j-btn" onClick={() => setJOffset(p => p - 1)}>‹</button>
            <div className="j-date">
              {jOffset === 0 ? 'Today — ' + fmtDate(key) : fmtDate(key)}
            </div>
            <button className="j-btn" onClick={() => setJOffset(p => p + 1)}>›</button>
          </div>
          <textarea
            className="gt"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"What's on your mind today?\n\nWrite freely — this is your private space."}
            style={{ minHeight: '220px' }}
          />
          <div className="wc">{w} word{w !== 1 ? 's' : ''}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-wide" onClick={handleSave} style={{ margin: '0', flex: 1 }}>Save Entry</button>
            <button className="btn-ghost" onClick={handleAiPrompt} disabled={loadingPrompt} style={{ padding: '9px 14px', borderRadius: 'var(--rs)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} strokeWidth={2} /> Prompt me
            </button>
          </div>
          {aiPrompt && (
            <div style={{ marginTop: '.75rem', padding: '10px 14px', background: 'rgba(110,231,183,.08)', border: '1px solid rgba(110,231,183,.2)', borderRadius: 'var(--rs)', fontSize: '.82rem', color: 'var(--gb)', lineHeight: '1.6' }}>
              {aiPrompt}
            </div>
          )}
        </div>

        <div className="card">
          <div className="ct">Past Entries</div>
          <div className="j-entry-list" style={{ maxHeight: '360px' }}>
            {entries.length ? entries.map(([k, v]) => (
              <div key={k} className="j-entry-item" onClick={() => jumpJournal(k)}>
                <div className="j-entry-date">{fmtDate(k)}</div>
                <div className="j-entry-preview">{v.slice(0, 80)}{v.length > 80 ? '…' : ''}</div>
              </div>
            )) : (
              <div className="empty">No entries yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
