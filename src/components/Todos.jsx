import { useState } from 'react'
import { useStore } from '../store'
import { todayKey } from '../utils'
import { CheckSquare, X } from 'lucide-react'

export default function Todos() {
  const { todos, addTodo, toggleTodo, deleteTodo, showToast } = useStore()
  
  const [todoIn, setTodoIn] = useState('')
  const [todoPri, setTodoPri] = useState('med')
  const [filter, setFilter] = useState('all') // all, active, done

  const handleAdd = () => {
    const v = todoIn.trim()
    if (!v) return
    addTodo({
      id: Date.now(),
      text: v,
      priority: todoPri,
      done: false,
      createdAt: todayKey()
    })
    setTodoIn('')
    showToast('Task added')
  }

  let list = todos
  if (filter === 'active') list = list.filter(t => !t.done)
  if (filter === 'done') list = list.filter(t => t.done)

  const doneCount = todos.filter(t => t.done).length

  return (
    <div className="section active" id="sec-todos">
      <div className="ph">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckSquare size={28} strokeWidth={2} /> To-Do List
        </h1>
        <p>Capture, prioritise, and crush your tasks</p>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <input
            className="gi"
            value={todoIn}
            onChange={(e) => setTodoIn(e.target.value)}
            placeholder="What needs to be done?"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            style={{ minWidth: '220px' }}
          />
          <select className="sel" value={todoPri} onChange={(e) => setTodoPri(e.target.value)}>
            <option value="low">Low</option>
            <option value="med">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="btn" onClick={handleAdd}>Add Task</button>
        </div>
        
        <div className="todo-filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
          <button className={`filter-btn ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>Completed</button>
        </div>
        
        <ul className="todo-list">
          {list.length ? list.map(t => (
            <li key={t.id} className="todo-item">
              <div className={`chk ${t.done ? 'done' : ''}`} onClick={() => toggleTodo(t.id, todayKey())}></div>
              <span className={`todo-txt ${t.done ? 'done' : ''}`}>{t.text}</span>
              <span className={`priority-badge p-${t.priority}`}>{t.priority}</span>
              <button className="del" onClick={() => deleteTodo(t.id)}><X size={14} /></button>
            </li>
          )) : (
            <li className="empty">Nothing here yet</li>
          )}
        </ul>
        <div style={{ marginTop: '.75rem', fontSize: '.78rem', color: 'var(--lo)' }}>
          {doneCount} of {todos.length} completed
        </div>
      </div>
    </div>
  )
}
