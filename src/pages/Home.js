import React from 'react';
import { Link } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import { hotels } from '../data/hotels';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <h1>Отели</h1>
      <nav className="breadcrumbs">
        <Link to="/">Главная</Link> › <span>Отели</span>
      </nav>
      <div className="hotel-list">
        {hotels.map(h => <HotelCard hotel={h} key={h.id} />)}
      </div>
    </div>
  );
}
