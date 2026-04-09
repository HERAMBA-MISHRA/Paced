import React from 'react';

export default function BottomNav({ activeSection, onNav }) {
  const navItems = [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'journal', icon: '📔', label: 'Journal' },
    { id: 'todos', icon: '✅', label: 'To-Do' },
    { id: 'habits', icon: '🔁', label: 'Habits' },
    { id: 'goals', icon: '🎯', label: 'Goals' }
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
            {item.icon}
          </div>
        ))}
      </div>
    </nav>
  );
}
