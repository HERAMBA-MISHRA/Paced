export const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
};
export const dateKey = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
}
export const fmtDate = (key) => { const [y, m, d] = key.split('-'); const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${months[+m-1]} ${+d}, ${y}`; }

export const ACH = [
  {id:'first_todo',   icon:'🌱', name:'First Step',      desc:'Complete your first task'},
  {id:'ten_todos',    icon:'📚', name:'Focused',          desc:'Complete 10 tasks'},
  {id:'streak3',      icon:'🔥', name:'On Fire',          desc:'3-day habit streak'},
  {id:'streak7',      icon:'⚡', name:'Momentum',         desc:'7-day habit streak'},
  {id:'journal5',     icon:'📝', name:'Chronicler',       desc:'Write 5 journal entries'},
  {id:'allrounder',   icon:'🌟', name:'All-Rounder',      desc:'Use all 4 core sections'},
];

export function calcStreak(h) {
  if (!h || !h.dates || !h.dates.length) return 0;
  let streak = 0, d = new Date();
  while (true) {
    const k = d.toISOString().split('T')[0];
    if (h.dates.includes(k)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

export function calcJournalStreak(journal) {
  if (!journal) return 0;
  let streak = 0, d = new Date();
  while (true) {
    const k = d.toISOString().split('T')[0];
    if (journal[k]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

export function checkAchievements(state) {
  const newAch = [...state.achievements];
  const unlock = (id) => { if(!newAch.includes(id)) newAch.push(id) };
  
  const doneTodos = state.todos.filter(t => t.done).length;
  if(doneTodos >= 1) unlock('first_todo');
  if(doneTodos >= 10) unlock('ten_todos');
  
  const maxStreak = state.habits.reduce((m, h) => Math.max(m, calcStreak(h)), 0);
  if(maxStreak >= 3) unlock('streak3');
  if(maxStreak >= 7) unlock('streak7');
  
  if(Object.keys(state.journal).length >= 5) unlock('journal5');
  
  const used = [state.todos?.length || 0, state.habits?.length || 0, Object.keys(state.journal || {}).length];
  if(used.every(v => v > 0)) unlock('allrounder');
  
  return newAch;
}

export async function hashPin(pin) {
  const msgBuffer = new TextEncoder().encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
