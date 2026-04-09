const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

// FIX 4: Avatar in sb-footer
css += `
/* ── FIX 4 ── */
.sb-footer {
  padding-bottom: 1rem !important;
}
.sb-footer .avatar {
  width: 40px !important;
  height: 40px !important;
  flex-shrink: 0 !important;
  overflow: hidden !important;
  margin: 0 auto !important;
}
`;

// FIX 5: Mobile layout completely
// Let's remove the prior "@media (max-width: 768px)" and "(max-width: 480px)" from CSS if present so we can add cleanly
css = css.replace(/@media\s*\(max-width:\s*768px\)\s*\{[\s\S]*?(?=@media|\n\n\n|$)/g, '');
css = css.replace(/@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?(?=@media|\n\n\n|$)/g, '');
css = css.replace(/@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?(?=@media|\n\n\n|$)/g, '');

css += `
/* ── FIX 5 ── */
@media (max-width: 768px) {
  body {
    overflow-x: hidden;
  }

  #app {
    flex-direction: column;
    width: 100%;
  }

  .sb {
    display: none !important;
  }

  .main {
    width: 100% !important;
    max-width: 100vw;
    padding: 0;
    padding-bottom: 74px;
    overflow-x: hidden;
  }

  .top-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    border-radius: 0;
    margin-bottom: 0;
    padding: 12px 16px;
  }

  .section.active {
    padding: 12px 16px;
  }

  .grid4 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .grid2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .grid3 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .card {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: var(--glass-bg-strong) !important;
    border-radius: 16px;
    padding: 1rem;
  }

  .stat {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: var(--glass-bg-strong) !important;
    padding: 1rem 0.75rem;
  }

  .ph {
    margin-bottom: 1rem;
  }

  .ph h1 {
    font-size: 1.4rem;
  }

  .row {
    flex-direction: column;
    gap: 8px;
  }

  .row .gi,
  .row .btn,
  .row .sel {
    width: 100%;
    min-height: 48px;
    font-size: 16px;
  }

  .hamburger-btn {
    display: none !important;
  }
}

@media (max-width: 480px) {
  .grid4 {
    grid-template-columns: 1fr;
  }

  .ach-grid {
    grid-template-columns: 1fr 1fr;
  }
}
`;

// FIX 6: Bottom nav scrollable on mobile
// Remove existing bottom-nav classes
css = css.replace(/\.bottom-nav\s*\{[\s\S]*?\}/g, '');
css = css.replace(/\.bnav-item\s*\{[\s\S]*?\}/g, '');
css = css.replace(/\.bnav-item\.active\s*\{[\s\S]*?\}/g, '');

css += `
/* ── FIX 6 ── */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  z-index: 200;
  box-shadow: 0 -4px 20px rgba(100,100,150,0.1);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 8px;
}

.bottom-nav::-webkit-scrollbar {
  display: none;
}

.bottom-nav-inner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  min-width: max-content;
  gap: 4px;
  padding: 0 8px;
}

.bnav-item {
  width: 52px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  color: var(--text-secondary);
  flex-shrink: 0;
  font-size: 0.6rem;
  gap: 3px;
}

.bnav-item .bnav-icon {
  font-size: 1.1rem;
}

.bnav-item .bnav-label {
  font-size: 0.58rem;
  letter-spacing: 0.3px;
}

.bnav-item.active {
  background: var(--sidebar-active-bg);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .bottom-nav {
    display: block !important;
  }
}
`;

// FIX 7: Smooth scroll behavior
css += `
/* ── FIX 7 ── */
html {
  scroll-behavior: smooth;
}

.main {
  scroll-behavior: smooth;
}
`;

fs.writeFileSync('src/index.css', css);
