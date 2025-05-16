import React from 'react';
import { Link } from 'react-router-dom';
import './HotelCard.css';

export default function HotelCard({ hotel }) {
  return (
    <div className="hotel-card">
      <img src={hotel.image} alt={hotel.name} />
      <div className="info">
        <h3>{hotel.name}</h3>
        <p>{hotel.description}</p>
        <Link to={`/hotel/${hotel.id}`} className="btn">Выбрать номер</Link>
      </div>
    </div>
  );
}
