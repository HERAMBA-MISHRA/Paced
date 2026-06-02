import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { calcStreak, fmtDate } from '../utils'
import { CalendarRange, Sparkles } from 'lucide-react'

export default function WeeklyReview() {
  const { taskLog, journal, habits, weekRef, saveWeekReflect, showToast } = useStore()
  
  const [reflection, setReflection] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [loading, setLoading] = useState(false)
  
  const getWeekDays = () => {
    const days = []
    for(let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }
  
  const days = getWeekDays()
  const start = fmtDate(days[0])
  const end = fmtDate(days[6])
  const wKey = days[0]

  useEffect(() => {
    setReflection(weekRef[wKey] || '')
  }, [wKey, weekRef])

  const tasksDone = days.reduce((s, k) => s + (taskLog[k] || 0), 0)
  const jEntries = days.filter(k => journal[k]).length
  const habitsHit = habits.reduce((s, h) => s + days.filter(k => h.dates && h.dates.includes(k)).length, 0)
  const maxStreak = habits.reduce((m, h) => Math.max(m, calcStreak(h)), 0)

  const handleSave = () => {
    saveWeekReflect(wKey, reflection)
    showToast('Reflection saved')
  }

  const handleGenSummary = async () => {
    setLoading(true)
    setAiSummary('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Write a 2-3 sentence encouraging weekly review summary based on these stats for the user: completed ${tasksDone} tasks, journaled for ${jEntries} days, checked into habits ${habitsHit} times, and maintained a top streak of ${maxStreak} days. Be encouraging and brief.` }] })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiSummary(data.text)
    } catch (e) {
      setAiSummary(`Here's your weekly review! You completed ${tasksDone} tasks this week, which shows great focus. You journaled for ${jEntries} days, keeping a good record of your thoughts. Your consistency with habits is impressive too, hitting ${habitsHit} check-ins and maintaining a top streak of ${maxStreak} days. Keep up the great work and make next week even better!`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section active" id="sec-weekly">
      <div className="ph">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarRange size={28} strokeWidth={2} /> Weekly Review
        </h1>
        <p>{start} — {end}</p>
      </div>

      <div className="grid4" style={{ marginBottom: '1.25rem' }}>
        <div className="stat"><div className="stat-n" style={{ color: 'var(--ga)' }}>{tasksDone}</div><div className="stat-l">Tasks Done</div></div>
        <div className="stat"><div className="stat-n" style={{ color: 'var(--gb)' }}>{jEntries}</div><div className="stat-l">Journal Days</div></div>
        <div className="stat"><div className="stat-n" style={{ color: 'var(--gc)' }}>{habitsHit}</div><div className="stat-l">Habit Check-ins</div></div>
        <div className="stat"><div className="stat-n" style={{ color: 'var(--gd)' }}>{maxStreak} d</div><div className="stat-l">Best Streak</div></div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="ct">AI Summary <span style={{ fontSize: '.65rem', color: 'var(--lo)', fontWeight: 400, letterSpacing: 0 }}>powered by Claude</span></div>
          <button className="btn btn-wide" onClick={handleGenSummary} style={{ marginBottom: 0, marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
            <Sparkles size={16} strokeWidth={2} /> Generate My Weekly Summary
          </button>
          
          {(aiSummary || loading) && (
            <div className={`ai-response ${loading ? 'loading' : ''}`} style={{ marginTop: '1rem', display: 'block' }}>
              {loading ? 'Generating your weekly summary…' : aiSummary}
            </div>
          )}
        </div>
        
        <div className="card">
          <div className="ct">My Reflection</div>
          <textarea
            className="week-reflect"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={"What went well this week?\nWhat would you do differently?\nWhat are you proud of?"}
          />
          <button className="btn-ghost btn-wide" onClick={handleSave}>Save Reflection</button>
        </div>
      </div>
    </div>
  )
}
