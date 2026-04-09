const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf-8');

// Replace Root
let newRoot = `:root {
  --bg-primary: #f0f2ff;
  --bg-secondary: #e8ebff;
  --bg-gradient-1: rgba(167, 139, 250, 0.25);
  --bg-gradient-2: rgba(56, 189, 248, 0.2);
  --bg-gradient-3: rgba(110, 231, 183, 0.18);
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-bg-strong: rgba(255, 255, 255, 0.75);
  --glass-border: rgba(255, 255, 255, 0.8);
  --glass-shadow: 0 8px 32px rgba(100, 100, 150, 0.12);
  --glass-shadow-hover: 0 16px 48px rgba(100,100,150,0.2);
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a6a;
  --text-muted: #8888aa;
  --accent-blue: #38BDF8;
  --accent-green: #6EE7B7;
  --accent-purple: #A78BFA;
  --accent-orange: #FB923C;
  --accent-red: #F87171;
  --sidebar-bg: rgba(255,255,255,0.4);
  --sidebar-icon: #4a4a6a;
  --sidebar-icon-active: #1a1a2e;
  --sidebar-active-bg: rgba(255,255,255,0.9);
  --nav-bg: rgba(255,255,255,0.6);
  --input-bg: rgba(255,255,255,0.6);
  --input-border: rgba(200,200,230,0.6);
  --blur: blur(20px) saturate(180%);
  --radius: 20px;
  --radius-sm: 12px;
  --radius-pill: 50px;
  --transition: 0.25s cubic-bezier(0.4,0,0.2,1);
}

[data-theme="dark"] {
  --bg-primary: #070b1a;
  --bg-secondary: #0d1530;
  --bg-gradient-1: rgba(56, 189, 248, 0.12);
  --bg-gradient-2: rgba(110, 231, 183, 0.08);
  --bg-gradient-3: rgba(167, 139, 250, 0.10);
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-bg-strong: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --glass-shadow-hover: 0 16px 48px rgba(0,0,0,0.6);
  --text-primary: rgba(255,255,255,0.93);
  --text-secondary: rgba(255,255,255,0.55);
  --text-muted: rgba(255,255,255,0.25);
  --sidebar-bg: rgba(255,255,255,0.03);
  --sidebar-icon: rgba(255,255,255,0.5);
  --sidebar-icon-active: rgba(255,255,255,0.95);
  --sidebar-active-bg: rgba(56,189,248,0.15);
  --nav-bg: rgba(10,15,40,0.8);
  --input-bg: rgba(255,255,255,0.06);
  --input-border: rgba(255,255,255,0.12);
}`;
css = css.replace(/:root\s*\{[\s\S]*?\}/, newRoot);

// Get index of layout separator to remove body/bg 
let mainIdx = css.indexOf('/* ── LAYOUT ── */');
let beforeLayout = css.substring(0, mainIdx);
let afterLayout = css.substring(mainIdx);

beforeLayout = beforeLayout.replace(/body\s*\{[\s\S]*$/, ''); // clear everything after root basically
beforeLayout += `body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  transition: background var(--transition),
              color var(--transition);
}

.bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 60% at 15% 15%,
      var(--bg-gradient-1) 0%, transparent 65%),
    radial-gradient(ellipse 60% 50% at 85% 80%,
      var(--bg-gradient-2) 0%, transparent 60%),
    radial-gradient(ellipse 50% 45% at 55% 40%,
      var(--bg-gradient-3) 0%, transparent 55%);
}

`;

css = beforeLayout + afterLayout;

// Replace sidebar block
let newSb = `.sb {
  width: 72px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--sidebar-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border-right: 1px solid var(--glass-border);
  padding: 1.5rem 0;
  height: 100vh;
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(100,100,150,0.08);
  transition: background var(--transition);
}

.logo {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #38BDF8, #6EE7B7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
  letter-spacing: -0.5px;
}

.nav-item {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 6px;
  transition: all var(--transition);
  border: 1px solid transparent;
  color: var(--sidebar-icon);
  position: relative;
}

.nav-item span:last-child {
  display: none;
}

.nav-item .nav-icon {
  font-size: 1.2rem;
}

.nav-item:hover {
  background: var(--glass-bg-strong);
  color: var(--sidebar-icon-active);
}

.nav-item.active {
  background: var(--sidebar-active-bg);
  border-color: var(--glass-border);
  color: var(--sidebar-icon-active);
  box-shadow: 0 4px 16px rgba(56,189,248,0.15);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 25%;
  bottom: 25%;
  width: 3px;
  background: linear-gradient(180deg, #38BDF8, #6EE7B7);
  border-radius: 0 3px 3px 0;
}

.sb-section { display: none; }

.sb-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
  width: 100%;
  display: flex;
  justify-content: center;
}

.sb-user-info { display: none; }

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38BDF8, #A78BFA);
  display: grid;
  place-items: center;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(56,189,248,0.3);
}`;

let sectionMainIdx = css.indexOf('/* ── MAIN ── */');
let sbIdx = css.indexOf('/* ── SIDEBAR ── */');
let beforeSb = css.substring(0, sbIdx + '/* ── SIDEBAR ── */\n'.length);
let afterSb = css.substring(sectionMainIdx);
css = beforeSb + newSb + '\n\n' + afterSb;

// Insert Top bar after MAIN section
let topBarCSS = `
/* ── TOP BAR ── */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border-bottom: 1px solid var(--glass-border);
  border-radius: 0 0 20px 20px;
  margin-bottom: 1.5rem;
  box-shadow: var(--glass-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-brand {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  background: linear-gradient(135deg, #38BDF8, #6EE7B7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 1rem;
  transition: all var(--transition);
  color: var(--text-primary);
}

.theme-toggle:hover {
  background: var(--sidebar-active-bg);
  box-shadow: 0 4px 12px rgba(56,189,248,0.2);
}
`;

css = css.replace('/* ── SECTION ── */', topBarCSS + '\n/* ── SECTION ── */');


// Now we process the many block replacements for CARD and others.
// It's safer to just append them all at the end of the file so they override.
// CSS cascading rule: later declarations override earlier ones.
let appending = `
/* ── REDESIGN APPEND ── */
.card {
  background: var(--glass-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--glass-shadow);
  transition: transform var(--transition),
              box-shadow var(--transition);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.9),
    transparent
  );
}
.card::after { display: none; }

.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--glass-shadow-hover);
}

.stat {
  background: var(--glass-bg-strong);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 1.25rem 1rem;
  text-align: center;
  box-shadow: var(--glass-shadow);
  transition: transform var(--transition);
  position: relative;
  overflow: hidden;
}

.stat:hover {
  transform: translateY(-3px);
  box-shadow: var(--glass-shadow-hover);
}

.stat:nth-child(1) { border-top: 2px solid #38BDF8; box-shadow: var(--glass-shadow); }
.stat:nth-child(2) { border-top: 2px solid #6EE7B7; box-shadow: var(--glass-shadow); }
.stat:nth-child(3) { border-top: 2px solid #A78BFA; box-shadow: var(--glass-shadow); }
.stat:nth-child(4) { border-top: 2px solid #FB923C; box-shadow: var(--glass-shadow); }

.stat-n {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-primary);
}

.stat-l {
  font-size: 0.68rem;
  color: var(--text-secondary);
  margin-top: 4px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.ct {
  font-family: 'Syne', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 1.1rem;
}

.gi {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  outline: none;
  transition: all var(--transition);
  min-height: 44px;
}

.gi::placeholder {
  color: var(--text-muted);
}

.gi:focus {
  border-color: rgba(56,189,248,0.5);
  box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
  background: var(--glass-bg-strong);
}

.gt {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  line-height: 1.7;
  resize: none;
  outline: none;
  transition: all var(--transition);
  min-height: 120px;
}

.gt:focus {
  border-color: rgba(56,189,248,0.5);
  box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
}

.gt::placeholder { color: var(--text-muted); }

.sel {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
  min-height: 44px;
}

.btn {
  background: linear-gradient(135deg, #38BDF8, #0ea5e9);
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  color: white;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all var(--transition);
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.3px;
  min-height: 44px;
  box-shadow: 0 4px 12px rgba(56,189,248,0.3);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(56,189,248,0.4);
}

.btn-g {
  background: linear-gradient(135deg, #6EE7B7, #059669);
  box-shadow: 0 4px 12px rgba(110,231,183,0.3);
  color: white;
}

.btn-ghost {
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  transition: all var(--transition);
  min-height: 44px;
  backdrop-filter: var(--blur);
}

.btn-ghost:hover {
  background: var(--glass-bg);
  box-shadow: var(--glass-shadow);
}

.habit-card {
  padding: 1rem 1.25rem;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}

.habit-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #38BDF8, #6EE7B7);
  border-radius: 0;
}

.habit-card:hover {
  transform: translateX(3px);
  box-shadow: var(--glass-shadow);
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  transition: all var(--transition);
  margin-bottom: 6px;
}

.todo-item:hover {
  transform: translateX(3px);
  box-shadow: var(--glass-shadow);
}

.filter-btn {
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition);
  font-family: 'DM Sans', sans-serif;
}

.filter-btn.active {
  background: var(--glass-bg-strong);
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(56,189,248,0.15);
}

.ph h1 {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

.ph p {
  color: var(--text-secondary);
  font-size: 0.88rem;
  margin-top: 4px;
}

.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 64px;
  background: var(--nav-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border-top: 1px solid var(--glass-border);
  justify-content: space-around;
  align-items: center;
  padding: 0 1rem;
  z-index: 200;
  box-shadow: 0 -4px 24px rgba(100,100,150,0.1);
  flex-direction: row;
}

.bnav-item {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text-secondary);
  font-size: 1.2rem;
}

.bnav-item.active {
  background: var(--sidebar-active-bg);
  color: var(--text-primary);
  box-shadow: 0 4px 12px rgba(56,189,248,0.2);
}

/* ── RESPONSIVE MOBILE OVERRIDES ── */
@media (max-width: 900px) {
  .grid4 { grid-template-columns: 1fr 1fr; }
  .grid3 { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .sb { display: none !important; }
  .bottom-nav { display: flex !important; }

  #app {
    flex-direction: column;
  }

  .main {
    padding: 0.75rem;
    padding-bottom: 80px;
    width: 100%;
  }

  .top-bar {
    border-radius: 0;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
  }

  .grid4 { grid-template-columns: 1fr 1fr; gap: 8px; }
  .grid2 { grid-template-columns: 1fr; }
  .grid3 { grid-template-columns: 1fr; }

  .ph h1 { font-size: 1.3rem; }

  .row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .gi, .btn, .sel, .gt {
    min-height: 44px;
    font-size: 16px;
  }

  .card {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--glass-bg-strong);
    padding: 1rem;
  }

  .stat {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--glass-bg-strong);
  }
}

@media (max-width: 480px) {
  .grid4 { grid-template-columns: 1fr; }
  .ach-grid { grid-template-columns: 1fr 1fr; }
  .main { padding: 0.5rem; padding-bottom: 80px; }
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(56,189,248,0.3);
  border-radius: 4px;
}

.toast {
  background: var(--glass-bg-strong) !important;
  backdrop-filter: var(--blur) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  box-shadow: var(--glass-shadow) !important;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
`;

css += appending;

fs.writeFileSync('src/index.css', css);
