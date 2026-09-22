import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { href: '#book', label: 'Sách 3D', id: 'book' },
  { href: '#minigame', label: 'Mini Game', id: 'minigame' },
  { href: '#chiecnon', label: 'Chiếc Nón Kỳ Diệu', id: 'chiecnon' },
];

export default function Navbar({ activeTab, onTabChange }) {
  const [active, setActive] = useState('#book');

  useEffect(() => {
    const current = activeTab === 'intro' ? 'book' : activeTab;
    setActive(`#${current}`);
  }, [activeTab]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const targetId = id === 'intro' ? 'book' : id;

    if (activeTab !== targetId && onTabChange) {
      onTabChange(targetId);
    }
  };

  const isBook = activeTab === 'book';

  return (
    <div className="navbar-theory-wrapper w-full flex justify-center z-[100] fixed top-6 pointer-events-none px-4">
      <div
        className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-[#3D3529] font-bold tracking-widest text-xs md:text-sm uppercase pointer-events-auto"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontVariantNumeric: 'lining-nums',
          fontFeatureSettings: '"lnum" 1, "tnum" 1',
        }}
      >
        Group 1
      </div>
      <nav className={`navbar-theory pointer-events-auto ${isBook ? 'nav-mode-book' : ''}`}>
        <a
          href="#book"
          className="navbar-brand"
          style={{
            fontVariantNumeric: 'lining-nums',
            fontFeatureSettings: '"lnum" 1, "tnum" 1',
          }}
          onClick={(e) => handleNavClick(e, '#book')}
        >
          <span className="brand-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </span>
          <span
            className="hidden sm:inline"
            style={{
              fontVariantNumeric: 'lining-nums',
              fontFeatureSettings: '"lnum" 1, "tnum" 1',
            }}
          >
            MLN131 · Chương 5
          </span>
          <span
            className="sm:hidden"
            style={{
              fontVariantNumeric: 'lining-nums',
              fontFeatureSettings: '"lnum" 1, "tnum" 1',
            }}
          >
            MLN131
          </span>
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
