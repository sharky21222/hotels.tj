import React from 'react';

export default function RoomCard({ room }) {
  return (
    <div className="room-card">
      <img src={room.image} alt={room.name} />
      <h4>{room.name}</h4>
      <p>Цена: ${room.price} / ночь</p>
      <button className="btn">Забронировать</button>
    </div>
  );
}
