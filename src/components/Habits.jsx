import { useState } from 'react'
import { useStore } from '../store'
import { calcStreak } from '../utils'
import { Repeat, Flame, X } from 'lucide-react'

export default function Habits() {
  const { habits, addHabit, toggleHabitDate, deleteHabit, showToast } = useStore()
  const [habitIn, setHabitIn] = useState('')

  const handleAdd = () => {
    const v = habitIn.trim()
    if (!v) return
    addHabit({
      id: Date.now(),
      name: v,
      dates: []
    })
    setHabitIn('')
    showToast('Habit added')
  }

  const days = []
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      key: d.toISOString().split('T')[0],
      lbl: dayLabels[d.getDay()],
      isToday: i === 0
    })
  }

  return (
    <div className="section active" id="sec-habits">
      <div className="ph">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Repeat size={28} strokeWidth={2} /> Habit Tracker
        </h1>
        <p>Build consistency — one day at a time</p>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="ct">Add New Habit</div>
        <div className="row">
          <input
            className="gi"
            value={habitIn}
            onChange={(e) => setHabitIn(e.target.value)}
            placeholder="e.g. Read 30 mins, Meditate, Exercise…"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          />
          <button className="btn" onClick={handleAdd}>Add Habit</button>
        </div>
      </div>

      <div className="card">
        <div className="ct">Your Habits — Last 7 Days</div>
        <div>
          {habits.length ? habits.map((h, i) => (
            <div key={h.id || i} className="habit-card">
              <div className="habit-top">
                <div>
                  <div className="habit-name">{h.name}</div>
                  <div className="habit-streak"><Flame size={14} strokeWidth={2} /> {calcStreak(h)} day streak</div>
                </div>
                <div className="habit-actions">
                  <button className="del" onClick={() => deleteHabit(i)}><X size={14} /></button>
                </div>
              </div>
              <div className="habit-week">
                {days.map((day) => {
                  const done = h.dates && h.dates.includes(day.key)
                  return (
                    <div
                      key={day.key}
                      className={`habit-day ${done ? 'done' : ''} ${day.isToday ? 'today' : ''}`}
                      onClick={() => toggleHabitDate(i, day.key)}
                      title={day.key}
                    >
                      {done ? '✓' : '·'}
                      <span>{day.lbl}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )) : (
            <div className="empty">No habits yet — add one above!</div>
          )}
        </div>
      </div>
    </div>
  )
}
