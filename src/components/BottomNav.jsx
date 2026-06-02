import React from 'react';
import {
  LayoutDashboard, BookOpen, CheckSquare, Repeat, Map
} from 'lucide-react'

export default function BottomNav({ activeSection, onNav }) {
  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
    { id: 'todos', icon: CheckSquare, label: 'To-Do' },
    { id: 'habits', icon: Repeat, label: 'Habits' },
    { id: 'roadmap', icon: Map, label: 'Roadmap' }
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(item => (
          <div 
            key={item.id} 
            className={`b-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onNav(item.id)}
            title={item.label}
          >
            <item.icon size={18} strokeWidth={1.8} />
          </div>
        ))}
      </div>
    </nav>
  );
}
