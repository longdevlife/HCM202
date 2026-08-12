import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { href: '#hero', label: 'Nhà nước dân chủ' },
  { href: '#book', label: 'Tạp chí' },
  { href: '#museum', label: 'Bảo tàng' },
  { href: '#minigame', label: 'Mini Game' },
  { href: '#ai', label: 'AI Usage' },
];

export default function Navbar({ activeTab, onTabChange }) {
  const [active, setActive] = useState('#hero');

  useEffect(() => {
    if (activeTab === 'book') {
      setActive('#book');
      return;
    }
    if (activeTab === 'museum') {
      setActive('#museum');
      return;
    }
    if (activeTab === 'minigame') {
      setActive('#minigame');
      return;
    }
    if (activeTab === 'ai') {
      setActive('#ai');
      return;
    }
    
    setActive('#hero');
  }, [activeTab]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const id = href.replace('#', '');
    
    // Switch to Book Tab
    if (id === 'book') {
      if (activeTab !== 'book' && onTabChange) {
        onTabChange('book');
      }
      return;
    }

    // Switch to Museum Tab
    if (id === 'museum') {
      if (activeTab !== 'museum' && onTabChange) {
        onTabChange('museum');
      }
      return;
    }

    // Switch to Minigame Tab
    if (id === 'minigame') {
      if (activeTab !== 'minigame' && onTabChange) {
        onTabChange('minigame');
      }
      return;
    }

    // Switch to AI Usage Tab
    if (id === 'ai') {
      if (activeTab !== 'ai' && onTabChange) {
        onTabChange('ai');
      }
      return;
    }

    // Handing clicks to Intro Tab sections while currently on another Tab
    if (activeTab !== 'intro' && id !== 'book' && id !== 'museum' && id !== 'minigame' && id !== 'ai') {
      if (onTabChange) {
        onTabChange('intro');
      }
      // Give DOM time to render IntroPage then scroll
      setTimeout(() => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }

    // Normal internal scroll within Intro Tab
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(href);
    }
  };

  const isBook = activeTab === 'book';

  return (
    <div className="navbar-theory-wrapper w-full flex justify-center z-[100] fixed top-6 pointer-events-none">
      <nav className={`navbar-theory pointer-events-auto ${isBook ? 'nav-mode-book' : ''}`}>
        <a href="#hero" className="navbar-brand" onClick={(e) => handleNavClick(e, '#hero')}>
          <span className="brand-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </span>
          <span>Tư Tưởng Hồ Chí Minh</span>
        </a>

        <ul className="navbar-nav">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={active === l.href ? 'active group' : 'group'}
                onClick={(e) => handleNavClick(e, l.href)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
