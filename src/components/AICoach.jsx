import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store'
import { calcJournalStreak, calcStreak } from '../utils'
import { Bot, TrendingUp, Target, Zap, ListTree, Send } from 'lucide-react'

export default function AICoach() {
  const { todos, habits, journal, chatHist, addChatMsg } = useStore()
  
  const [chatIn, setChatIn] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHist, loading])

  const buildContext = () => {
    const todosDone = todos.filter(t => t.done).length
    const habitsData = habits.map(h => ({ name: h.name, streak: calcStreak(h) }))
    const jCount = Object.keys(journal).length
    return `User's Paced data: ${todosDone}/${todos.length} todos completed. Habits: ${JSON.stringify(habitsData)}. Journal entries: ${jCount}. Journal streak: ${calcJournalStreak(journal)} days.`
  }

  const handleSend = async (textOverride) => {
    const v = textOverride !== undefined ? textOverride.trim() : chatIn.trim()
    if (!v) return
    
    setChatIn('')
    addChatMsg({ role: 'user', content: v })
    setLoading(true)

    const contextStr = buildContext()
    
    const messages = chatHist.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: String(m.content)
    }))
    messages.push({ role: 'user', content: v })

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          system: `You are Paced AI Coach. Respond briefly and encouragingly based on user data. ${contextStr}`,
          messages
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      addChatMsg({ role: 'ai', content: data.text })
    } catch (e) {
      console.error(e)
      addChatMsg({ role: 'ai', content: 'Connection error — please make sure API keys are configured.' })
    } finally {
      setLoading(false)
    }
  }

  const quickPrompt = (msg) => {
    handleSend(msg)
  }

  return (
    <div className="section active" id="sec-ai">
      <div className="ph">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={28} strokeWidth={2} /> AI Life Coach
        </h1>
        <p>Your personal coach — ask anything about goals, habits, or mindset</p>
      </div>

      <div className="card">
        <div className="ct">Quick Prompts</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button className="btn-ghost" onClick={() => quickPrompt('How am I doing overall with my goals and habits?')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} strokeWidth={2} /> Progress check
          </button>
          <button className="btn-ghost" onClick={() => quickPrompt('What should I focus on this week?')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={14} strokeWidth={2} /> Weekly focus
          </button>
          <button className="btn-ghost" onClick={() => quickPrompt('Give me a motivational message for today.')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} strokeWidth={2} /> Motivate me
          </button>
          <button className="btn-ghost" onClick={() => quickPrompt('Help me break down my biggest goal into steps.')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ListTree size={14} strokeWidth={2} /> Break down a goal
          </button>
        </div>

        <div className="chat-window">
          <div className="msg ai">
            Hey! I'm your Paced AI Coach. I can see your goals, habits and journal — tell me what's on your mind, or pick a quick prompt above.
          </div>
          
          {chatHist.map((msg, i) => (
            <div key={i} className={`msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="msg ai loading"></div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-row" style={{ marginTop: '12px' }}>
          <input
            className="chat-in"
            value={chatIn}
            onChange={(e) => setChatIn(e.target.value)}
            placeholder="Ask your AI coach anything…"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
          />
          <button className="btn" onClick={() => handleSend()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} strokeWidth={2} /> Send
          </button>
        </div>
      </div>
    </div>
  )
}
