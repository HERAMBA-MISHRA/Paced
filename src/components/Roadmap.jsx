import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import {
  getRoadmaps, createRoadmap,
  getMilestonesByRoadmap, addMilestone, toggleMilestone, updateMilestoneWeeklyTasks,
  addEvent
} from '../db'
import { todayKey } from '../utils'

const SUBJECT_COLORS = ['#38BDF8', '#6EE7B7', '#A78BFA']

const parseTasks = (t) => {
  if(!t) return []
  try { return JSON.parse(t) } catch(e) { return [] }
}

export default function Roadmap() {
  const [roadmaps, setRoadmaps] = useState([])
  const [milestones, setMilestones] = useState([])
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [activeView, setActiveView] = useState('yearly')

  const [isCreatingRM, setIsCreatingRM] = useState(false)
  const [rmName, setRmName] = useState('')
  const [rmTarget, setRmTarget] = useState('')

  const [isCreatingMS, setIsCreatingMS] = useState(false)
  const [msTitle, setMsTitle] = useState('')
  const [msStart, setMsStart] = useState('')
  const [msEnd, setMsEnd] = useState('')
  const [msDesc, setMsDesc] = useState('')

  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)

  const { addTodo, showToast } = useStore()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (activeSubjectId) loadMilestones(activeSubjectId)
  }, [activeSubjectId])

  async function loadData() {
    const r = await getRoadmaps()
    setRoadmaps(r)
    if (r.length > 0 && !activeSubjectId) {
      setActiveSubjectId(r[0].id)
    }
  }

  async function loadMilestones(rmId) {
    const ms = await getMilestonesByRoadmap(rmId)
    setMilestones(ms)
  }

  async function handleCreateRM() {
    if(!rmName || !rmTarget) return
    if(roadmaps.length >= 3) return
    const color = SUBJECT_COLORS[roadmaps.length]
    await createRoadmap(rmName, color, rmTarget)
    setRmName('')
    setRmTarget('')
    setIsCreatingRM(false)
    const r = await getRoadmaps()
    setRoadmaps(r)
    if(r.length > 0) setActiveSubjectId(r[r.length-1].id)
  }

  async function handleCreateMS() {
    if(!msTitle || !msStart || !msEnd) return
    await addMilestone({
      roadmapId: activeSubjectId,
      title: msTitle,
      startDate: msStart,
      endDate: msEnd,
      description: msDesc,
      completed: false,
      weeklyTasks: '[]'
    })
    setMsTitle('')
    setMsStart('')
    setMsEnd('')
    setMsDesc('')
    setIsCreatingMS(false)
    await loadMilestones(activeSubjectId)
  }

  const activeRoadmap = roadmaps.find(r => r.id === activeSubjectId)
  let targetRemaining = 0
  if(activeRoadmap) {
    const diff = new Date(activeRoadmap.targetDate) - new Date()
    targetRemaining = Math.max(0, Math.ceil(diff / (1000*60*60*24)))
  }
  const msTotal = milestones.length
  const msDone = milestones.filter(m => m.completed).length
  const progressPct = msTotal === 0 ? 0 : Math.round((msDone / msTotal) * 100)

  const renderYearly = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return (
      <div className="card" style={{ padding: '1rem', overflowX: 'auto', borderRadius: '12px' }}>
        <div style={{ minWidth: '600px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '12px' }}>
            <div style={{ width: '120px', flexShrink: 0, fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Milestone</div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {months.map(m => <div key={m}>{m}</div>)}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {milestones.map(ms => {
              const s = new Date(ms.startDate)
              const e = new Date(ms.endDate)
              const startMonth = s.getMonth()
              const endMonth = e.getMonth()
              const startOffset = (startMonth / 12) * 100
              const widthPct = Math.max((((endMonth - startMonth + 1) / 12) * 100), 2)
              
              const isOngoing = !ms.completed && (new Date() >= s && new Date() <= e)
              const barClass = isOngoing ? 'gantt-bar-ongoing' : ''

              return (
                <div key={ms.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '120px', flexShrink: 0, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px', color: 'var(--text-primary)' }}>
                    {ms.title}
                  </div>
                  <div style={{ flex: 1, position: 'relative', height: '28px', background: 'var(--glass-bg-strong)', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                    <div className={barClass} style={{
                      position: 'absolute',
                      left: `${startOffset}%`,
                      width: `${widthPct}%`,
                      height: '100%',
                      background: ms.completed ? activeRoadmap.color : `${activeRoadmap.color}B3`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: '#000',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden'
                    }}>
                      {ms.completed && '✓'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {isCreatingMS ? (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              <div className="row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input className="gi" placeholder="Title" value={msTitle} onChange={e=>setMsTitle(e.target.value)} style={{flex: 1}}/>
                <input className="gi" type="date" value={msStart} onChange={e=>setMsStart(e.target.value)} />
                <input className="gi" type="date" value={msEnd} onChange={e=>setMsEnd(e.target.value)} />
                <input className="gi" placeholder="Description (optional)" value={msDesc} onChange={e=>setMsDesc(e.target.value)} style={{flex: 1}}/>
                <button className="btn" onClick={handleCreateMS}>Save</button>
                <button className="btn-ghost" onClick={() => setIsCreatingMS(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-ghost" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setIsCreatingMS(true)}>
              + Add Milestone
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderMonthly = () => {
    const d = new Date()
    d.setMonth(d.getMonth() + currentMonthOffset)
    const monthName = d.toLocaleString('default', { month: 'long', year: 'numeric' })
    const curY = d.getFullYear()
    const curM = d.getMonth()

    const msInMonth = milestones.filter(ms => {
      const s = new Date(ms.startDate)
      const e = new Date(ms.endDate)
      return (s.getFullYear() === curY && s.getMonth() <= curM && e.getFullYear() >= curY && e.getMonth() >= curM) ||
             (s.getFullYear() < curY && e.getFullYear() === curY && e.getMonth() >= curM) ||
             (s.getFullYear() < curY && e.getFullYear() > curY) ||
             (s.getFullYear() === curY && s.getMonth() <= curM && e.getFullYear() > curY)
    })

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
          <button className="btn-ghost" onClick={() => setCurrentMonthOffset(o => o - 1)}>← Prev</button>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{monthName}</span>
          <button className="btn-ghost" onClick={() => setCurrentMonthOffset(o => o + 1)}>Next →</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {msInMonth.map(ms => (
            <div key={ms.id} className="card" style={{ borderLeft: `6px solid ${activeRoadmap.color}`, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{ms.title}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {ms.startDate} &mdash; {ms.endDate}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={ms.completed} 
                    onChange={async () => {
                      await toggleMilestone(ms.id)
                      loadMilestones(activeSubjectId)
                    }}
                    style={{ width: '22px', height: '22px', accentColor: activeRoadmap.color, cursor: 'pointer' }}
                  />
                </div>
              </div>
              {ms.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '12px' }}>{ms.description}</p>}
            </div>
          ))}
          {msInMonth.length === 0 && <div className="empty">No milestones this month</div>}
        </div>
      </div>
    )
  }

  const handlePushTodo = (ms) => {
    let tasks = parseTasks(ms.weeklyTasks)
    let added = 0
    const today = todayKey()
    tasks.forEach(t => {
      if(!t.done) {
        addTodo({
          id: Date.now() + Math.random(),
          text: `[${activeRoadmap.name}] ${t.text}`,
          priority: 'high',
          createdAt: today,
          done: false
        })
        added++
      }
    })
    
    addEvent({
      title: `[${activeRoadmap.name}] - ${ms.title}`,
      date: ms.endDate,
      startTime: "09:00",
      endTime: "10:00",
      type: "roadmap",
      notes: "Auto-generated from Roadmap tracker"
    })
    
    showToast("Tasks added to To-Do and Calendar")
  }

  const TaskList = ({ ms }) => {
    const [tasks, setTasks] = useState(parseTasks(ms.weeklyTasks))
    const [newTaskText, setNewTaskText] = useState('')
    
    const save = async (newTasks) => {
      setTasks(newTasks)
      await updateMilestoneWeeklyTasks(ms.id, JSON.stringify(newTasks))
      loadMilestones(activeSubjectId)
    }

    const addTask = () => {
      if(!newTaskText) return
      save([...tasks, { id: Date.now(), text: newTaskText, done: false }])
      setNewTaskText('')
    }
    
    const toggleTask = (id) => {
      save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
    }

    return (
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {tasks.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ width: '18px', height: '18px', accentColor: activeRoadmap.color }} />
              <span style={{ fontSize: '0.9rem', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{t.text}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input className="gi" style={{ flex: 1 }} value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} placeholder="New task..." />
          <button className="btn-ghost" onClick={addTask}>+ Add</button>
        </div>
        <button className="btn" style={{ width: '100%', marginTop: '12px' }} onClick={() => handlePushTodo(ms)}>Push to To-Do</button>
      </div>
    )
  }

  const renderWeekly = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    const startOfWeek = new Date(today.setDate(diff))
    startOfWeek.setDate(startOfWeek.getDate() + (currentWeekOffset * 7))
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    const weekLabel = `${startOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric' })}`

    const msInWeek = milestones.filter(ms => {
      const s = new Date(ms.startDate).getTime()
      const e = new Date(ms.endDate).getTime()
      return s <= endOfWeek.getTime() && e >= startOfWeek.getTime()
    })

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
          <button className="btn-ghost" onClick={() => setCurrentWeekOffset(o => o - 1)}>← Prev</button>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{weekLabel}</span>
          <button className="btn-ghost" onClick={() => setCurrentWeekOffset(o => o + 1)}>Next →</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {msInWeek.map(ms => (
            <div key={ms.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ padding: '4px 10px', borderRadius: '50px', background: `${activeRoadmap.color}33`, color: activeRoadmap.color, fontSize: '0.75rem', fontWeight: 600 }}>{activeRoadmap.name}</div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>{ms.title}</h3>
              </div>
              <TaskList ms={ms} />
            </div>
          ))}
          {msInWeek.length === 0 && <div className="empty">No milestones this week</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="section active" id="sec-roadmap">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .gantt-bar-ongoing {
          background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%) !important;
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
      
      <div className="ph">
        <div className="ph-row" style={{ alignItems: 'center' }}>
          <div>
            <h1>Roadmap Tracker</h1>
            <p>Plan your journey, track your progress</p>
          </div>
          <button 
            className="btn" 
            onClick={() => setIsCreatingRM(true)}
            disabled={roadmaps.length >= 3}
            style={{ opacity: roadmaps.length >= 3 ? 0.5 : 1, padding: '10px 16px' }}
          >
            + New Subject
          </button>
        </div>
      </div>

      {isCreatingRM && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="ct">Create Roadmap</div>
          <div className="row" style={{ display: 'flex', gap: '8px' }}>
            <input className="gi" placeholder="Subject name (e.g. DSA, GATE Prep)" value={rmName} onChange={e=>setRmName(e.target.value)} style={{flex: 1}}/>
            <input className="gi" type="date" value={rmTarget} onChange={e=>setRmTarget(e.target.value)} />
            <button className="btn" onClick={handleCreateRM}>Save</button>
            <button className="btn-ghost" onClick={() => setIsCreatingRM(false)}>Cancel</button>
          </div>
        </div>
      )}

      {roadmaps.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {roadmaps.map(rm => (
            <button 
              key={rm.id}
              onClick={() => setActiveSubjectId(rm.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '50px',
                border: `1.5px solid ${rm.color}`,
                background: activeSubjectId === rm.id ? rm.color : 'var(--glass-bg-strong)',
                color: activeSubjectId === rm.id ? '#000' : 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all var(--transition)'
              }}
            >
              {rm.name}
            </button>
          ))}
        </div>
      )}

      {activeRoadmap && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            {['yearly', 'monthly', 'weekly'].map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: activeView === v ? 'var(--glass-bg-strong)' : 'transparent',
                  color: activeView === v ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                  textTransform: 'capitalize',
                  fontWeight: activeView === v ? 600 : 400,
                  fontSize: '0.9rem'
                }}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: activeRoadmap.color }}></div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{activeRoadmap.name}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {msDone} of {msTotal} milestones completed
              </div>
            </div>
            <div style={{ width: '100%', height: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: activeRoadmap.color, transition: 'width 0.5s ease', borderRadius: '10px' }}></div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {targetRemaining} days remaining until target date
            </div>
          </div>

          {activeView === 'yearly' && renderYearly()}
          {activeView === 'monthly' && renderMonthly()}
          {activeView === 'weekly' && renderWeekly()}
        </>
      )}
    </div>
  )
}
