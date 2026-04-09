const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace('--text-secondary: rgba(255,255,255,0.55);', '--text-secondary: rgba(255,255,255,0.6);');
css = css.replace('--text-muted: rgba(255,255,255,0.25);', '--text-muted: rgba(255,255,255,0.35);');

const customCSS = `
/* GLOBAL UI OVERRIDES */
.btn { color: #ffffff !important; }
.btn-ghost { color: var(--text-primary) !important; }

.cal-nav-btn {
  color: var(--text-primary);
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.875rem;
  cursor: pointer;
  min-height: 38px;
}

.gi::placeholder { color: var(--text-muted) !important; opacity: 1; }
.gi { color: var(--text-primary) !important; }

input::placeholder { color: var(--text-muted) !important; opacity: 1; }
input { color: var(--text-primary) !important; }

.todo-txt { color: var(--text-primary) !important; font-size: 0.875rem; }
.todo-item { color: var(--text-primary); }

.sel { color: var(--text-primary) !important; background: var(--input-bg) !important; }
.sel option { background: var(--bg-secondary); color: var(--text-primary); }

.calendar-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(56,189,248,0.3) transparent;
}
.calendar-container::-webkit-scrollbar { width: 4px; height: 4px; }
.calendar-container::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 4px; }
.calendar-container::-webkit-scrollbar-track { background: transparent; }
`;

fs.writeFileSync('src/index.css', css + customCSS);
console.log('CSS updated successfully');
