import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { checkAchievements } from './utils'
import { dexieStorage } from './db'

export const useStore = create(
  persist(
    (set, get) => ({
      todos: [],
      habits: [],
      journal: {},
      journalPin: null,
      weekRef: {},
      taskLog: {},
      todosHist: {},
      chatHist: [],
      achievements: [],
      toast: null, // { message, id }

      setJournalPin: (pin) => set(() => ({ journalPin: pin })),

      showToast: (message) => {
        const id = Date.now()
        set({ toast: { message, id } })
        setTimeout(() => {
          set((s) => s.toast?.id === id ? { toast: null } : s)
        }, 2200)
      },

      addTodo: (todo) => set((s) => {
        const newState = { ...s, todos: [...s.todos, todo] }
        newState.achievements = checkAchievements(newState)
        return newState
      }),
      toggleTodo: (id, todayKey) => set((s) => {
        const todos = s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
        const taskLog = { ...s.taskLog }
        if (!taskLog[todayKey]) taskLog[todayKey] = 0
        taskLog[todayKey] = todos.filter(t => t.done && t.createdAt === todayKey).length
        const newState = { ...s, todos, taskLog }
        newState.achievements = checkAchievements(newState)
        return newState
      }),
      deleteTodo: (id) => set((s) => ({ todos: s.todos.filter(t => t.id !== id) })),
      
      addHabit: (habit) => set((s) => {
        const newState = { ...s, habits: [...s.habits, habit] }
        newState.achievements = checkAchievements(newState)
        return newState
      }),
      toggleHabitDate: (index, date) => set((s) => {
        const habits = [...s.habits]
        const h = { ...habits[index] }
        if(!h.dates) h.dates = []
        if(h.dates.includes(date)) {
          h.dates = h.dates.filter(d => d !== date)
        } else {
          h.dates = [...h.dates, date]
        }
        habits[index] = h
        const newState = { ...s, habits }
        newState.achievements = checkAchievements(newState)
        return newState
      }),
      deleteHabit: (index) => set((s) => ({ habits: s.habits.filter((_, i) => i !== index) })),
      
      saveJournal: (date, content) => set((s) => {
        const newState = { ...s, journal: { ...s.journal, [date]: content } }
        newState.achievements = checkAchievements(newState)
        return newState
      }),
      
      saveWeekReflect: (date, content) => set((s) => ({ weekRef: { ...s.weekRef, [date]: content } })),
      
      addChatMsg: (msg) => set((s) => {
        const chatHist = [...s.chatHist, msg]
        if(chatHist.length > 20) return { chatHist: chatHist.slice(-20) }
        return { chatHist }
      })
    }),
    {
      name: 'los_data',
      storage: createJSONStorage(() => dexieStorage)
    }
  )
)
