import React, { useState, useEffect } from 'react'
import { addEvent, getEventsByMonth, deleteEvent, updateEvent } from '../db'
import { todayKey } from '../utils'

const TYPE_COLORS = {
  meeting: { bg: 'rgba(56,189,248,0.2)', border: '#38BDF8', icon: '🔵' },
  personal: { bg: 'rgba(110,231,183,0.2)', border: '#6EE7B7', icon: '🟢' },
  deadline: { bg: 'rgba(248,113,113,0.2)', border: '#F87171', icon: '🔴' },
  roadmap: { bg: 'rgba(167,139,250,0.2)', border: '#A78BFA', icon: '🟣' }
}

const parseDateKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dy}`
}

const parseTime = (t) => {
  if(!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

const getTopOffset = (startTime) => {
  const mins = parseTime(startTime) - (6 * 60)
  return (mins / 60) * 60
}

const getHeight = (start, end) => {
  const h = parseTime(end) - parseTime(start)
  return Math.max(h, 20)
}

export default function Calendar() {
  const [view, setView] = useState('month')
  const [baseDate, setBaseDate] = useState(new Date())
  const [events, setEvents] = useState([])
  
  const [isEventPanelOpen, setIsEventPanelOpen] = useState(false)
  const [isDayPanelOpen, setIsDayPanelOpen] = useState(false)
  const [selectedDayKey, setSelectedDayKey] = useState(todayKey())
  
  const [winW, setWinW] = useState(window.innerWidth)
  const [mobileOffset, setMobileOffset] = useState(0)

  const emptyForm = { id: null, title: '', date: todayKey(), startTime: '09:00', endTime: '10:00', type: 'meeting', notes: '' }
  const [evForm, setEvForm] = useState(emptyForm)

  useEffect(() => {
    const handleR = () => setWinW(window.innerWidth)
    window.addEventListener('resize', handleR)
    return () => window.removeEventListener('resize', handleR)
  }, [])
  const isMobile = winW <= 768

  const loadEvents = async () => {
    const y = baseDate.getFullYear()
    const m = baseDate.getMonth() + 1
    const ms = [
      new Date(y, m-2, 1),
      new Date(y, m-1, 1),
      new Date(y, m, 1)
    ]
    let all = []
    for(const d of ms) {
      const res = await getEventsByMonth(d.getFullYear(), d.getMonth() + 1)
      all = [...all, ...res]
    }
    setEvents(all)
  }

  useEffect(() => { loadEvents() }, [baseDate])

  const handlePrev = () => {
    const nd = new Date(baseDate)
    if(view === 'month') nd.setMonth(nd.getMonth() - 1)
    if(view === 'week') nd.setDate(nd.getDate() - 7)
    if(view === 'day') nd.setDate(nd.getDate() - 1)
    setBaseDate(nd)
    setMobileOffset(0)
  }

  const handleNext = () => {
    const nd = new Date(baseDate)
    if(view === 'month') nd.setMonth(nd.getMonth() + 1)
    if(view === 'week') nd.setDate(nd.getDate() + 7)
    if(view === 'day') nd.setDate(nd.getDate() + 1)
    setBaseDate(nd)
    setMobileOffset(0)
  }

  const getHeaderLabel = () => {
    if(view === 'month') return baseDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    if(view === 'week') {
      const start = new Date(baseDate)
      const day = start.getDay() || 7
      start.setDate(start.getDate() - day + 1)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return `${start.toLocaleDateString('default', {month:'short', day:'numeric'})} - ${end.toLocaleDateString('default', {month:'short', day:'numeric'})}, ${start.getFullYear()}`
    }
    if(view === 'day') return baseDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const handleSaveEvent = async () => {
    if(!evForm.title || !evForm.date) return
    if(evForm.id) {
      await updateEvent(evForm.id, evForm)
    } else {
      await addEvent(evForm)
    }
    setIsEventPanelOpen(false)
    loadEvents()
  }

  const handleDeleteEvent = async (id = evForm.id) => {
    if(!id) return
    await deleteEvent(id)
    setIsEventPanelOpen(false)
    loadEvents()
  }

  const openForm = (evObj = null, dateKey = null) => {
    if(evObj) {
      setEvForm(evObj)
    } else {
      setEvForm({ ...emptyForm, date: dateKey || todayKey() })
    }
    setIsEventPanelOpen(true)
  }

  const renderMonth = () => {
    const y = baseDate.getFullYear()
    const m = baseDate.getMonth()
    const firstDay = new Date(y, m, 1)
    let startOffset = firstDay.getDay() || 7
    startOffset -= 1
    
    const startDate = new Date(y, m, 1 - startOffset)
    const days = []
    for(let i=0; i<42; i++) {
        const d = new Date(startDate)
        d.setDate(d.getDate() + i)
        days.push(d)
    }
    
    return (
      <div className="cal-month-grid">
         {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(wd => <div key={wd} className="cal-dh">{wd}</div>)}
         {days.map(d => {
            const dKey = parseDateKey(d)
            const isToday = dKey === todayKey()
            const isCurrMonth = d.getMonth() === m
            const dayEvents = events.filter(e => e.date === dKey)
            
            return (
              <div key={dKey} className={`cal-cell ${!isCurrMonth ? 'out-month' : ''} ${[0,6].includes(d.getDay()) ? 'weekend' : ''}`}
                   onClick={() => { setSelectedDayKey(dKey); setIsDayPanelOpen(true) }}>
                <div className={`cal-dn ${isToday ? 'today' : ''}`}>{d.getDate()}</div>
                <div className="cal-evs">
                   {dayEvents.slice(0,3).map(e => (
                     <div key={e.id} className="cal-ev-pill" style={{backgroundColor: TYPE_COLORS[e.type]?.bg || 'rgba(255,255,255,0.1)', borderLeft: `2px solid ${TYPE_COLORS[e.type]?.border || '#fff'}`}}>
                       <span className="dot" style={{background: TYPE_COLORS[e.type]?.border || '#fff'}}></span>
                       <span className="txt">{e.title}</span>
                     </div>
                   ))}
                   {dayEvents.length > 3 && <div className="cal-ev-more">+{dayEvents.length - 3} more</div>}
                </div>
              </div>
            )
         })}
      </div>
    )
  }

  const renderTimeColumnContent = (daysArr) => {
    const hours = []
    for(let i=6; i<=23; i++) hours.push(String(i).padStart(2, '0') + ':00')
    
    return (
      <>
        <div className="cal-week-header">
           <div className="cal-time-col"></div>
           {daysArr.map(d => (
             <div key={d.toString()} className="cal-wh-day">
               {d.toLocaleDateString('default', {weekday:'short', day:'numeric'})}
             </div>
           ))}
        </div>
        <div className="cal-week-body">
           <div className="cal-time-axis">
             {hours.map(h => <div key={h} className="cal-time-slot">{h}</div>)}
           </div>
           {daysArr.map(d => {
              const dKey = parseDateKey(d)
              const dayEvents = events.filter(e => e.date === dKey)
              
              return (
                <div key={dKey} className="cal-day-col">
                  {hours.map(h => <div key={h} className="cal-grid-cell"></div>)}
                  {dayEvents.map(e => {
                     const topPx = getTopOffset(e.startTime)
                     const heightPx = getHeight(e.startTime, e.endTime)
                     if(topPx < 0) return null
                     
                     return (
                       <div key={e.id} className="cal-ev-block" style={{
                         top: topPx, height: heightPx,
                         background: TYPE_COLORS[e.type]?.bg || 'rgba(255,255,255,0.1)',
                         borderLeft: `3px solid ${TYPE_COLORS[e.type]?.border || '#fff'}`
                       }} onClick={(ev) => { ev.stopPropagation(); openForm(e) }}>
                         <div className="ev-b-title">{e.title}</div>
                         <div className="ev-b-time">{e.startTime} - {e.endTime}</div>
                       </div>
                     )
                  })}
                </div>
              )
           })}
        </div>
      </>
    )
  }

  const renderWeek = () => {
    const start = new Date(baseDate)
    const day = start.getDay() || 7
    start.setDate(start.getDate() - day + 1)
    
    const allDays = []
    for(let i=0; i<7; i++) {
       const d = new Date(start)
       d.setDate(d.getDate() + i)
       allDays.push(d)
    }
    
    let displayDays = allDays
    if (isMobile) {
      displayDays = allDays.slice(mobileOffset, mobileOffset + 3)
    }
    
    return (
      <div className="cal-week-container">
        {isMobile && (
          <div style={{display:'flex', justifyContent:'space-between', padding:'8px', borderBottom:'1px solid var(--glass-border)'}}>
            <button className="btn-ghost" style={{padding:'4px 8px'}} onClick={() => setMobileOffset(Math.max(0, mobileOffset-3))}>← Swipe</button>
            <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Showing {mobileOffset+1} to {Math.min(7, mobileOffset+3)} / 7</span>
            <button className="btn-ghost" style={{padding:'4px 8px'}} onClick={() => setMobileOffset(Math.min(4, mobileOffset+3))}>Swipe →</button>
          </div>
        )}
        {renderTimeColumnContent(displayDays)}
      </div>
    )
  }

  const renderDay = () => {
    return (
      <div className="cal-week-container cal-day-container">
        {renderTimeColumnContent([baseDate])}
      </div>
    )
  }

  return (
    <div className="section active calendar-container" id="sec-calendar">
      <style>{`
        #sec-calendar { display: flex; flex-direction: column; gap: 1rem; position: relative; overflow-x: hidden; height: 100%; min-height: 85vh; }

        .cal-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
        .cal-dh { text-align: center; font-weight: 600; font-size: 0.85rem; color: var(--text-secondary); padding: 8px 0; }
        .cal-cell { 
          background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px;
          min-height: 110px; padding: 6px; display: flex; flex-direction: column; gap: 4px; cursor: pointer; transition: all var(--transition);
        }
        .cal-cell:hover { background: var(--glass-bg-strong); transform: translateY(-2px); box-shadow: var(--glass-shadow); }
        .cal-cell.out-month { opacity: 0.4; }
        .cal-cell.weekend { background: rgba(0,0,0,0.03); }
        .cal-dn { font-size: 0.85rem; font-weight: 500; align-self: flex-start; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .cal-dn.today { background: var(--accent-purple, #A78BFA); color: #fff; }

        .cal-evs { display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
        .cal-ev-pill { 
          display: flex; align-items: center; gap: 6px; padding: 3px 6px; border-radius: 4px;
          font-size: 0.72rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cal-ev-pill .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .cal-ev-pill .txt { overflow: hidden; text-overflow: ellipsis; color: var(--text-primary); }
        .cal-ev-more { font-size: 0.7rem; color: var(--text-secondary); padding-left: 2px; }

        .cal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
          display: flex; justify-content: flex-end; backdrop-filter: blur(4px);
        }
        .cal-panel {
          width: 420px; max-width: 100vw; background: var(--bg-primary); border-left: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow-hover); height: 100%; overflow-y: auto; padding: 1.5rem;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

        .cal-week-container { display: flex; flex-direction: column; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; box-shadow: var(--glass-shadow); }
        .cal-week-header { display: flex; border-bottom: 1px solid var(--glass-border); background: var(--glass-bg-strong); }
        .cal-time-col { width: 65px; flex-shrink: 0; border-right: 1px solid var(--glass-border); }
        .cal-wh-day { flex: 1; text-align: center; padding: 12px 0; font-weight: 600; font-size: 0.85rem; border-right: 1px solid var(--glass-border); color: var(--text-primary); }
        .cal-wh-day:last-child { border-right: none; }

        .cal-week-body { display: flex; height: 65vh; overflow-y: auto; position: relative; scrollbar-width: thin; }
        .cal-time-axis { width: 65px; flex-shrink: 0; border-right: 1px solid var(--glass-border); background: var(--glass-bg); }
        .cal-time-slot { height: 60px; border-bottom: 1px solid var(--glass-border); font-size: 0.72rem; color: var(--text-muted); text-align: right; padding-right: 8px; padding-top: 4px; }
        .cal-day-col { flex: 1; border-right: 1px solid var(--glass-border); position: relative; min-width: 0; }
        .cal-day-col:last-child { border-right: none; }
        .cal-grid-cell { height: 60px; border-bottom: 1px solid var(--glass-border); opacity: 0.3; }

        .cal-ev-block {
          position: absolute; left: 4px; right: 4px; border-radius: 6px; padding: 6px 8px; overflow: hidden;
          font-size: 0.78rem; color: var(--text-primary); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08); backdrop-filter: blur(8px);
        }
        .cal-ev-block:hover { transform: scale(1.02); z-index: 10; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .ev-b-title { font-weight: 600; margin-bottom: 2px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .ev-b-time { font-size: 0.7rem; opacity: 0.8; }

        @media (max-width: 768px) {
          .cal-month-grid { gap: 4px; }
          .cal-cell { min-height: 70px; padding: 4px; border-radius: 8px; }
          .cal-ev-pill .txt { display: none; }
          .cal-ev-pill { padding: 4px; align-items: center; justify-content: center; }
          .cal-ev-more { font-size: 0.65rem; text-align: center; }
          .cal-panel { width: 100vw; }
        }
      `}</style>
      
      <div className="ph" style={{ marginBottom: 0 }}>
        <div className="ph-row" style={{ alignItems: 'center' }}>
          <div>
            <h1>Calendar</h1>
            <p>Schedule your meetings and events</p>
          </div>
          <button className="btn" onClick={() => openForm()} style={{ padding: '10px 16px' }}>
            + New Event
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['month', 'week', 'day'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: view === v ? 'var(--glass-bg-strong)' : 'transparent',
                color: view === v ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: view === v ? 600 : 400,
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {v}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="cal-nav-btn" onClick={handlePrev} style={{ padding: '6px 12px' }}>← Prev</button>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: '160px', textAlign: 'center' }}>{getHeaderLabel()}</span>
          <button className="cal-nav-btn" onClick={handleNext} style={{ padding: '6px 12px' }}>Next →</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {view === 'month' && renderMonth()}
        {view === 'week' && renderWeek()}
        {view === 'day' && renderDay()}
      </div>

      {isEventPanelOpen && (
        <div className="cal-overlay" onClick={() => setIsEventPanelOpen(false)}>
          <div className="cal-panel" onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{evForm.id ? 'Edit Event' : 'New Event'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Title</label>
                <input className="gi" style={{ width: '100%' }} value={evForm.title} onChange={e=>setEvForm({...evForm, title: e.target.value})} placeholder="Event title..." />
              </div>
              
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Date</label>
                <input className="gi" type="date" style={{ width: '100%' }} value={evForm.date} onChange={e=>setEvForm({...evForm, date: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Start Time</label>
                  <input className="gi" type="time" style={{ width: '100%' }} value={evForm.startTime} onChange={e=>setEvForm({...evForm, startTime: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>End Time</label>
                  <input className="gi" type="time" style={{ width: '100%' }} value={evForm.endTime} onChange={e=>setEvForm({...evForm, endTime: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Type</label>
                <select className="sel" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }} value={evForm.type} onChange={e=>setEvForm({...evForm, type: e.target.value})}>
                  <option value="meeting">🔵 Meeting</option>
                  <option value="personal">🟢 Personal</option>
                  <option value="deadline">🔴 Deadline</option>
                  <option value="roadmap">🟣 Roadmap milestone</option>
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Notes (optional)</label>
                <textarea className="gi" style={{ width: '100%', minHeight: '100px', resize: 'vertical' }} value={evForm.notes} onChange={e=>setEvForm({...evForm, notes: e.target.value})} placeholder="Add any details..." />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button className="btn" style={{ flex: 1, padding: '12px' }} onClick={handleSaveEvent}>Save Event</button>
                <button className="btn-ghost" style={{ flex: 1, padding: '12px' }} onClick={() => setIsEventPanelOpen(false)}>Cancel</button>
              </div>
              
              {evForm.id && (
                <button className="btn-ghost" style={{ color: 'var(--accent-red, #ef4444)', marginTop: '8px', width: '100%' }} onClick={() => handleDeleteEvent(evForm.id)}>
                  🗑️ Delete Event
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isDayPanelOpen && (
        <div className="cal-overlay" onClick={() => setIsDayPanelOpen(false)}>
          <div className="cal-panel" onClick={e=>e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: 0 }}>
                {new Date(selectedDayKey).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <button className="btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setIsDayPanelOpen(false)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.filter(e => e.date === selectedDayKey).length === 0 && (
                <div className="empty" style={{ margin: '2rem 0' }}>No events for this day.</div>
              )}
              
              {events
                .filter(e => e.date === selectedDayKey)
                .sort((a,b) => parseTime(a.startTime) - parseTime(b.startTime))
                .map(e => (
                <div key={e.id} className="card" onClick={() => openForm(e)} style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', cursor: 'pointer',
                  borderLeft: `4px solid ${TYPE_COLORS[e.type]?.border || '#fff'}`,
                  transition: 'transform 0.2s'
                }}>
                   <span style={{ fontSize: '1.4rem' }}>{TYPE_COLORS[e.type]?.icon || '🔵'}</span>
                   <div style={{ flex: 1 }}>
                     <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{e.title}</h4>
                     <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{e.startTime} - {e.endTime}</span>
                   </div>
                   <button className="btn-ghost" style={{ padding: '8px', color: 'var(--accent-red, #ef4444)' }} onClick={(ev) => { ev.stopPropagation(); handleDeleteEvent(e.id) }}>
                     🗑️
                   </button>
                </div>
              ))}
            </div>
            
            <button className="btn" style={{ width: '100%', marginTop: '2rem', padding: '12px' }} onClick={() => {
              setIsDayPanelOpen(false)
              openForm(null, selectedDayKey)
            }}>
              + Add event for this day
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
