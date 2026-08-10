import { useState } from 'react';

export default function ExpandCard({ title, children, defaultOpen = false, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`exp-card ${className}`}>
      <div className="exp-card-header" onClick={() => setOpen(!open)} id={`card-${title.replace(/\s+/g, '-').toLowerCase()}`}>
        <h4>{title}</h4>
        <span className="exp-card-hint">{open ? '(đóng)' : '(mở)'}</span>
        <span className={`exp-chevron ${open ? 'open' : ''}`} />
      </div>
      <div className={`exp-card-body ${open ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
}
