import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import {
  getRoadmaps, createRoadmap, deleteRoadmap, updateRoadmap,
  getMilestonesByRoadmap, addMilestone, toggleMilestone, updateMilestoneWeeklyTasks, deleteMilestone, updateMilestone,
  addEvent
} from '../db'
import { todayKey } from '../utils'

const SUBJECT_COLORS = ['#38BDF8', '#6EE7B7', '#A78BFA', '#FB923C', '#F472B6', '#E879F9']

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
  const [isEditingRM, setIsEditingRM] = useState(false)
  const [rmName, setRmName] = useState('')
  const [rmTarget, setRmTarget] = useState('')
  const [rmColor, setRmColor] = useState('')

  const [isCreatingMS, setIsCreatingMS] = useState(false)
  const [isEditingMS, setIsEditingMS] = useState(null)
  const [msTitle, setMsTitle] = useState('')
  const [msStart, setMsStart] = useState('')
  const [msEnd, setMsEnd] = useState('')
  const [msDesc, setMsDesc] = useState('')

  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)

  const { addTodo, showToast } = useStore()

  useEffect(() => { loadData() }, [])
  useEffect(() => { if (activeSubjectId) loadMilestones(activeSubjectId) }, [activeSubjectId])

  async function loadData() {
    const r = await getRoadmaps()
    setRoadmaps(r)
    if (r.length > 0 && !activeSubjectId && !r.find(rm => rm.id === activeSubjectId)) {
      setActiveSubjectId(r[0].id)
    }
  }

  async function loadMilestones(rmId) {
    const ms = await getMilestonesByRoadmap(rmId)
    setMilestones(ms)
  }

  function openCreateRM() {
    closeRMForm()
    setIsCreatingRM(true)
  }

  function openEditRM() {
    const rm = roadmaps.find(r => r.id === activeSubjectId)
    if(rm) {
      setRmName(rm.name)
      setRmTarget(rm.targetDate)
      setRmColor(rm.color)
      setIsEditingRM(true)
      setIsCreatingRM(false)
    }
  }

  function closeRMForm() {
    setIsCreatingRM(false)
    setIsEditingRM(false)
    setRmName('')
    setRmTarget('')
    setRmColor('')
  }

  async function handleSaveRM() {
    if(!rmName || !rmTarget) { showToast("Name and Target Date required"); return }
    if(isEditingRM) {
      await updateRoadmap(activeSubjectId, { name: rmName, targetDate: rmTarget, color: rmColor })
      closeRMForm()
      await loadData()
      showToast("Roadmap updated")
    } else {
      if(roadmaps.length >= 6) { showToast("Max roadmaps reached"); return }
      const color = rmColor || SUBJECT_COLORS[roadmaps.length % SUBJECT_COLORS.length]
      await createRoadmap(rmName, color, rmTarget)
      closeRMForm()
      const r = await getRoadmaps()
      setRoadmaps(r)
      if(r.length > 0) setActiveSubjectId(r[r.length-1].id)
      showToast("Roadmap created")
    }
  }

  async function handleDeleteRM() {
    if(window.confirm(`Are you sure you want to delete "${rmName}" and all its milestones?`)) {
      await deleteRoadmap(activeSubjectId)
      closeRMForm()
      setActiveSubjectId(null)
      await loadData()
      showToast("Roadmap deleted")
    }
  }

  function openCreateMS() {
    closeMSForm()
    setIsCreatingMS(true)
  }

  function openEditMS(ms) {
    setIsEditingMS(ms.id)
    setMsTitle(ms.title)
    setMsStart(ms.startDate)
    setMsEnd(ms.endDate)
    setMsDesc(ms.description || '')
    setIsCreatingMS(false)
  }

  function closeMSForm() {
    setIsCreatingMS(false)
    setIsEditingMS(null)
    setMsTitle('')
    setMsStart('')
    setMsEnd('')
    setMsDesc('')
  }

  async function handleSaveMS() {
    if(!msTitle || !msStart || !msEnd) { showToast("Title, Start, and End dates required"); return }
    if(isEditingMS) {
      await updateMilestone(isEditingMS, { title: msTitle, startDate: msStart, endDate: msEnd, description: msDesc })
      showToast("Milestone updated")
    } else {
      await addMilestone({ roadmapId: activeSubjectId, title: msTitle, startDate: msStart, endDate: msEnd, description: msDesc, completed: false, weeklyTasks: '[]' })
      showToast("Milestone created")
    }
    closeMSForm()
    await loadMilestones(activeSubjectId)
  }

  async function handleDeleteMS(id) {
    if(window.confirm("Delete this milestone?")) {
      await deleteMilestone(id)
      await loadMilestones(activeSubjectId)
      showToast("Milestone deleted")
    }
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

  const handlePushTodo = async (ms) => {
    if (!ms.endDate) {
      showToast("Milestone has no end date set")
      return
    }
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
    
    await addEvent({
      title: `[${activeRoadmap.name}] - ${ms.title}`,
      date: ms.endDate,
      startTime: "09:00",
      endTime: "10:00",
      type: "roadmap",
      notes: "Auto-generated from Roadmap tracker"
    })
    
    showToast(`Pushed ${added} tasks to To-Do & Calendar`)
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
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {tasks.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ width: '18px', height: '18px', accentColor: activeRoadmap.color }} />
              <span style={{ fontSize: '0.9rem', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{t.text}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input className="gi" style={{ flex: 1, padding: '7px 12px' }} value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} placeholder="New task..." />
          <button className="btn-ghost" style={{ padding: '7px 12px' }} onClick={addTask}>+ Add</button>
        </div>
        <button className="btn" style={{ width: '100%', marginTop: '12px', padding: '8px' }} onClick={() => handlePushTodo(ms)}>Push to To-Do & Calendar</button>
      </div>
    )
  }

  const renderYearly = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return (
      <div className="rm-card" style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '750px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ width: '180px', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Milestone</div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {months.map(m => <div key={m}>{m}</div>)}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {milestones.map(ms => {
              const s = new Date(ms.startDate)
              const e = new Date(ms.endDate)
              const startMonth = s.getMonth()
              const endMonth = e.getMonth()
              const startOffset = (startMonth / 12) * 100
              const widthPct = Math.max((((endMonth - startMonth + 1) / 12) * 100), 2)
              
              const isOngoing = !ms.completed && (new Date() >= s && new Date() <= e)
              const barClass = isOngoing ? 'gantt-fill gantt-bar-ongoing' : 'gantt-fill'

              return (
                <div key={ms.id} className="ms-row">
                  <div className="ms-info">
                    <div className="ms-title-main" style={{ textDecoration: ms.completed ? 'line-through' : 'none', color: ms.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>{ms.title}</div>
                    <div className="ms-sub">{s.toLocaleDateString('default',{month:'short',day:'numeric'})} - {e.toLocaleDateString('default',{month:'short',day:'numeric'})}</div>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <div className="gantt-track">
                      {months.map(m => <div key={m} className="gantt-grid-line"></div>)}
                      <div className={barClass} style={{
                        left: `${startOffset}%`,
                        width: `${widthPct}%`,
                        background: ms.completed ? activeRoadmap.color : `${activeRoadmap.color}E6`,
                        opacity: ms.completed ? 0.8 : 1
                      }}>
                        {ms.completed ? <span style={{marginRight: '6px'}}>✓</span> : null}
                        {widthPct > 8 ? ms.title : ''}
                      </div>
                    </div>
                  </div>
                  <div className="ms-actions">
                    <button className="icon-btn" onClick={() => openEditMS(ms)} title="Edit">✎</button>
                    <button className="icon-btn danger" onClick={() => handleDeleteMS(ms.id)} title="Delete">×</button>
                  </div>
                </div>
              )
            })}
            {milestones.length === 0 && <div className="empty">No milestones yet. Create one below!</div>}
          </div>

          {(isCreatingMS || isEditingMS) ? (
            <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', animation: 'fadeUp 0.3s ease' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                {isEditingMS ? 'Edit Milestone' : 'New Milestone'}
              </div>
              <div className="row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input className="gi" placeholder="Title" value={msTitle} onChange={e=>setMsTitle(e.target.value)} style={{flex: 1, minWidth: '200px'}}/>
                <input className="gi" type="date" value={msStart} onChange={e=>setMsStart(e.target.value)} />
                <input className="gi" type="date" value={msEnd} onChange={e=>setMsEnd(e.target.value)} />
              </div>
              <div className="row" style={{ marginTop: '8px' }}>
                <input className="gi" placeholder="Description (optional)" value={msDesc} onChange={e=>setMsDesc(e.target.value)} style={{width: '100%'}}/>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn" onClick={handleSaveMS}>Save Milestone</button>
                <button className="btn-ghost" onClick={closeMSForm}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-ghost" style={{ marginTop: '1.5rem', width: '100%', borderStyle: 'dashed' }} onClick={openCreateMS}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', padding: '0 0.5rem' }}>
          <button className="btn-ghost" onClick={() => setCurrentMonthOffset(o => o - 1)}>← Prev Month</button>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{monthName}</span>
          <button className="btn-ghost" onClick={() => setCurrentMonthOffset(o => o + 1)}>Next Month →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {msInMonth.map(ms => (
            <div key={ms.id} className="rm-card" style={{ borderTop: `4px solid ${activeRoadmap.color}`, padding: '1.25rem' }}>
              <div className="ms-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 4px 0', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ms.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {new Date(ms.startDate).toLocaleDateString('default',{month:'short',day:'numeric'})} &mdash; {new Date(ms.endDate).toLocaleDateString('default',{month:'short',day:'numeric'})}
                  </div>
                  {ms.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, wordWrap: 'break-word' }}>{ms.description}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={ms.completed} 
                    onChange={async () => { await toggleMilestone(ms.id); loadMilestones(activeSubjectId) }}
                    style={{ width: '22px', height: '22px', accentColor: activeRoadmap.color, cursor: 'pointer' }}
                  />
                  <div className="ms-actions" style={{ flexDirection: 'column' }}>
                    <button className="icon-btn" onClick={() => openEditMS(ms)}>✎</button>
                    <button className="icon-btn danger" onClick={() => handleDeleteMS(ms.id)}>×</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {msInMonth.length === 0 && <div className="empty" style={{ gridColumn: '1 / -1' }}>No milestones this month</div>}
        </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', padding: '0 0.5rem' }}>
          <button className="btn-ghost" onClick={() => setCurrentWeekOffset(o => o - 1)}>← Prev Week</button>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{weekLabel}</span>
          <button className="btn-ghost" onClick={() => setCurrentWeekOffset(o => o + 1)}>Next Week →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {msInWeek.map(ms => (
            <div key={ms.id} className="rm-card" style={{ padding: '1.25rem' }}>
              <div className="ms-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <div style={{ padding: '4px 10px', borderRadius: '50px', background: `${activeRoadmap.color}22`, border: `1px solid ${activeRoadmap.color}44`, color: activeRoadmap.color, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{activeRoadmap.name}</div>
                  <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ms.title}</h3>
                </div>
              </div>
              <TaskList ms={ms} />
            </div>
          ))}
          {msInWeek.length === 0 && <div className="empty" style={{ gridColumn: '1 / -1' }}>No milestones this week</div>}
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
          background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%) !important;
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
        .rm-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .rm-card:hover { border-color: rgba(255, 255, 255, 0.15); }
        .rm-badge {
          padding: 8px 20px;
          border-radius: 50px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .rm-badge:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
        .rm-badge.active {
          color: #111 !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transform: translateY(-2px);
          border-color: transparent;
        }
        .gantt-track {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          position: relative;
          border-radius: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          height: 34px;
          overflow: hidden;
        }
        .gantt-grid-line {
          border-right: 1px dashed rgba(255,255,255,0.06);
          height: 100%;
        }
        .gantt-grid-line:last-child { border-right: none; }
        .gantt-fill {
          position: absolute;
          top: 3px;
          bottom: 3px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          font-size: 0.75rem;
          color: #000;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: width 0.5s ease, left 0.5s ease;
          z-index: 2;
        }
        .ms-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          gap: 16px;
        }
        .ms-info {
          width: 180px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        .ms-title-main {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ms-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
        .ms-actions {
          display: flex;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .ms-row:hover .ms-actions, .ms-card-top:hover .ms-actions { opacity: 1; }
        .icon-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-secondary);
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.85rem;
        }
        .icon-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.2); }
        .icon-btn.danger:hover { color: #F87171; background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.3); }
        .rm-view-btn {
          padding: 8px 20px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.25s ease;
          text-transform: capitalize;
          font-weight: 500;
          font-size: 0.9rem;
        }
        .rm-view-btn:hover { background: rgba(255,255,255,0.05); }
        .rm-view-btn.active {
          background: var(--glass-bg-strong);
          border-color: rgba(255,255,255,0.1);
          color: var(--text-primary);
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
            onClick={openCreateRM}
            disabled={roadmaps.length >= 6}
            style={{ opacity: roadmaps.length >= 6 ? 0.5 : 1, padding: '10px 20px', borderRadius: '12px' }}
          >
            + New Subject
          </button>
        </div>
      </div>

      {(isCreatingRM || isEditingRM) && (
        <div className="rm-card" style={{ marginBottom: '2rem', animation: 'fadeUp 0.4s ease' }}>
          <div className="ct" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
            {isEditingRM ? 'Edit Subject Settings' : 'Create New Roadmap Subject'}
          </div>
          <div className="row" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="gi" placeholder="Subject name (e.g. DSA, Prep)" value={rmName} onChange={e=>setRmName(e.target.value)} style={{flex: 1.5, minWidth: '200px'}}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target:</span>
              <input className="gi" type="date" value={rmTarget} onChange={e=>setRmTarget(e.target.value)} style={{flex: 1}}/>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Color:</span>
               <input type="color" value={rmColor || '#38BDF8'} onChange={e => setRmColor(e.target.value)} style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }} />
            </div>

            <button className="btn" onClick={handleSaveRM} style={{ padding: '10px 24px' }}>Save</button>
            <button className="btn-ghost" onClick={closeRMForm} style={{ padding: '10px 24px' }}>Cancel</button>
            
            {isEditingRM && (
              <button className="btn-ghost" onClick={handleDeleteRM} style={{ padding: '10px 24px', borderColor: 'rgba(248,113,113,0.4)', color: '#F87171' }}>Delete</button>
            )}
          </div>
        </div>
      )}

      {roadmaps.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {roadmaps.map(rm => (
            <button 
              key={rm.id}
              className={`rm-badge ${activeSubjectId === rm.id ? 'active' : ''}`}
              onClick={() => setActiveSubjectId(rm.id)}
              style={{
                background: activeSubjectId === rm.id ? rm.color : 'rgba(255,255,255,0.03)',
                borderColor: activeSubjectId === rm.id ? 'transparent' : `${rm.color}55`
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: activeSubjectId === rm.id ? 'rgba(0,0,0,0.5)' : rm.color }}></div>
              {rm.name}
            </button>
          ))}
        </div>
      )}

      {activeRoadmap && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['yearly', 'monthly', 'weekly'].map(v => (
                <button
                  key={v}
                  className={`rm-view-btn ${activeView === v ? 'active' : ''}`}
                  onClick={() => setActiveView(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            <button 
               className="btn-ghost" 
               onClick={openEditRM}
               style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem' }}
            >
               ⚙ Edit Subject
            </button>
          </div>

          <div className="rm-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: activeRoadmap.color, boxShadow: `0 0 12px ${activeRoadmap.color}` }}></div>
                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{activeRoadmap.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{msDone} / {msTotal}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Milestones</div>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: `linear-gradient(90deg, ${activeRoadmap.color}88, ${activeRoadmap.color})`, transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', borderRadius: '10px', boxShadow: `0 0 10px ${activeRoadmap.color}66` }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Progress: <strong style={{ color: 'var(--text-primary)' }}>{progressPct}%</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Target: <strong style={{ color: 'var(--text-primary)' }}>{new Date(activeRoadmap.targetDate).toLocaleDateString()}</strong> &bull; <span style={{ color: targetRemaining < 30 ? '#F87171' : 'var(--text-muted)' }}>{targetRemaining} days left</span>
              </div>
            </div>
          </div>

          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            {activeView === 'yearly' && renderYearly()}
            {activeView === 'monthly' && renderMonthly()}
            {activeView === 'weekly' && renderWeekly()}
          </div>
        </>
      )}
    </div>
  )
}
