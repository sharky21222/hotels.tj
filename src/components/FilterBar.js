import React from 'react';
import './FilterBar.css';

export default function FilterBar() {
  return (
    <div className="filterbar">
      <select><option>Душанбе</option><option>Пенджикент</option></select>
      <input type="date" />
      <span>→</span>
      <input type="date" />
      <select><option>2 взрослых</option><option>3 взрослых</option></select>
      <button className="find-btn">Найти</button>
    </div>
  );
}
