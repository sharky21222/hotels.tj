import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <span className="lang">Ru ▼</span>
      </div>
      <div className="header-center">
        <Link to="/" className="logo">HOTELS.TJ</Link>
      </div>
      <div className="header-right">
        <span>✉ info@tour.tj</span>
        <span>☎ (+992) 44 650 5500</span>
        <span>👤 Амир Ниязов</span>
      </div>
    </header>
  );
}
