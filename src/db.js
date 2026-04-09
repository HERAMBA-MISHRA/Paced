import Dexie from 'dexie'

export const db = new Dexie('PacedDB')
db.version(1).stores({
  keyval: 'id, value'
})
db.version(2).stores({
  keyval: 'id, value',
  roadmaps: '++id, name, color, targetDate, createdAt',
  milestones: '++id, roadmapId, title, description, startDate, endDate, completed, view, weeklyTasks'
})
db.version(3).stores({
  keyval: 'id, value',
  roadmaps: '++id, name, color, targetDate, createdAt',
  milestones: '++id, roadmapId, title, description, startDate, endDate, completed, view, weeklyTasks',
  events: '++id, title, date, startTime, endTime, type, notes, roadmapId, createdAt'
})

export const dexieStorage = {
  getItem: async (name) => {
    const record = await db.keyval.get(name)
    return record ? record.value : null
  },
  setItem: async (name, value) => {
    await db.keyval.put({ id: name, value })
  },
  removeItem: async (name) => {
    await db.keyval.delete(name)
  }
}

export async function exportDataToFile() {
  const data = await db.keyval.get('los_data')
  if (!data) return
  
  const blob = new Blob([data.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importDataFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target.result
        // Basic validation
        JSON.parse(text)
        await db.keyval.put({ id: 'los_data', value: text })
        resolve()
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export async function createRoadmap(name, color, targetDate) {
  return await db.roadmaps.add({ name, color, targetDate, createdAt: new Date().toISOString() })
}

export async function getRoadmaps() {
  return await db.roadmaps.toArray()
}

export async function deleteRoadmap(id) {
  await db.roadmaps.delete(id)
  await db.milestones.where({ roadmapId: id }).delete()
}

export async function addMilestone(milestoneObj) {
  return await db.milestones.add(milestoneObj)
}

export async function getMilestonesByRoadmap(roadmapId) {
  return await db.milestones.where({ roadmapId }).toArray()
}

export async function toggleMilestone(id) {
  const milestone = await db.milestones.get(id)
  if (milestone) {
    await db.milestones.update(id, { completed: !milestone.completed })
  }
}

export async function updateMilestoneWeeklyTasks(id, tasks) {
  await db.milestones.update(id, { weeklyTasks: tasks })
}

export async function deleteMilestone(id) {
  await db.milestones.delete(id)
}

export async function addEvent(eventObj) {
  return await db.events.add({ ...eventObj, createdAt: new Date().toISOString() })
}

export async function getEventsByDate(dateString) {
  return await db.events.where({ date: dateString }).toArray()
}

export async function getEventsByMonth(year, month) {
  const m = String(month).padStart(2, '0')
  return await db.events.where('date').startsWith(`${year}-${m}`).toArray()
}

export async function deleteEvent(id) {
  await db.events.delete(id)
}

export async function updateEvent(id, changes) {
  await db.events.update(id, changes)
}
