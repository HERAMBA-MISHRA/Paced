import { useStore } from '../store'
import { BarChart3 } from 'lucide-react'

export default function Analytics() {
  const { taskLog, journal, habits } = useStore()
  
  const days = []
  const lbls = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d)
  }

  // Task chart
  const maxT = Math.max(1, ...days.map(d => taskLog[d.toISOString().split('T')[0]] || 0))
  
  return (
    <div className="section active" id="sec-analytics">
      <div className="ph">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={28} strokeWidth={2} /> Analytics
        </h1>
        <p>Your progress at a glance</p>
      </div>

      <div className="grid2" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="ct">Tasks Completed — Last 7 Days</div>
          <div className="chart-wrap">
            {days.map((d, i) => {
              const k = d.toISOString().split('T')[0]
              const v = taskLog[k] || 0
              const h = Math.max(8, Math.round((v / maxT) * 100))
              const isToday = i === 6
              
              return (
                <div key={k} className="bar-col">
                  <div className="bar-val">{v}</div>
                  <div className={`bar ${isToday ? 'active' : ''}`} style={{ height: `${h}px` }}></div>
                  <div className="bar-lbl">{lbls[d.getDay()]}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <div className="ct">Journal Activity — Last 7 Days</div>
          <div className="chart-wrap">
            {days.map((d, i) => {
              const k = d.toISOString().split('T')[0]
              const v = journal[k] ? 1 : 0
              const isToday = i === 6
              
              return (
                <div key={k} className="bar-col">
                  <div className="bar-val">{v ? '✓' : ''}</div>
                  <div className={`bar ${v ? 'active' : ''}`} style={{ height: `${v ? 80 : 10}px` }}></div>
                  <div className="bar-lbl">{lbls[d.getDay()]}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="ct">Habit Completion Rate (All Time)</div>
        <div>
          {habits.length ? habits.map((h, i) => {
            const total = h.dates ? h.dates.length : 0
            const pct = Math.min(100, Math.round((total / 30) * 100))
            
            return (
              <div key={h.id || i} className="habit-rate-row">
                <div className="habit-rate-name">{h.name}</div>
                <div className="habit-rate-track">
                  <div className="habit-rate-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <div className="habit-rate-pct">{total}d</div>
              </div>
            )
          }) : (
            <div className="empty">No habits yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
