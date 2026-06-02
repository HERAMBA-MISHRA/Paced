import { useStore } from '../store'
import { calcStreak, calcJournalStreak, todayKey, fmtDate, ACH } from '../utils'
import { useState, useEffect } from 'react'
import { getRoadmaps, getMilestonesByRoadmap } from '../db'
import { Trophy, Flame } from 'lucide-react'

export default function Overview() {
  const { todos, habits, journal, achievements, toggleTodo, toggleHabitDate } = useStore()

  const [roadmapProgress, setRoadmapProgress] = useState(0)

  useEffect(() => {
    async function loadProgress() {
      try {
        const r = await getRoadmaps()
        let totalM = 0
        let doneM = 0
        for (const rm of r) {
          const ms = await getMilestonesByRoadmap(rm.id)
          totalM += ms.length
          doneM += ms.filter(m => m.completed).length
        }
        if (totalM === 0) setRoadmapProgress(0)
        else setRoadmapProgress(Math.round((doneM / totalM) * 100))
      } catch (err) {
        console.error(err)
      }
    }
    loadProgress()
  }, [])

  const h = new Date().getHours()
  const greet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'
  const today = todayKey()

  const todosTotal = todos.length
  const todosDone = todos.filter(t => t.done).length
  const habitsToday = habits.filter(h => h.dates && h.dates.includes(today)).length
  const jStreak = calcJournalStreak(journal)

  const pendingTodos = todos.filter(t => !t.done).slice(0, 5)

  return (
    <div className="section active" id="sec-overview">
      <div className="ph">
        <div className="ph-row">
          <div>
            <h1>{greet}</h1>
            <p>{fmtDate(today)}</p>
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.9rem', color: 'var(--md)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={16} strokeWidth={1.8} /> {achievements.length}/{ACH.length} achievements
          </div>
        </div>
      </div>

      <div className="grid4" style={{ marginBottom: '1.25rem' }}>
        <div className="stat"><div className="stat-n" style={{ color: 'var(--ga)' }}>{todosDone}/{todosTotal}</div><div className="stat-l">Tasks Done Today</div></div>
        <div className="stat"><div className="stat-n" style={{ color: 'var(--gb)' }}>{habitsToday}/{habits.length}</div><div className="stat-l">Habits Checked</div></div>
        <div className="stat"><div className="stat-n" style={{ color: 'var(--accent-purple)' }}>{roadmapProgress}%</div><div className="stat-l">ROADMAP PROGRESS</div></div>
        <div className="stat"><div className="stat-n" style={{ color: 'var(--gd)' }}>{jStreak} days</div><div className="stat-l">Journal Streak</div></div>
      </div>

      <div className="grid2" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="ct">Today's Habits</div>
          {habits.length ? (
            habits.map((h, i) => {
              const done = h.dates && h.dates.includes(today)
              const streak = calcStreak(h)
              return (
                <div key={i} className="habit-card" style={{ marginBottom: '6px', padding: '.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.88rem' }}>{h.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '.75rem', color: 'var(--md)', display: 'flex', alignItems: 'center', gap: '3px' }}><Flame size={12} strokeWidth={2} />{streak}</span>
                      <div className={`chk ${done ? 'done' : ''}`} onClick={() => toggleHabitDate(i, today)}></div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="empty">No habits yet — add some in Habits</div>
          )}
        </div>
        <div className="card">
          <div className="ct">Pending Tasks</div>
          <ul className="todo-list" style={{ maxHeight: '180px' }}>
            {pendingTodos.length ? pendingTodos.map(t => (
              <li key={t.id} className="todo-item">
                <div className="chk" onClick={() => toggleTodo(t.id, today)}></div>
                <span className="todo-txt">{t.text}</span>
                <span className={`priority-badge p-${t.priority}`}>{t.priority}</span>
              </li>
            )) : (
              <li className="empty">All caught up!</li>
            )}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="ct">Achievements</div>
        <div className="ach-grid">
          {ACH.map(a => {
            const earned = achievements.includes(a.id)
            return (
              <div key={a.id} className={`ach ${earned ? 'earned' : ''}`}>
                <span className="ach-icon">{a.icon}</span>
                <div className="ach-name">{a.name}</div>
                <div className="ach-desc">{a.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
